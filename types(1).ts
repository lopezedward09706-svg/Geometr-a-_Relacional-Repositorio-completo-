
export type NodeType = 'a' | 'b' | 'c';

export interface ABCNode {
    id: number;
    type: NodeType;
    x: number;
    y: number;
    charge: number;
    color: string;
    energy: number;
    velocity: { x: number; y: number };
    accumulatedAction: number;
    vibrationPhase: number;
    vibrationFreq: number;
    radiusField: number;
    // v3.0 visualization properties
    isCollapsed?: boolean;
    zeta?: number;
    superposition?: number;
    vecA?: { x: number; y: number; z: number };
    vecB?: { x: number; y: number; z: number };
    vecC?: { x: number; y: number; z: number };
}

export interface Quark {
    id: number;
    type: 'up' | 'down' | 'strange' | 'unknown';
    charge: number;
    nodes: number[];
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    color: string;
}

export interface SimulationParameters {
    scale: number;
    n_abc: number;
    centralMass: number;
    timeSpeed: number;
    velocity: number; 
    density: number;
    strongEnergy: number;
    weakEnergy: number;
    radioPi: number;
    evolutionRate: number;
    dimensionCount: number;
}

export interface GlobalState {
    nodes: ABCNode[];
    quarks: Quark[];
    time: number;
    running: boolean;
    parameters: SimulationParameters;
    statistics: {
        meanEnergy: number;
        stdDevEnergy: number;
        entropy: number;
        complexity: number;
        entanglementIndex: number;
        coherenceLevel: number;
    };
    fabricDeformation: number[][];
    spaceship: { x: number; y: number; v: number; };
    entangledPairs: [number, number][];
    sharedMemory: {
        ia1Draft: string;
        ia2Draft: string;
        errors: string[];
        patches: string[];
        userDeductions: string;
        evolutionLogs: string[];
        pendingActions: string[];
        realDataRefs: any[];
    };
    recentCollapses: { x: number; y: number; time: number }[];
}

export interface ChatMessage {
    sender: string;
    message: string;
    color: string;
    timestamp: Date;
}

export interface IAState {
    confidence: number;
    running: boolean;
    lastResponse?: string;
    status: 'idle' | 'scanning' | 'repairing' | 'error' | 'evolving' | 'searching' | 'collapsing';
}

export interface TheoryTestResult {
    name: string;
    description: string;
    passed: boolean;
    value: number;
    target: string;
    details: string;
}
