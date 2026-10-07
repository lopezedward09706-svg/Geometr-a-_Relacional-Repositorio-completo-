
import React, { useState } from 'react';
import { IAState } from '../types';
import { IA_COLORS } from '../constants';
import { QuantumBridge } from '../services/quantumBridge';

interface ResultsPanelProps {
    iaStates: Record<number, IAState>;
    globalConsensus: number;
    notifications: string[];
    onExport: () => void;
    currentState: any;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ iaStates, globalConsensus, notifications, onExport, currentState }) => {
    const [expandedIA, setExpandedIA] = useState<number | null>(null);
    const bridge = QuantumBridge.getInstance();

    const handleSIPExport = () => {
        bridge.exportSIP(currentState);
    };

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-6 mt-2 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
            <h3 className="text-lg font-bold border-b border-white/20 pb-2 flex items-center gap-2">
                <span className="animate-pulse text-cyan-400">●</span> 
                INTELIGENCIA DE DATOS
            </h3>
            
            {/* Hub de Extensiones Externas */}
            <div className="grid grid-cols-2 gap-2">
                <a 
                    href={`https://relativistic-viz.app/view?v=${currentState?.parameters?.velocity}&m=${currentState?.parameters?.centralMass}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group bg-blue-900/40 border border-blue-500/30 p-2 rounded-lg hover:bg-blue-800/60 transition-all"
                >
                    <div className="text-[10px] font-black text-blue-300 mb-1 group-hover:text-blue-100 uppercase">Relativistic Viz</div>
                    <div className="text-[8px] text-blue-400/80 leading-tight">Extensión de dilatación temporal v.2.4</div>
                </a>
                <a 
                    href={`https://quark-db.physics/search?phi=${currentState?.parameters?.radioPi}&q=${currentState?.quarks?.length}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group bg-purple-900/40 border border-purple-500/30 p-2 rounded-lg hover:bg-purple-800/60 transition-all"
                >
                    <div className="text-[10px] font-black text-purple-300 mb-1 group-hover:text-purple-100 uppercase">Particle DB</div>
                    <div className="text-[8px] text-purple-400/80 leading-tight">Base de datos hadrónica externa</div>
                </a>
            </div>

            <div className="space-y-4">
                 <div>
                    <div className="text-[10px] font-bold mb-1 text-gray-400">ESTABILIDAD DEL CONSENSO:</div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden relative border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-500 transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                            style={{ width: `${globalConsensus * 100}%` }}
                        />
                    </div>
                 </div>

                 <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <div className="text-[10px] font-black text-cyan-400 mb-2 flex justify-between items-center tracking-tighter">
                        <span>ESTADOS DE UNIDAD IA:</span>
                        <span className="text-[8px] opacity-50">SYNC: Plan 3.0</span>
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                        {Object.entries(iaStates).map(([key, state]) => {
                            const id = parseInt(key);
                            const s = state as IAState;
                            const iaColor = IA_COLORS[`ia${id}` as keyof typeof IA_COLORS];
                            const isExpanded = expandedIA === id;
                            
                            return (
                                <div key={key} className={`border border-white/5 rounded transition-all ${isExpanded ? 'bg-white/5' : 'bg-black/20'}`}>
                                    <div 
                                        className="p-1.5 text-[9px] flex justify-between items-center cursor-pointer"
                                        onClick={() => setExpandedIA(isExpanded ? null : id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: iaColor, boxShadow: `0 0 5px ${iaColor}` }}></div>
                                            <span style={{ color: iaColor }} className="font-bold">IA{id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {s.running && <span className="text-yellow-400 animate-pulse text-[8px]">PROCESANDO</span>}
                                            <span className="text-gray-400">{(s.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    {isExpanded && s.lastResponse && (
                                        <div className="px-2 pb-2 text-[8px] font-mono text-gray-400 break-words border-t border-white/5 pt-1">
                                            {s.lastResponse.substring(0, 150)}...
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2">
                    <button 
                        onClick={handleSIPExport}
                        className="py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-lg font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-900/20"
                    >
                        💾 Exportar Archivo .SIP
                    </button>
                    <button 
                        onClick={onExport}
                        className="py-2 bg-white/5 border border-white/10 rounded-lg font-bold text-[9px] text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        Reporte de Texto (.txt)
                    </button>
                 </div>
            </div>

            <div className="mt-auto pt-2 border-t border-white/5">
                <div className="text-[9px] font-bold text-orange-400/80 mb-1 tracking-widest uppercase">Registro de Eventos:</div>
                <div className="h-24 overflow-y-auto text-[8px] space-y-1 text-orange-200/60 font-mono custom-scrollbar">
                    {notifications.map((note, i) => (
                        <div key={i} className="border-l border-orange-500/30 pl-2 leading-tight py-0.5">{note}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsPanel;
