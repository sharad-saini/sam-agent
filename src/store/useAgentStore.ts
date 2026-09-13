import { create } from 'zustand';
import type {
  AgentState,
  AgentDetailedState,
  TaskItem,
  ApprovalRequest,
  AgentEvent,
} from '../types';

interface AgentStoreState {
  // Authoritative synced agent state
  agentState: AgentState | null;

  // UI specific state
  status: AgentDetailedState;
  selectedTaskId: string | null;
  activeApproval: ApprovalRequest | null;
  isDemoMode: boolean;
  isConnected: boolean;
  eventStream: AgentEvent[];

  // Actions
  setAgentState: (state: AgentState) => void;
  setStatus: (status: AgentDetailedState) => void;
  selectTask: (taskId: string | null) => void;
  setActiveApproval: (approval: ApprovalRequest | null) => void;
  setDemoMode: (isDemo: boolean) => void;
  setConnected: (connected: boolean) => void;
  addEvent: (event: AgentEvent) => void;
  clearEvents: () => void;
  resetUI: () => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  agentState: null,
  status: 'IDLE',
  selectedTaskId: null,
  activeApproval: null,
  isDemoMode: false,
  isConnected: false,
  eventStream: [],

  setAgentState: (state) => set({ agentState: state, status: state.status || 'IDLE' }),
  setStatus: (status) => set({ status }),
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  setActiveApproval: (approval) => set({ activeApproval: approval }),
  setDemoMode: (isDemo) => set({ isDemoMode: isDemo }),
  setConnected: (connected) => set({ isConnected: connected }),
  addEvent: (event) => set((prev) => ({ eventStream: [event, ...prev.eventStream].slice(0, 100) })),
  clearEvents: () => set({ eventStream: [] }),
  resetUI: () =>
    set({
      agentState: null,
      status: 'IDLE',
      selectedTaskId: null,
      activeApproval: null,
      eventStream: [],
    }),
}));
