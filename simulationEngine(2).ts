
import { ABCNode, Quark, SimulationParameters, GlobalState, NodeType } from '../types';
import { PLANCK_ENERGY } from '../constants';

const MathUtils = {
    gaussian: () => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },
    dist: (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x1-x2)**2 + (y1-y2)**2)
};

export class SimulationEngine {
    state: GlobalState;
    private idCounter = 0;
    private gridRes = 24;

    constructor(params: SimulationParameters) {
        this.state = {
            nodes: [], quarks: [], time: 0, running: false,
            parameters: { ...params },
            statistics: { meanEnergy: 0, stdDevEnergy: 0, entropy: 0, complexity: 0, entanglementIndex: 0, coherenceLevel: 1.0 },
            fabricDeformation: [],
            spaceship: { x: -1.2, y: 0.6, v: 0.8 },
            entangledPairs: [],
            sharedMemory: { 
                ia1Draft: "", ia2Draft: "", errors: [], patches: [], 
                userDeductions: "", evolutionLogs: [], pendingActions: [], realDataRefs: [] 
            },
            recentCollapses: []
        };
        this.initializeNodes();
        this.initializeGrid();
    }

    private initializeGrid() {
        this.state.fabricDeformation = Array(this.gridRes + 1).fill(0).map(() => Array(this.gridRes + 1).fill(0));
    }

    initializeNodes() {
        this.state.nodes = [];
        this.state.quarks = [];
        this.state.entangledPairs = [];
        const p = this.state.parameters;
        const isMaya = p.scale === 1; 

        for (let i = 0; i < p.n_abc * 3; i++) {
            let x, y;
            if (isMaya) {
                const rows = Math.sqrt(p.n_abc * 3);
                x = ((i % rows) / rows) * 2 - 1;
                y = (Math.floor(i / rows) / rows) * 2 - 1;
            } else {
                const angle = (i / (p.n_abc * 3)) * Math.PI * 2;
                const r = (0.2 + MathUtils.gaussian() * 0.1) * (1 / p.density);
                x = r * Math.cos(angle);
                y = r * Math.sin(angle);
            }

            const type: NodeType = i % 3 === 0 ? 'a' : i % 3 === 1 ? 'b' : 'c';
            this.state.nodes.push({
                id: ++this.idCounter, type, x, y,
                charge: type === 'a' ? 0.66 : type === 'b' ? -0.22 : -0.11,
                color: type === 'a' ? '#FF4444' : type === 'b' ? '#4444FF' : '#44FF44',
                energy: PLANCK_ENERGY,
                velocity: { x: MathUtils.gaussian() * 0.005, y: MathUtils.gaussian() * 0.005 },
                accumulatedAction: 0, vibrationPhase: Math.random() * Math.PI * 2,
                vibrationFreq: (5 + Math.random() * 5) * p.radioPi,
                radiusField: (0.05 + Math.random() * 0.05) * p.radioPi,
                isCollapsed: false,
                zeta: 1.0 + Math.random() * 0.1,
                superposition: 1.0,
                vecA: { x: 1, y: 0, z: 0 },
                vecB: { x: -0.5, y: 0.866, z: 0 },
                vecC: { x: -0.5, y: -0.866, z: 0 }
            });
        }
    }

    update() {
        const dt = 0.016 * this.state.parameters.timeSpeed;
        this.state.time += dt;
        
        this.updateFabric();
        this.updateNodes(dt);
        this.updateWaveFunctionCollapse(dt);
        this.updateEntanglement(dt);
        this.calculateStats();

        // Cleanup old collapses
        this.state.recentCollapses = this.state.recentCollapses.filter(c => this.state.time - c.time < 1.0);
    }

    private updateFabric() {
        const mass = this.state.parameters.centralMass;
        for (let i = 0; i <= this.gridRes; i++) {
            for (let j = 0; j <= this.gridRes; j++) {
                const x = (i/this.gridRes)*2-1; const y = (j/this.gridRes)*2-1;
                const r = Math.sqrt(x*x + y*y);
                const dimCount = this.state.parameters.dimensionCount ?? 3;
                const dimFactor = dimCount / 3;
                this.state.fabricDeformation[i][j] = Math.min(1.0, (mass * 0.2 * dimFactor) / (r + 0.1));
            }
        }
    }

    private updateNodes(dt: number) {
        const p = this.state.parameters;
        const mass = p.centralMass;

        this.state.nodes.forEach(n => {
            n.vibrationPhase += n.vibrationFreq * dt * 5;
            const r = Math.sqrt(n.x*n.x + n.y*n.y);
            
            if (r > 0.01) {
                const force = mass * 0.01 / (r * r + 0.1);
                n.velocity.x -= (n.x/r) * force * dt;
                n.velocity.y -= (n.y/r) * force * dt;
            }

            n.x += n.velocity.x * dt;
            n.y += n.velocity.y * dt;

            n.velocity.x *= (1 - 0.01 * p.density);
            n.velocity.y *= (1 - 0.01 * p.density);

            if (Math.abs(n.x) > 1.3) n.velocity.x *= -0.8;
            if (Math.abs(n.y) > 0.9) n.velocity.y *= -0.8;
        });
    }

    private updateWaveFunctionCollapse(dt: number) {
        const p = this.state.parameters;
        const collapseRadius = 0.04 * p.radioPi;
        const collapseProb = 0.01 * p.strongEnergy * dt;

        if (Math.random() < collapseProb) {
            const freeNodes = this.state.nodes.filter(n => !n.isCollapsed && !this.state.quarks.some(q => q.nodes.includes(n.id)));
            for (let i = 0; i < freeNodes.length; i++) {
                const n1 = freeNodes[i];
                const nearby = freeNodes.filter(n2 => !n2.isCollapsed && n2.id !== n1.id && MathUtils.dist(n1.x, n1.y, n2.x, n2.y) < collapseRadius);
                
                if (nearby.length >= 2) {
                    const trio = [n1];
                    const typesFound = new Set([n1.type]);
                    
                    for (const n of nearby) {
                        if (!typesFound.has(n.type)) {
                            typesFound.add(n.type);
                            trio.push(n);
                        }
                        if (trio.length === 3) break;
                    }

                    if (trio.length === 3) {
                        this.state.quarks.push({
                            id: ++this.idCounter,
                            type: 'up',
                            charge: 0.66,
                            nodes: trio.map(n => n.id),
                            position: { x: trio[0].x, y: trio[0].y },
                            velocity: { x: 0, y: 0 },
                            color: '#FFCC00'
                        });
                        
                        trio.forEach(n => { n.isCollapsed = true; });
                        this.state.recentCollapses.push({ x: trio[0].x, y: trio[0].y, time: this.state.time });
                        
                        this.state.sharedMemory.evolutionLogs.push("IA5: Materia detectada. Colapso de onda exitoso.");
                        break;
                    }
                }
            }
        }
    }

    private updateEntanglement(dt: number) {
        const p = this.state.parameters;
        const entanglementRadius = 0.06 * p.radioPi;
        
        this.state.entangledPairs = this.state.entangledPairs.filter(([id1, id2]) => {
            const n1 = this.state.nodes.find(n => n.id === id1);
            const n2 = this.state.nodes.find(n => n.id === id2);
            return n1 && n2 && MathUtils.dist(n1.x, n1.y, n2.x, n2.y) < entanglementRadius * 3;
        });

        if (this.state.nodes.length > 2 && Math.random() < 0.1 * p.weakEnergy) {
            const n1 = this.state.nodes[Math.floor(Math.random() * this.state.nodes.length)];
            const nearby = this.state.nodes.filter(n2 => n2.id !== n1.id && MathUtils.dist(n1.x, n1.y, n2.x, n2.y) < entanglementRadius);
            
            if (nearby.length > 0) {
                const n2 = nearby[Math.floor(Math.random() * nearby.length)];
                if (!this.state.entangledPairs.some(pair => pair.includes(n1.id) && pair.includes(n2.id))) {
                    this.state.entangledPairs.push([n1.id, n2.id]);
                }
            }
        }

        this.state.entangledPairs.forEach(([id1, id2]) => {
            const n1 = this.state.nodes.find(n => n.id === id1);
            const n2 = this.state.nodes.find(n => n.id === id2);
            if (n1 && n2) {
                const avgFreq = (n1.vibrationFreq + n2.vibrationFreq) / 2;
                n1.vibrationFreq = avgFreq;
                n2.vibrationFreq = avgFreq;
                
                const diff = n1.vibrationPhase - n2.vibrationPhase;
                n1.vibrationPhase -= diff * 0.05;
                n2.vibrationPhase += diff * 0.05;
            }
        });
    }

    private calculateStats() {
        const n = this.state.nodes.length || 1;
        const energies = this.state.nodes.map(node => 0.5 * (node.velocity.x**2 + node.velocity.y**2));
        const mean = energies.reduce((a, b) => a + b, 0) / n;
        
        this.state.statistics = {
            meanEnergy: mean,
            stdDevEnergy: Math.sqrt(energies.reduce((a, b) => a + (b - mean)**2, 0) / n),
            entropy: Math.log(mean + 1.1),
            complexity: (this.state.quarks.length * 15) / n,
            entanglementIndex: this.state.entangledPairs.length / n,
            coherenceLevel: 1.0 - (Math.log(this.state.entangledPairs.length + 1) / 10)
        };
    }

    updateParams(p: Partial<SimulationParameters>) {
        if (!p) return;
        this.state.parameters = { ...this.state.parameters, ...p };
    }

    reset() {
        this.state.nodes = []; this.state.quarks = []; this.state.entangledPairs = []; this.state.recentCollapses = []; this.state.time = 0; 
        this.initializeNodes();
    }

    getMetrics() {
        return { ...this.state.statistics, nodeCount: this.state.nodes.length, quarkCount: this.state.quarks.length };
    }
}
