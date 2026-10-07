
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { AgentGrid } from './components/AgentGrid';
import { TaskMonitor } from './components/TaskMonitor';
import { ChatPanel } from './components/ChatPanel';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { Agent, AgentStatus, TaskStatus, NetworkTask } from './types';

export interface PersonalityAgent extends Agent {
  traits: Record<string, number>;
  framework: string;
}

const INITIAL_AGENTS: PersonalityAgent[] = [
  { 
    id: 'IA1', 
    name: 'Analista Cuantitativo', 
    role: 'Estadística y ML', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Standby', 
    category: 'research',
    framework: 'ESTADÍSTICO_INFERENCIAL',
    traits: { analytical: 0.9, systematic: 0.95, critical: 0.7 }
  },
  { 
    id: 'IA2', 
    name: 'Analista Estratégico', 
    role: 'Contexto y Tendencias', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Standby', 
    category: 'research',
    framework: 'CONTEXTUAL_STRATEGIC',
    traits: { creative: 0.85, strategic: 0.9, contextual: 0.88 }
  },
  { 
    id: 'IA10', 
    name: 'Supervisor Élite', 
    role: 'IA de Control Cuántico', 
    status: AgentStatus.IDLE, 
    load: 5, 
    lastAction: 'Monitoreando Entropía', 
    category: 'core',
    framework: 'QUANTUM_CONTROL_TIER_1',
    traits: { predictive: 0.98, critical: 0.99, precision: 1.0 }
  },
  { 
    id: 'IA11', 
    name: 'Orquestador Cuántico', 
    role: 'Optimización Probabilística', 
    status: AgentStatus.IDLE, 
    load: 12, 
    lastAction: 'Calculando Caminos', 
    category: 'core',
    framework: 'GROVER_OPTIMIZATION_V4',
    traits: { complexity: 0.95, analytical: 0.99, speed: 1.0 }
  },
  { 
    id: 'IA7', 
    name: 'Visual Generator', 
    role: 'Código y Visuales', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Standby', 
    category: 'code',
    framework: 'GENERATIVE_UI_V4',
    traits: { analytical: 0.4, precision: 0.95, creative: 0.9 }
  },
  { 
    id: 'IA8', 
    name: 'Code Auditor', 
    role: 'Seguridad y QA', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Observing Bus', 
    category: 'code',
    framework: 'SECURITY_AUDIT_PRO',
    traits: { critical: 1.0, systematic: 0.95, detail: 0.98 }
  },
  { 
    id: 'IA9', 
    name: 'Code Fixer', 
    role: 'Corrección Automática', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Ready to Patch', 
    category: 'code',
    framework: 'AI_REFACTOR_ENGINE',
    traits: { analytical: 0.85, precision: 0.9, speed: 0.95 }
  },
  { 
    id: 'IA3', 
    name: 'Analista de Diferencias', 
    role: 'Resolución de Divergencia', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Standby', 
    category: 'analysis',
    framework: 'COMPARATIVO_MULTIDIMENSIONAL',
    traits: { critical: 1.0, analytical: 0.9, strategic: 0.8 }
  },
  { 
    id: 'IA6', 
    name: 'Sintetizador Decisiones', 
    role: 'Hoja de Ruta Ejecutiva', 
    status: AgentStatus.IDLE, 
    load: 0, 
    lastAction: 'Standby', 
    category: 'analysis',
    framework: 'SÍNTESIS_DECISIONAL',
    traits: { strategic: 1.0, holistic: 0.9, practical: 0.85 }
  }
];

const App: React.FC = () => {
  const [agents, setAgents] = useState<PersonalityAgent[]>(INITIAL_AGENTS);
  const [tasks, setTasks] = useState<NetworkTask[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'network' | 'logs'>('dashboard');
  const [coherence, setCoherence] = useState(0.99);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        const isBusy = tasks.some(t => t.assignedTo === agent.id && t.status === TaskStatus.IN_PROGRESS);
        const baseLoad = isBusy ? 92 : 4;
        return {
          ...agent,
          load: Math.min(100, Math.floor(baseLoad + Math.random() * 8)),
          status: isBusy ? AgentStatus.BUSY : AgentStatus.IDLE
        };
      }));
      setCoherence(0.95 + Math.random() * 0.05);
    }, 2000);
    return () => clearInterval(interval);
  }, [tasks]);

  const handleNewTask = useCallback((description: string) => {
    const taskId = Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // IA11 starts Orchestration phase immediately
    const orchestratorTask: NetworkTask = { 
      id: `ORCH-${taskId}`, 
      description: `[IA11] Optimización de Caminos Probabilísticos: ${description.slice(0, 10)}`, 
      assignedTo: 'IA11', 
      status: TaskStatus.IN_PROGRESS, 
      progress: 0 
    };

    setTasks(prev => [orchestratorTask, ...prev].slice(0, 35));

    let orchProgress = 0;
    const orchInt = setInterval(() => {
      orchProgress += 20;
      setTasks(p => p.map(t => t.id === orchestratorTask.id ? { ...t, progress: Math.min(100, orchProgress) } : t));
      
      if (orchProgress >= 100) {
        clearInterval(orchInt);
        setTasks(p => p.map(t => t.id === orchestratorTask.id ? { ...t, status: TaskStatus.COMPLETED } : t));
        
        // Phase 1: RESEARCH
        const researchTasks: NetworkTask[] = [
          { id: `R1-${taskId}`, description: `[IA1] Análisis Cuántico-Métrico`, assignedTo: 'IA1', status: TaskStatus.IN_PROGRESS, progress: 0 },
          { id: `R2-${taskId}`, description: `[IA2] Mapeo de Superposición Estratégica`, assignedTo: 'IA2', status: TaskStatus.IN_PROGRESS, progress: 0 }
        ];
        setTasks(p => [...researchTasks, ...p]);

        researchTasks.forEach(task => {
          let rProg = 0;
          const rInt = setInterval(() => {
            rProg += 15 + Math.random() * 10;
            if (rProg >= 100) {
              clearInterval(rInt);
              setTasks(p => p.map(t => t.id === task.id ? { ...t, progress: 100, status: TaskStatus.COMPLETED } : t));

              // Automatic triggering of IA10 supervision for each completed research
              const supId = `QA-${task.assignedTo}-${taskId}`;
              setTasks(p => [{ id: supId, description: `[IA10] Auditoría Élite y Corrección de Decoherencia`, assignedTo: 'IA10', status: TaskStatus.IN_PROGRESS, progress: 0 }, ...p]);
              
              let supProg = 0;
              const supInt = setInterval(() => {
                supProg += 25;
                if (supProg >= 100) {
                  clearInterval(supInt);
                  setTasks(p => p.map(t => t.id === supId ? { ...t, progress: 100, status: TaskStatus.COMPLETED } : t));
                  
                  // When all research/audits are done, proceed to Synthesis
                  setTasks(current => {
                    const audits = current.filter(t => t.id.startsWith('QA-') && t.id.endsWith(taskId) && t.status === TaskStatus.COMPLETED);
                    if (audits.length === 2 && !current.some(t => t.id === `SY-${taskId}`)) {
                      // Synthesis Logic (Skipping full 4-stage simulation here for brevity as previously implemented)
                      return [{ id: `SY-${taskId}`, description: `[IA6] Síntesis Decisional Élite`, assignedTo: 'IA6', status: TaskStatus.IN_PROGRESS, progress: 0 }, ...current];
                    }
                    return current;
                  });
                } else {
                  setTasks(p => p.map(t => t.id === supId ? { ...t, progress: supProg } : t));
                }
              }, 400);
            } else {
              setTasks(p => p.map(t => t.id === task.id ? { ...t, progress: Math.floor(rProg) } : t));
            }
          }, 400);
        });
      }
    }, 300);
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass shrink-0 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-indigo-500/0"></div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-ping absolute inset-0"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500 relative shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight uppercase leading-none">DAAN Elite Core</h1>
              <p className="text-[9px] text-purple-400 font-black mono tracking-[0.2em] mt-1">SUPERVISION_TIER: QUANTUM</p>
            </div>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-[0.3em]">Neural Coherence</span>
              <span className="text-purple-400 font-mono font-bold">{(coherence * 100).toFixed(2)}%</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[9px] uppercase font-black tracking-[0.3em]">System Entropy</span>
              <span className="text-indigo-400 font-mono font-bold">0.0042 ΔS</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-6 gap-6 grid grid-cols-12 bg-[radial-gradient(circle_at_50%_0%,_rgba(88,28,135,0.15)_0%,_rgba(2,6,23,1)_80%)]">
          {activeTab === 'dashboard' ? (
            <>
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
                <section className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  <AgentGrid agents={agents} />
                </section>
                <section className="h-[340px] glass rounded-[2.5rem] overflow-hidden flex flex-col border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                  <div className="p-5 px-8 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                      <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.4em]">Predictive Orchestration Stream</h3>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Active Qubits: 2048</span>
                    </div>
                  </div>
                  <TaskMonitor tasks={tasks} />
                </section>
              </div>
              
              <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
                <ChatPanel onSendMessage={handleNewTask} />
              </div>
            </>
          ) : (
            <div className="col-span-12 h-full flex flex-col items-center justify-center glass rounded-[2.5rem]">
              <div className="w-32 h-32 relative">
                <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute inset-2 border-2 border-indigo-500/30 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-[0_0_20px_purple]"></div>
                </div>
              </div>
              <p className="mt-12 text-purple-400 font-bold mono text-xs tracking-[0.6em] animate-pulse">CALIBRATING QUANTUM ALIGNMENT...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
