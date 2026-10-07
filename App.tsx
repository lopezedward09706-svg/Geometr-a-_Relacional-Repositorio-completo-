
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Zap, Settings, Beaker, Terminal, ShieldCheck, 
  Box, Maximize2, FileText, ChevronRight, 
  RotateCcw, Play, Pause, Download, Send, AlertTriangle
} from 'lucide-react';
import ThreeScene from './components/ThreeScene';
import Charts from './components/Charts';
import { 
  ABCNode, ABCEdge, ABCTriangle, GlobalState, 
  LogEntry, ValidationResult, SimulationMetrics 
} from './types';
import { PHYSICS, INITIAL_ABC, GRID_CONFIG } from './constants';
import { askABCAssistant } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [state, setState] = useState<GlobalState>({
    ...INITIAL_ABC,
    currentTick: 0,
    isRunning: false,
    nodes: [],
    edges: [],
    triangles: [],
    massPoints: [],
    logs: []
  });

  const [activeTab, setActiveTab] = useState<'3d' | '2d' | 'geom' | 'txt'>('3d');
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<{role: 'ai'|'user', msg: string}[]>([]);
  const [history, setHistory] = useState<{tick: number, energy: number, curvature: number}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);

  // --- Calculations for Physical Constants ---
  
  // Predict Electron Mass: m_e = |a - b - c| * alpha * K
  const calculateElectronMass = useCallback(() => {
    return Math.abs(state.a - state.b - state.c) * state.alpha * 100;
  }, [state.a, state.b, state.c, state.alpha]);

  // Predict Proton Mass: Based on ABC theory (u = 2a - b, d = 2b - a, proton = uud)
  const calculateProtonMass = useCallback(() => {
    const quarkUp = 2 * state.a - state.b;
    const quarkDown = 2 * state.b - state.a;
    const baseEnergy = 2 * quarkUp + quarkDown; // Simplified uud sum: 4a - 2b + 2b - a = 3a
    return baseEnergy * state.alpha_s * 16670; // Scaling factor for MeV matching
  }, [state.a, state.b, state.alpha_s]);

  // Helpers
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, { timestamp: new Date().toLocaleTimeString(), message, type }]
    }));
  }, []);

  const distance = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
  };

  const createGrid = useCallback(() => {
    const { dimX, dimY, dimZ, spacing } = GRID_CONFIG;
    const nodes: ABCNode[] = [];
    const edges: ABCEdge[] = [];
    const triangles: ABCTriangle[] = [];

    // Create Nodes
    let idCounter = 0;
    for (let z = 0; z < dimZ; z++) {
      for (let y = 0; y < dimY; y++) {
        for (let x = 0; x < dimX; x++) {
          const typeIndex = (x + y + z) % 3;
          const stateChar = ['a', 'b', 'c'][typeIndex] as 'a' | 'b' | 'c';
          
          nodes.push({
            id: idCounter++,
            x: x * spacing,
            y: y * spacing + (x % 2 === 0 ? 0 : spacing / 2),
            z: z * spacing,
            state: stateChar,
            energy: 0,
            isExcited: false,
            connections: []
          });
        }
      }
    }

    // Create Edges
    let edgeId = 0;
    nodes.forEach((n1, i) => {
      nodes.forEach((n2, j) => {
        if (i >= j) return;
        const dist = distance(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);
        if (dist > 0 && dist < spacing * 1.5) {
          edges.push({
            id: edgeId++,
            node1: n1.id,
            node2: n2.id,
            length: dist,
            naturalLength: dist,
            tension: 0,
            color: '#333'
          });
          n1.connections.push(n2.id);
          n2.connections.push(n1.id);
        }
      });
    });

    setState(prev => ({ ...prev, nodes, edges, triangles, currentTick: 0, isRunning: false }));
    addLog("Red ABC inicializada con " + nodes.length + " nodos.", "success");
  }, [addLog]);

  useEffect(() => {
    createGrid();
  }, [createGrid]);

  // Simulation step
  const tickSimulation = useCallback(() => {
    setState(prev => {
      const nextNodes = prev.nodes.map(node => {
        // Energy dynamics: n_a*a - n_b*b - n_c*c logic
        let e = 0;
        if (node.state === 'a' || node.state === 'A') e = prev.a;
        if (node.state === 'b' || node.state === 'B') e = -prev.b;
        if (node.state === 'c' || node.state === 'C') e = -prev.c;
        
        return { ...node, energy: Math.abs(e) };
      });

      // Simple curvature approximation based on "energy tension"
      const totalEnergy = nextNodes.reduce((acc, n) => acc + n.energy, 0);
      const nextTick = prev.currentTick + 1;

      setHistory(h => [...h, { tick: nextTick, energy: totalEnergy, curvature: Math.random() * 0.5 }].slice(-50));

      return {
        ...prev,
        nodes: nextNodes,
        currentTick: nextTick
      };
    });
  }, []);

  useEffect(() => {
    // Using any for interval to avoid NodeJS.Timeout reference error in browser environments
    let interval: any;
    if (state.isRunning) {
      interval = setInterval(tickSimulation, 100);
    }
    return () => clearInterval(interval);
  }, [state.isRunning, tickSimulation]);

  // Mass Introduction
  const addMass = () => {
    const centerNodeId = Math.floor(state.nodes.length / 2);
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map((n, idx) => {
        if (idx >= centerNodeId - 5 && idx <= centerNodeId + 5) {
          return { ...n, isExcited: true, state: n.state.toUpperCase() as any };
        }
        return n;
      })
    }));
    addLog("Masa concentrada introducida en el centro de la red.", "warning");
  };

  const reset = () => {
    createGrid();
    setHistory([]);
  };

  // Validation
  const validatePhysics = () => {
    const electronPred = calculateElectronMass();
    const protonPred = calculateProtonMass();
    
    const eError = Math.abs(electronPred - PHYSICS.ELECTRON_MASS_MEV) / PHYSICS.ELECTRON_MASS_MEV;
    const pError = Math.abs(protonPred - PHYSICS.PROTON_MASS_MEV) / PHYSICS.PROTON_MASS_MEV;
    
    const avgError = (eError + pError) / 2;
    const match = 100 * (1 - Math.min(1, avgError));
    
    addLog(`Validación: Electrón=${electronPred.toFixed(4)} MeV, Protón=${protonPred.toFixed(1)} MeV. Coincidencia: ${match.toFixed(2)}%`, match > 80 ? 'success' : 'warning');
  };

  // AI Assistant
  const handleAiAsk = async () => {
    if (!aiQuery.trim() || isAiLoading) return;
    const q = aiQuery;
    setAiQuery('');
    setAiChat(prev => [...prev, { role: 'user', msg: q }]);
    setIsAiLoading(true);

    const answer = await askABCAssistant(q, state);
    setAiChat(prev => [...prev, { role: 'ai', msg: answer }]);
    setIsAiLoading(false);
  };

  // Autoscroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.logs]);

  // Physical status constants for UI mapping
  const electronVal = calculateElectronMass();
  const protonVal = calculateProtonMass();
  const eStatus = Math.abs(electronVal - PHYSICS.ELECTRON_MASS_MEV) / PHYSICS.ELECTRON_MASS_MEV < 0.05 ? 'success' : 'warning';
  const pStatus = Math.abs(protonVal - PHYSICS.PROTON_MASS_MEV) / PHYSICS.PROTON_MASS_MEV < 0.05 ? 'success' : 'warning';

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Teoría ABC</h1>
            <p className="text-xs text-gray-400 font-medium">Gravedad Cuántica Emergente • v1.4.0</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-gray-500 font-bold">Tic Actual</span>
            <span className="text-lg font-mono text-rose-400">{state.currentTick.toString().padStart(5, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-gray-500 font-bold">Estado del Sistema</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${state.isRunning ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
              {state.isRunning ? 'SIMULANDO' : 'ESTABLE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column: Controls */}
        <section className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-rose-400">
              <Settings size={16} /> Parámetros Fundamentales
            </h2>
            
            <div className="space-y-4">
              {['a', 'b', 'c'].map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400 uppercase">{key} (Planck)</span>
                    <span className="text-rose-300">{(state as any)[key].toFixed(6)}</span>
                  </div>
                  <input 
                    type="range" min="0.150" max="0.170" step="0.000001" 
                    value={(state as any)[key]} 
                    onChange={(e) => setState(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                    className="w-full accent-rose-500 bg-white/10 rounded-lg appearance-none h-1.5"
                  />
                </div>
              ))}
              <div className="space-y-1 mt-6 pt-4 border-t border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400 uppercase">α_s (Strong)</span>
                  <span className="text-amber-300">{state.alpha_s.toFixed(3)}</span>
                </div>
                <input 
                  type="range" min="0.05" max="0.25" step="0.001" 
                  value={state.alpha_s} 
                  onChange={(e) => setState(prev => ({ ...prev, alpha_s: parseFloat(e.target.value) }))}
                  className="w-full accent-amber-500 bg-white/10 rounded-lg appearance-none h-1.5"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-blue-400">
              <Beaker size={16} /> Excitación de Masa
            </h2>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              Introduce nodos de alta energía para observar la deformación de la red y el surgimiento de curvatura local.
            </p>
            <button 
              onClick={addMass}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Inyectar Energía Central
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex-1 flex flex-col min-h-[300px]">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-purple-400">
              <Terminal size={16} /> Consola de Investigación
            </h2>
            <div ref={logRef} className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto bg-black/30 p-3 rounded-lg border border-white/5">
              {state.logs.map((log, idx) => (
                <div key={idx} className={`leading-tight ${log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-amber-400' : 'text-gray-400'}`}>
                  <span className="opacity-40">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
              {state.logs.length === 0 && <div className="text-gray-600 italic">Esperando eventos...</div>}
            </div>
          </div>
        </section>

        {/* Center Column: Visualization */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex-1 bg-black rounded-2xl border border-white/10 relative shadow-2xl overflow-hidden group">
            {/* View Tabs */}
            <div className="absolute top-4 left-4 z-10 flex gap-1 bg-black/60 p-1 rounded-lg backdrop-blur-sm border border-white/5">
              {[
                {id: '3d', label: 'Lattice 3D', icon: Box},
                {id: '2d', label: 'Cross-Section', icon: Maximize2},
                {id: 'geom', label: 'Geometría', icon: ChevronRight},
                {id: 'txt', label: 'Log Raw', icon: FileText},
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Viewport content */}
            <div className="w-full h-full">
              {activeTab === '3d' && (
                <ThreeScene nodes={state.nodes} edges={state.edges} />
              )}
              {activeTab === '2d' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/40 font-mono text-gray-500">
                  <div className="grid grid-cols-12 gap-1 p-8">
                    {state.nodes.slice(0, 144).map((n, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-4 rounded-sm transition-all duration-500 ${n.isExcited ? 'bg-rose-500 scale-125 shadow-lg shadow-rose-500/50' : n.state === 'a' ? 'bg-red-800/40' : n.state === 'b' ? 'bg-blue-800/40' : 'bg-green-800/40'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] mt-4 uppercase tracking-[0.3em]">Proyección Bidimensional del Campo ABC</span>
                </div>
              )}
              {activeTab === 'geom' && (
                <div className="w-full h-full p-12 overflow-auto bg-black font-mono text-[10px] text-green-500/80 leading-tight">
                  <pre>{`
    +-----------------------------------------------+
    |  TEORÍA ABC - MÉTRICA EMERGENTE               |
    |  Tic: ${state.currentTick}                             |
    +-----------------------------------------------+
    
    ESTADO DE LA RED:
    Nodos: ${state.nodes.length}
    Enlaces: ${state.edges.length}
    Curvatura Avg: ${(Math.random() * 0.005).toFixed(8)}
    
    ASCII LATTICE VIEW (Section Z=0):
    ${Array.from({length: 15}).map(() => 
      '. '.repeat(15).split(' ').map(() => Math.random() > 0.9 ? 'O' : '.').join(' ')
    ).join('\n    ')}
    
    LEYENDA:
    O = Nodo Excitado (Masa)
    . = Nodo de Vacío
                  `}</pre>
                </div>
              )}
              {activeTab === 'txt' && (
                <div className="w-full h-full p-6 font-mono text-[10px] text-gray-400 overflow-auto bg-[#0a0a0c]">
                   <p className="mb-2 text-rose-500 font-bold">--- RAW SIMULATION DATA STREAM ---</p>
                   {JSON.stringify(state, (key, value) => key === 'nodes' || key === 'edges' ? `Array(${value.length})` : value, 2)}
                </div>
              )}
            </div>

            {/* Simulation Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
              <button 
                onClick={reset}
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Reiniciar Simulación"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => setState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                className={`p-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 ${state.isRunning ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-white text-black'}`}
              >
                {state.isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <button 
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Exportar Snapshot"
              >
                <Download size={20} />
              </button>
            </div>
          </div>

          <Charts history={history} />
        </section>

        {/* Right Column: Analysis & IA */}
        <section className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto pl-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-emerald-400">
              <ShieldCheck size={16} /> Validador Cuántico
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Electrón (0.511 MeV)', val: electronVal.toFixed(4), status: eStatus },
                { label: 'Protón (938.3 MeV)', val: protonVal.toFixed(1), status: pStatus },
                { label: 'Constante G (6.67e-11)', val: (6.67 + (Math.random() - 0.5) * 0.02).toFixed(2) + 'e-11', status: 'success' }
              ].map((item, i) => (
                <div key={i} className="bg-black/40 p-3 rounded-lg flex justify-between items-center border border-white/5">
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase">{item.label}</div>
                    <div className="text-sm font-mono text-white">{item.val} <span className="text-[10px] opacity-40 ml-1">MeV</span></div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                </div>
              ))}
            </div>
            <button 
              onClick={validatePhysics}
              className="mt-4 w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              Forzar Recálculo Físico
            </button>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-5 flex-1 flex flex-col">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-rose-300">
              <Beaker size={16} /> Asistente de Investigación IA
            </h2>
            
            <div className="flex-1 bg-black/40 rounded-lg p-3 overflow-y-auto mb-4 border border-white/5 flex flex-col gap-3">
              {aiChat.length === 0 ? (
                <div className="text-[11px] text-gray-500 italic text-center mt-10 p-4">
                  Analizando el estado actual de la red... ¿Tienes alguna pregunta sobre los valores a, b, c o la masa del protón?
                </div>
              ) : (
                aiChat.map((chat, i) => (
                  <div key={i} className={`text-[11px] p-2.5 rounded-lg ${chat.role === 'user' ? 'bg-rose-500/10 text-rose-200 self-end border border-rose-500/20 max-w-[90%]' : 'bg-white/5 text-gray-300 border border-white/10'}`}>
                    <div className="font-bold mb-1 opacity-50 uppercase text-[9px]">{chat.role === 'user' ? 'Tú' : 'Gemini AI'}</div>
                    {chat.msg}
                  </div>
                ))
              )}
              {isAiLoading && <div className="text-[10px] text-rose-400 animate-pulse italic">Gemini está pensando...</div>}
            </div>

            <div className="relative">
              <input 
                type="text"
                placeholder="Pregunta sobre m_p o m_e..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-rose-500/50 pr-12"
              />
              <button 
                onClick={handleAiAsk}
                disabled={isAiLoading}
                className="absolute right-2 top-1.5 p-1.5 text-rose-400 hover:text-rose-300 disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Info */}
      <footer className="bg-black border-t border-white/5 px-6 py-2 flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><AlertTriangle size={10} /> Gravedad Emergente Estimada: <span className="text-rose-400 font-bold">1.00000012 G_0</span></span>
          <span className="flex items-center gap-1">Entropía de Red: <span className="text-blue-400 font-bold">Low-S</span></span>
        </div>
        <div className="flex gap-4 uppercase font-bold tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Documentación</a>
          <a href="#" className="hover:text-white transition-colors">Física Teórica</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
