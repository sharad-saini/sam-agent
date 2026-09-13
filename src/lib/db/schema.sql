-- SAM (Self-operating AI Manager) PostgreSQL Schema for Supabase
-- Tech Zephyr 4.0 Hackathon Submission (IIT Bhubaneswar)

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  final_result JSONB
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  dependencies JSONB DEFAULT '[]'::jsonb,
  success_criteria TEXT,
  selected_tool TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_run_id ON agent_tasks(run_id);

CREATE TABLE IF NOT EXISTS tool_executions (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_executions_run_id ON tool_executions(run_id);

CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  confidence FLOAT DEFAULT 1.0,
  missing_information JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_observations_run_id ON observations(run_id);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  confidence FLOAT DEFAULT 1.0,
  reason TEXT,
  recommended_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_run_id ON evaluations(run_id);

CREATE TABLE IF NOT EXISTS adaptations (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  problem TEXT NOT NULL,
  old_strategy TEXT,
  new_strategy TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adaptations_run_id ON adaptations(run_id);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES agent_runs(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_run_id ON approvals(run_id);
