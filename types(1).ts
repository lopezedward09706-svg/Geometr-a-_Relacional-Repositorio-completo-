
export type NodeState = 'a' | 'b' | 'c' | 'A' | 'B' | 'C';

export interface ABCNode {
  id: number;
  x: number;
  y: number;
  z: number;
  state: NodeState;
  energy: number;
  isExcited: boolean;
  connections: number[];
}

export interface ABCEdge {
  id: number;
  node1: number;
  node2: number;
  length: number;
  naturalLength: number;
  tension: number;
  color: string;
}

export interface ABCTriangle {
  id: number;
  nodes: [number, number, number];
  states: [NodeState, NodeState, NodeState];
  curvature: number;
}

export interface MassPoint {
  id: number;
  position: { x: number; y: number; z: number };
  composition: { A: number; b: number; c: number };
  totalMass: number;
}

export interface SimulationMetrics {
  tick: number;
  totalEnergy: number;
  avgCurvature: number;
  radialDeform: number;
  numExcited: number;
}

export interface ValidationResult {
  predicted: number;
  actual: number;
  error: number;
  status: 'success' | 'warning' | 'error';
}

export interface GlobalState {
  a: number;
  b: number;
  c: number;
  alpha: number;
  alpha_w: number;
  alpha_s: number;
  currentTick: number;
  isRunning: boolean;
  nodes: ABCNode[];
  edges: ABCEdge[];
  triangles: ABCTriangle[];
  massPoints: MassPoint[];
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
