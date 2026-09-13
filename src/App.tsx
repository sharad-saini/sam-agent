import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { WorkflowPipeline } from './components/WorkflowPipeline';
import { GoalInputPanel } from './components/GoalInputPanel';
import { TaskPlanPanel } from './components/TaskPlanPanel';
import { ActivityLogStream } from './components/ActivityLogStream';
import { ToolPanel } from './components/ToolPanel';
import { FinalResultView } from './components/FinalResultView';
import { AdaptationPanel } from './components/AdaptationPanel';
import { TestSuiteModal } from './components/TestSuiteModal';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { LandingHeroModal } from './components/LandingHeroModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { useAgentStore } from './store/useAgentStore';
import type {
  AgentState,
  AgentDetailedState,
  TaskItem,
  ActivityLogItem,
  AgentConfig,
  ApprovalRequest,
  FinalResult,
  AgentEvent,
} from './types';

const defaultState: AgentState = {
  id: 'init-state',
  goal: '',
  stage: 'IDLE',
  status: 'IDLE',
  tasks: [],
  currentTaskId: null,
  activeTool: null,
  logs: [],
  toolHistory: [],
  hasAdapted: false,
  retriesCount: 0,
  adaptations: [],
  verification: null,
  config: {
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
  memoryFacts: [],
  approvalRequest: null,
  finalResult: null,
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    retries: 0,
    toolsUsedCount: 0,
    adaptationsCount: 0,
    executionTimeSec: 0,
    avgConfidence: 0.95,
    successRate: 100,
  },
};

export default function App() {
  const [state, setState] = useState<AgentState>(defaultState);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showStory, setShowStory] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showTestSuite, setShowTestSuite] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<AgentState[]>([]);

  // EventSource ref for SSE connection
  const eventSourceRef = useRef<EventSource | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Load history on mount
  useEffect(() => {
    fetch('/api/agent/history')
      .then(res => res.json())
      .then(data => {
        if (data.history && Array.isArray(data.history)) {
          setHistoryList(data.history);
        }
      })
      .catch(() => {
        // Fallback to local
      });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const addLog = (
    type: ActivityLogItem['type'],
    message: string,
    detail?: string,
    taskId?: string
  ) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      detail,
      taskId,
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog],
    }));
  };

  // Reset to initial state
  const handleReset = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsExecuting(false);
    useAgentStore.getState().resetUI();
    setState({
      ...defaultState,
      id: `run-${Date.now()}`,
      logs: [
        {
          id: `log-reset`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: 'System ready. Enter an objective or click [Run Hackathon Demo].',
        },
      ],
    });
  };

  // Unified Agent Execution via Authoritative Backend State Machine & SSE
  const startAgentRun = async (goal: string, isDemo: boolean = false, config?: AgentConfig) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsExecuting(true);
    startTimeRef.current = Date.now();
    const store = useAgentStore.getState();
    store.setDemoMode(isDemo);
    store.clearEvents();

    addLog('goal', isDemo ? 'Initiating Hackathon Demo: Autonomous O-D-A-E-A-V Loop' : `Perceiving objective: "${goal}"`);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          isDemo,
          forceDemoFailures: isDemo,
          config,
        }),
      });

      const json = await response.json();
      if (!json.success || !json.runId) {
        throw new Error(json.error || 'Failed to start agent orchestrator');
      }

      const runId = json.runId;
      if (json.state) {
        setState(json.state);
        store.setAgentState(json.state);
      }
      store.setConnected(true);

      // Connect to SSE stream
      const es = new EventSource(`/api/agent/${runId}/events`);
      eventSourceRef.current = es;

      const syncWithBackend = () => {
        fetch(`/api/agent/${runId}`)
          .then(r => r.json())
          .then(res => {
            if (res.success && res.state) {
              setState(res.state);
              store.setAgentState(res.state);
              if (res.state.approvalRequest) {
                store.setActiveApproval(res.state.approvalRequest);
              } else {
                store.setActiveApproval(null);
              }
              if (res.state.stage === 'COMPLETED' || res.state.stage === 'FAILED') {
                setIsExecuting(false);
                if (eventSourceRef.current) {
                  eventSourceRef.current.close();
                  eventSourceRef.current = null;
                }
                store.setConnected(false);
              }
            }
          })
          .catch(() => {});
      };

      const handleEvent = (type: string, payload: any) => {
        const agentEvt: AgentEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          type: type as any,
          payload,
        };
        store.addEvent(agentEvt);
        syncWithBackend();
      };

      const eventTypes = [
        'GOAL_RECEIVED', 'GOAL_ANALYZED', 'PLAN_CREATED', 'TASK_STARTED',
        'TOOL_SELECTED', 'TOOL_EXECUTED', 'TOOL_COMPLETED', 'OBSERVATION_CREATED',
        'OBSERVATION_RECORDED', 'EVALUATION_COMPLETED', 'TASK_EVALUATED',
        'WAITING_APPROVAL', 'APPROVAL_REQUIRED', 'APPROVAL_RESOLVED',
        'ADAPTATION_TRIGGERED', 'PLAN_ADAPTED', 'PLAN_UPDATED', 'TASK_RETRIED',
        'TASK_COMPLETED', 'VERIFICATION_STARTED', 'VERIFICATION_COMPLETED',
        'GOAL_COMPLETED', 'RUN_COMPLETED', 'SAFE_TERMINATION', 'STATE_CHANGED'
      ];

      eventTypes.forEach(evtName => {
        es.addEventListener(evtName, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            handleEvent(evtName, data.payload || data);
          } catch (_) {}
        });
      });

      es.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handleEvent(data.type || 'STATE_CHANGED', data.payload || data);
        } catch (_) {}
      };

      es.onerror = () => {
        // SSE may close naturally upon run completion
        syncWithBackend();
      };

    } catch (err: any) {
      console.error('Run Error:', err);
      setIsExecuting(false);
      store.setConnected(false);
      addLog('failure', `Execution error: ${err.message}`);
    }
  };

  // Run Hackathon Demo Blueprint
  const handleRunDemo = () => {
    startAgentRun(
      'Research and compare the best productivity tools for a student team and recommend the best option.',
      true
    );
  };

  // Handle Human Safety Approval
  const handleApproveAction = async (_id: string) => {
    try {
      await fetch('/api/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: state.id, approved: true }),
      });
      setState(prev => ({ ...prev, approvalRequest: null }));
      useAgentStore.getState().setActiveApproval(null);
      addLog('approval', 'Human Operator Approved Sensitive Action: Proceeding with execution');
    } catch (err: any) {
      console.error('Approve error:', err);
    }
  };

  const handleRejectAction = async (_id: string) => {
    try {
      await fetch('/api/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId: state.id, approved: false }),
      });
      setState(prev => ({ ...prev, approvalRequest: null }));
      useAgentStore.getState().setActiveApproval(null);
      addLog('approval', 'Human Operator Rejected Action: Controlled safe termination triggered');
    } catch (err: any) {
      console.error('Reject error:', err);
    }
  };

  // Run Custom Goal via Authoritative Backend State Machine
  const handleRunCustomGoal = (goal: string, config: AgentConfig) => {
    startAgentRun(goal, false, config);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        stage={state.stage}
        detailedState={state.status}
        isExecuting={isExecuting}
        onRunDemo={handleRunDemo}
        onNewTask={handleReset}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenStory={() => setShowStory(true)}
        onOpenTests={() => setShowTestSuite(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Dynamic Workflow Pipeline Bar */}
        <WorkflowPipeline
          currentStage={state.stage}
          hasAdapted={state.hasAdapted}
          activeTaskId={state.currentTaskId}
          retriesCount={state.retriesCount}
        />

        {/* If in IDLE and no final result: Show Goal Input Panel on top */}
        {state.stage === 'IDLE' && !state.finalResult && (
          <GoalInputPanel
            onRunGoal={handleRunCustomGoal}
            onRunDemo={handleRunDemo}
            isExecuting={isExecuting}
          />
        )}

        {/* Dedicated Adaptation & Self-Healing Panel (Section 18) */}
        {((state.adaptations && state.adaptations.length > 0) || state.hasAdapted) && (
          <AdaptationPanel
            adaptations={state.adaptations || []}
            isAdapting={state.stage === 'ADAPT' || state.status === 'ADAPTING'}
          />
        )}

        {/* If Final Result is Ready: Show Final Result View */}
        {state.finalResult && (
          <FinalResultView
            result={state.finalResult}
            stats={state.stats}
            goal={state.goal}
            onReset={handleReset}
          />
        )}

        {/* Main Operational Workspace: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Task Plan & Tool Grid */}
          <div className="lg:col-span-7 space-y-6">
            <TaskPlanPanel
              tasks={state.tasks}
              currentTaskId={state.currentTaskId}
              onSelectTask={task => setSelectedTask(task)}
            />

            <ToolPanel
              activeTool={state.activeTool}
              toolHistory={state.toolHistory}
              memoryFactsCount={state.memoryFacts.length}
            />
          </div>

          {/* Right Column: Real-Time Activity Log & Goal Perception */}
          <div className="lg:col-span-5 space-y-6">
            {/* Goal Perception Card if active */}
            {state.goal && (
              <div className="p-4 rounded-2xl bg-[#0E1526]/90 border border-slate-800/90 text-xs font-mono">
                <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1 tracking-wider">
                  Active Objective
                </div>
                <div className="text-slate-200 font-sans font-semibold mb-2">
                  "{state.goal}"
                </div>
                {state.goalAnalysis && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500">Constraints: </span>
                      {state.goalAnalysis.constraints.slice(0, 2).join('; ')}
                    </div>
                    <div>
                      <span className="text-slate-500">Risk Level: </span>
                      <span className="text-emerald-400 font-bold uppercase">
                        {state.goalAnalysis.risk_level}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Stream */}
            <ActivityLogStream logs={state.logs} isExecuting={isExecuting} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>SAM Core v1.0 — Agentic AI Hackathon Edition</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>OBSERVE → DECIDE → ACT → EVALUATE → ADAPT → VERIFY</span>
        </div>
      </footer>

      {/* Modals */}
      <HumanApprovalModal
        approval={state.approvalRequest}
        onApprove={handleApproveAction}
        onReject={handleRejectAction}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <LandingHeroModal
        isOpen={showStory}
        onClose={() => setShowStory(false)}
        onRunDemo={() => {
          setShowStory(false);
          handleRunDemo();
        }}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={state.config}
        onSaveConfig={cfg => setState(prev => ({ ...prev, config: cfg }))}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={historyList}
        onLoadRun={run => setState(run)}
      />

      <TestSuiteModal
        isOpen={showTestSuite}
        onClose={() => setShowTestSuite(false)}
      />
    </div>
  );
}
