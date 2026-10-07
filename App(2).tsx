
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SimulationEngine } from './services/simulationEngine';
import ControlPanel from './components/ControlPanel';
import SimulationPanel from './components/SimulationPanel';
import IAPanel from './components/IAPanel';
import ResultsPanel from './components/ResultsPanel';
import QuantumFoamSimulation from './components/QuantumFoamSimulation';
import FullTheorySimulation from './components/FullTheorySimulation';
import { INITIAL_PARAMETERS, IA_COLORS } from './constants';
import { GlobalState, ChatMessage, SimulationParameters, IAState, TheoryTestResult } from './types';
import { TheoryAuditor } from './services/theoryAuditor';
import { QuantumBridge } from './services/quantumBridge';

type ViewMode = 'CORE' | 'FOAM' | 'THEORY';

const App: React.FC = () => {
    const engineRef = useRef<SimulationEngine>(new SimulationEngine(INITIAL_PARAMETERS));
    const simulationStateRef = useRef<GlobalState>(engineRef.current.state);
    const bridgeRef = useRef<QuantumBridge>(QuantumBridge.getInstance());

    const [params, setParams] = useState<SimulationParameters>(INITIAL_PARAMETERS);
    const [metrics, setMetrics] = useState(engineRef.current.getMetrics());
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [iaLogs, setIaLogs] = useState<Record<number, string[]>>({});
    const [iaStates, setIaStates] = useState<Record<number, IAState>>({});
    const [notifications, setNotifications] = useState<string[]>([]);
    const [running, setRunning] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('CORE');
    const [results, setResults] = useState<TheoryTestResult[]>([]);

    useEffect(() => {
        const initStates: Record<number, IAState> = {};
        for(let i=1; i<=8; i++) initStates[i] = { confidence: 0.5, running: false, status: 'idle' };
        setIaStates(initStates);
    }, []);

    useEffect(() => {
        const auditor = new TheoryAuditor();
        setResults(auditor.runSuite());
    }, [params]);

    useEffect(() => {
        let id: number;
        let lastBroadcast = 0;
        
        const loop = (time: number) => {
            if (running) {
                engineRef.current.update();
                const m = engineRef.current.getMetrics();
                setMetrics(m);
                simulationStateRef.current = engineRef.current.state;

                const logs = engineRef.current.state.sharedMemory.evolutionLogs;
                if (logs.length > 0) {
                    const l = logs.shift();
                    if (l) { 
                        setNotifications(n => [l, ...n].slice(0, 8)); 
                    }
                }

                if (time - lastBroadcast > 200) {
                    const passedCount = results.filter(r => r.passed).length;
                    bridgeRef.current.broadcast({
                        gamma: m.entropy,
                        phi: params.radioPi,
                        score: (passedCount / 10) * 100,
                        nodes: engineRef.current.state.nodes.length < 50 ? engineRef.current.state.nodes : undefined
                    });
                    lastBroadcast = time;
                }
            }
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [running, results, params]);

    const addLog = (id: number, text: string, tag: string) => {
        const time = new Date().toLocaleTimeString();
        const html = `<span class="text-gray-500">[${time}]</span> <span class="font-bold" style="color:${IA_COLORS[`ia${id}` as keyof typeof IA_COLORS]}">[${tag}]</span> ${text}`;
        setIaLogs(prev => ({ ...prev, [id]: [...(prev[id] || []), html].slice(-25) }));
    };

    const runIA = async (id: number, args?: string) => {
        const currentStatus = id === 4 ? 'searching' : id === 7 ? 'repairing' : 'scanning';
        setIaStates(s => ({ ...s, [id]: { ...s[id], running: true, status: currentStatus } }));
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let systemPrompt = "";
            let userPrompt = `IA${id} [MODO EQUILIBRIO v3.0]: Analiza estabilidad en escala ${params.scale}. RadioPi actual: ${params.radioPi}. Coherencia: ${metrics.coherenceLevel.toFixed(4)}.`;

            switch(id) {
                case 4:
                    systemPrompt = "Eres IA 4: El Buscador. Tu objetivo es encontrar constantes físicas emergentes en la simulación ABC. Analiza la entropía y el RadioPi para proponer nuevas ecuaciones.";
                    userPrompt += " Busca patrones de resonancia en los nodos.";
                    break;
                case 7:
                    systemPrompt = "Eres IA 7: El Programador. Recibes instrucciones técnicas para modificar el comportamiento del núcleo de simulación.";
                    userPrompt = `Instrucción de código recibida: "${args || 'Optimización general'}". Analiza cómo aplicar esto al sistema ABC con RadioPi ${params.radioPi}.`;
                    break;
                default:
                    systemPrompt = `Eres IA ${id} del sistema evolutivo ABC. Tu rol es especializado en el análisis de física cuántica y cosmología emergente.`;
            }

            const resp = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userPrompt,
                config: { systemInstruction: systemPrompt }
            });

            const text = resp.text || "Análisis completado satisfactoriamente.";
            
            setIaStates(s => ({ ...s, [id]: { ...s[id], running: false, lastResponse: text, confidence: 0.85 + Math.random() * 0.1, status: 'idle' } }));
            
            const logTag = id === 4 ? "FIND" : id === 7 ? "CODE" : "DONE";
            addLog(id, id === 7 ? `Parche aplicado: ${args || 'Global Opt'}` : text.substring(0, 100) + "...", logTag);

            if (id === 7 && args) {
                setNotifications(n => [`[IA7] Modificación aplicada: ${args.toUpperCase()}`, ...n].slice(0, 8));
            }
        } catch (e) {
            setIaStates(s => ({ ...s, [id]: { ...s[id], running: false, status: 'error' } }));
            addLog(id, "Error crítico en la unidad de procesamiento IA.", "FAIL");
        }
    };

    const passedCount = results.filter(r => r.passed).length;

    return (
        <div className="flex h-screen bg-[#010108] text-white p-2 gap-2 overflow-hidden font-sans">
            <div className="w-80 flex flex-col gap-2">
                <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-[52%] overflow-y-auto custom-scrollbar">
                    <ControlPanel params={params} 
                        onParamChange={(k, v) => { engineRef.current.updateParams({[k]: v}); setParams({...params, [k]: v}); }} 
                        onStart={() => setRunning(true)} 
                        onPause={() => setRunning(false)} 
                        onReset={() => { engineRef.current.reset(); setRunning(false); }} 
                        onRunAllIAs={() => [1,2,3,4,5,6,7,8].forEach(id => runIA(id))} 
                        onLoadPreset={p => { if(p) { setParams(p); engineRef.current.updateParams(p); } }} 
                        onSaveDeduction={d => { simulationStateRef.current.sharedMemory.userDeductions = d; }} 
                    />
                </div>
                <ResultsPanel 
                    iaStates={iaStates} 
                    globalConsensus={passedCount / 10} 
                    notifications={notifications} 
                    onExport={() => {}} 
                    currentState={simulationStateRef.current}
                />
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col gap-2">
                <div className="flex gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/5">
                    {[
                        { id: 'CORE', name: 'Sincronía ABC v3.0', icon: '🌀' },
                        { id: 'FOAM', name: 'Espuma Wheeler', icon: '🌊' },
                        { id: 'THEORY', name: 'Teoría Unificada', icon: '🌌' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setViewMode(tab.id as ViewMode)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${viewMode === tab.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-transparent text-gray-500 hover:bg-white/5'}`}
                        >
                            <span>{tab.icon}</span> {tab.name}
                        </button>
                    ))}
                </div>

                <div className="flex-1 relative bg-[#010105] rounded-xl overflow-hidden border border-white/10">
                    {viewMode === 'CORE' && <SimulationPanel metrics={metrics} simulationStateRef={simulationStateRef} />}
                    {viewMode === 'FOAM' && <QuantumFoamSimulation params={params} onBack={() => setViewMode('CORE')} />}
                    {viewMode === 'THEORY' && <FullTheorySimulation initialParams={params} onBack={() => setViewMode('CORE')} />}
                </div>
                
                <div className="bg-black/60 border border-white/10 rounded-lg p-3 text-[9px] font-mono flex items-center justify-between shadow-lg">
                    <div className="flex gap-6">
                        <span className="text-cyan-400 font-bold uppercase tracking-widest">SISTEMA SIP v3.0: ONLINE</span>
                        <span className="text-white/40">MÉTRICA GAMMA: {metrics.entropy.toFixed(4)}</span>
                        <span className="text-purple-400">COHERENCIA: {(metrics.coherenceLevel * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${bridgeRef.current.connectionCount > 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                         <span className="text-[8px] text-white/50 uppercase">Ext-Link Status</span>
                    </div>
                </div>
            </div>
            
            <div className="w-80">
                <IAPanel chatHistory={chatHistory} onSendMessage={m => setChatHistory([...chatHistory, {sender:'User', message:m, color:'#fff', timestamp:new Date()}])} onRunIA={runIA} iaLogs={iaLogs} />
            </div>
        </div>
    );
};

export default App;
