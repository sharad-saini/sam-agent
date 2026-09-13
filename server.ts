import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  generateHackathonDemoSteps,
  planAndExecuteCustomGoal,
  ToolBox,
} from './server/agentEngine';
import { AgentOrchestrator } from './src/lib/agent/agent';
import { getAllTools, toolRegistry } from './src/lib/tools';
import { db } from './src/lib/db/database';
import type { AgentState, AgentConfig, AgentEvent } from './src/types';

// In-memory active orchestrators and history store
const activeRuns = new Map<string, AgentOrchestrator>();
const runEventClients = new Map<string, Array<(event: AgentEvent) => void>>();
const runEventHistory = new Map<string, AgentEvent[]>();
const agentHistory: AgentState[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      agent: 'SAM: Self-operating AI Manager',
      timestamp: new Date().toISOString(),
      geminiConnected: Boolean(process.env.GEMINI_API_KEY),
      activeRunsCount: activeRuns.size,
    });
  });

  // Tools Registry Endpoint (Section 41)
  app.get('/api/tools', (req, res) => {
    try {
      const tools = getAllTools().map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        outputSchema: t.outputSchema,
        riskLevel: t.riskLevel,
      }));
      res.json({ success: true, tools });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Start a new agent run (Section 34)
  app.post('/api/agent', async (req, res) => {
    try {
      const { goal, isDemo, forceDemoFailures, config } = req.body;
      if (!goal || typeof goal !== 'string') {
        res.status(400).json({ success: false, error: 'Valid goal string required' });
        return;
      }

      const orchestrator = new AgentOrchestrator(goal, Boolean(isDemo), config);
      const state = orchestrator.getState();
      const runId = state.id;
      activeRuns.set(runId, orchestrator);
      runEventHistory.set(runId, []);

      // Save initial run in database
      db.saveRun({
        id: runId,
        goal,
        status: state.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Hook up event broadcaster
      orchestrator.setCallbacks({
        onEvent: (event) => {
          const history = runEventHistory.get(runId) || [];
          history.push(event);
          runEventHistory.set(runId, history);

          const listeners = runEventClients.get(runId) || [];
          listeners.forEach(fn => {
            try { fn(event); } catch (_) {}
          });
        },
        onStateChange: (updatedState) => {
          db.saveRun({
            id: runId,
            goal: updatedState.goal,
            status: updatedState.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            final_result: updatedState.finalResult,
          });
          const existingIdx = agentHistory.findIndex(h => h.id === runId);
          if (existingIdx >= 0) {
            agentHistory[existingIdx] = updatedState;
          } else {
            agentHistory.unshift(updatedState);
            if (agentHistory.length > 50) agentHistory.pop();
          }
        },
      });

      // Asynchronously trigger execution
      setTimeout(() => {
        orchestrator.run({ forceDemoFailures: Boolean(forceDemoFailures) }).catch(err => {
          console.error(`[Orchestrator ${runId}] Error:`, err);
        });
      }, 50);

      res.status(201).json({
        success: true,
        runId,
        state,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get specific run state (Section 34)
  app.get('/api/agent/:runId', (req, res) => {
    const { runId } = req.params;
    const orchestrator = activeRuns.get(runId);
    if (orchestrator) {
      res.json({ success: true, state: orchestrator.getState() });
      return;
    }

    const savedRun = db.getRun(runId);
    if (savedRun) {
      res.json({ success: true, run: savedRun });
      return;
    }

    const inHistory = agentHistory.find(h => h.id === runId);
    if (inHistory) {
      res.json({ success: true, state: inHistory });
      return;
    }

    res.status(404).json({ success: false, error: `Run ${runId} not found` });
  });

  // Relational Audit Trail for Run (Section 17)
  app.get('/api/agent/:runId/audit', (req, res) => {
    const { runId } = req.params;
    const audit = db.getRunAuditTrail(runId);
    res.json({ success: true, audit });
  });

  // SSE Stream for Run Events (Section 34)
  app.get('/api/agent/:runId/events', (req, res) => {
    const { runId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: AgentEvent) => {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    };

    const listeners = runEventClients.get(runId) || [];
    listeners.push(sendEvent);
    runEventClients.set(runId, listeners);

    // Initial connection ack
    sendEvent({
      id: `evt_init_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'STATE_CHANGED',
      payload: { message: `Connected to event stream for run ${runId}` },
    });

    // Replay historical events so late subscribers catch up immediately
    const history = runEventHistory.get(runId) || [];
    history.forEach(evt => {
      sendEvent(evt);
    });

    req.on('close', () => {
      const currentListeners = runEventClients.get(runId) || [];
      runEventClients.set(runId, currentListeners.filter(fn => fn !== sendEvent));
    });
  });

  // Approval Endpoint (Section 34)
  app.post('/api/approval', (req, res) => {
    const { runId, approved } = req.body;
    if (!runId) {
      res.status(400).json({ success: false, error: 'runId required' });
      return;
    }

    const orchestrator = activeRuns.get(runId);
    if (orchestrator) {
      orchestrator.resolveApproval(Boolean(approved));
      res.json({ success: true, approved: Boolean(approved) });
      return;
    }

    res.status(404).json({ success: false, error: 'Active run not found or approval resolved' });
  });

  // Hackathon Demo Blueprint
  app.get('/api/agent/demo-blueprint', (req, res) => {
    try {
      const demoData = generateHackathonDemoSteps();
      res.json({
        success: true,
        data: {
          ...demoData,
          initialTasks: demoData.tasks,
          steps: demoData.stepsSequence,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Direct tool testing API
  app.post('/api/agent/tool-execute', async (req, res) => {
    try {
      const { tool, input } = req.body;
      let output: any;

      if (tool === 'web_search') {
        output = await ToolBox.webSearch(input?.query || 'productivity tools');
      } else if (tool === 'calculator') {
        output = ToolBox.calculate(input?.expression || '1 + 1');
      } else if (tool === 'code_executor') {
        output = ToolBox.executeCode(input?.code || 'return 42;');
      } else if (tool === 'data_processor') {
        output = ToolBox.processData(input?.dataset || [], input?.operation || 'multi_criteria_scoring');
      } else if (tool === 'document_generator') {
        output = ToolBox.generateDocument(input?.title || 'Report', input?.sections || []);
      } else {
        output = { status: 'unknown_tool', tool };
      }

      res.json({ success: true, tool, output });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Custom Goal Execution with Server-Sent Events (SSE) streaming
  app.post('/api/agent/run-sse', async (req, res) => {
    const { goal, config } = req.body as { goal: string; config?: AgentConfig };

    if (!goal || typeof goal !== 'string') {
      res.status(400).json({ error: 'Goal string is required' });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('start', { message: 'Agent loop initiated', goal });

      const finalResult = await planAndExecuteCustomGoal(
        goal,
        config || {
          autonomy: 'autonomous',
          requireApproval: true,
          maxSteps: 5,
          maxRetries: 2,
          enabledTools: {
            web_search: true,
            calculator: true,
            code_executor: true,
            document_generator: true,
            data_processor: true,
            memory: true,
            human_approval: true,
          },
          webAccess: true,
          codeExecution: true,
        },
        (stepUpdate) => {
          sendEvent('step', stepUpdate);
        }
      );

      sendEvent('done', { finalResult });
      res.end();
    } catch (err: any) {
      sendEvent('error', { error: err.message });
      res.end();
    }
  });

  // History Endpoints
  app.get('/api/agent/history', (req, res) => {
    res.json({
      success: true,
      history: agentHistory,
    });
  });

  app.post('/api/agent/history', (req, res) => {
    const runState = req.body as AgentState;
    if (runState && runState.id) {
      // Keep last 50 runs
      const existingIdx = agentHistory.findIndex(h => h.id === runState.id);
      if (existingIdx >= 0) {
        agentHistory[existingIdx] = runState;
      } else {
        agentHistory.unshift(runState);
        if (agentHistory.length > 50) agentHistory.pop();
      }
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAM Agent Core] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SAM Server] Fatal startup error:', err);
  process.exit(1);
});
