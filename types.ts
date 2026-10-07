
export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  load: number;
  lastAction: string;
  category: 'research' | 'analysis' | 'code' | 'core';
}

export interface NetworkTask {
  id: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  progress: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
}
