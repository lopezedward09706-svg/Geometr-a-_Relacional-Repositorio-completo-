
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { IA_COLORS } from '../constants';

interface IAPanelProps {
    chatHistory: ChatMessage[];
    onSendMessage: (msg: string) => void;
    onRunIA: (id: number, args?: string) => void;
    iaLogs: Record<number, string[]>;
}

const IAPanel: React.FC<IAPanelProps> = ({ chatHistory, onSendMessage, onRunIA, iaLogs }) => {
    const [activeTab, setActiveTab] = useState<'chat' | number>('chat');
    const [input, setInput] = useState('');
    const [iaInput, setIaInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, activeTab]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [iaLogs, activeTab]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    const IATabs = [
        { id: 1, name: 'IA1', label: 'IA1: EXPERIMENTAL', color: 'text-ia1', bg: 'bg-ia1', desc: 'Valida predicciones con datos experimentales simulados.', action: 'EJECUTAR VALIDACIÓN' },
        { id: 2, name: 'IA2', label: 'IA2: TEÓRICA', color: 'text-ia2', bg: 'bg-ia2', desc: 'Analiza consistencia matemática y simetrías.', action: 'ANALIZAR CONSISTENCIA' },
        { id: 3, name: 'IA3', label: 'IA3: OBSERVADOR', color: 'text-ia3', bg: 'bg-ia3', desc: 'Observa y valida deducciones del usuario.', action: 'VALIDAR DEDUCCIÓN' },
        { id: 4, name: 'IA4', label: 'IA4: BUSCADOR', color: 'text-ia4', bg: 'bg-ia4', desc: 'Genera y prueba ecuaciones para encontrar constantes.', action: 'BUSCAR CONSTANTES' },
        { id: 5, name: 'IA5', label: 'IA5: INTEGRADOR', color: 'text-ia5', bg: 'bg-ia5', desc: 'Convierte quarks en átomos y materia emergente.', action: 'GENERAR MATERIA' },
        { id: 6, name: 'IA6', label: 'IA6: MEDIADOR', color: 'text-ia6', bg: 'bg-ia6', desc: 'Analiza estado y sugiere ajustes de parámetros óptimos.', action: 'OPTIMIZAR PARÁMETROS' },
        { id: 7, name: 'IA7', label: 'IA7: PROGRAMADOR', color: 'text-ia7', bg: 'bg-ia7', desc: 'Modifica el código base según instrucciones.', action: 'EJECUTAR MODIFICACIÓN', hasInput: true },
        { id: 8, name: 'IA8', nameShort: 'IA8', label: 'IA8: CUÁNTICA', color: 'text-ia8', bg: 'bg-ia8', desc: 'Simula entrelazamiento cuántico y no-localidad.', action: 'ANALIZAR ENTRELACES' },
    ];

    return (
        <div className="bg-glass backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col h-full overflow-hidden">
             <div className="flex flex-wrap gap-1 mb-4">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-1 py-1.5 text-[9px] font-bold rounded border ${activeTab === 'chat' ? 'bg-blue-500/30 border-blue-400' : 'bg-black/30 border-white/10 hover:bg-white/10'}`}
                >
                    💬 CHAT
                </button>
                {IATabs.map(ia => (
                    <button 
                        key={ia.id}
                        onClick={() => {
                            setActiveTab(ia.id);
                            setIaInput('');
                        }}
                        className={`flex-1 px-1 py-1.5 text-[9px] font-bold rounded border ${activeTab === ia.id ? `bg-white/10 border-white` : 'bg-black/30 border-white/10 hover:bg-white/10'}`}
                        style={{ color: activeTab === ia.id ? undefined : IA_COLORS[`ia${ia.id}` as keyof typeof IA_COLORS] }}
                    >
                        {ia.nameShort || ia.name}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {activeTab === 'chat' ? (
                    <>
                        <div className="flex-1 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/10 space-y-2">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className="text-sm">
                                    <strong style={{ color: msg.color }}>{msg.sender}:</strong> <span className="text-gray-200">{msg.message}</span>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="mt-3 flex gap-2">
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 bg-black/40 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                            />
                            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">📤</button>
                        </div>
                    </>
                ) : (
                    (() => {
                        const ia = IATabs.find(t => t.id === activeTab);
                        if (!ia) return null;
                        return (
                            <div className="flex flex-col h-full">
                                <h4 className={`text-lg font-bold mb-2 pb-2 border-b border-white/10 ${ia.color}`}>{ia.label}</h4>
                                <p className="text-sm text-gray-300 mb-4">{ia.desc}</p>
                                
                                {ia.hasInput && (
                                    <input 
                                        type="text" 
                                        value={iaInput}
                                        onChange={(e) => setIaInput(e.target.value)}
                                        placeholder={ia.id === 7 ? "Instrucción de código..." : "Instrucción..."}
                                        className="w-full bg-black/40 border border-white/20 rounded px-3 py-2 text-sm mb-2 focus:border-white transition-colors"
                                    />
                                )}

                                <button 
                                    onClick={() => onRunIA(ia.id, ia.hasInput ? iaInput : undefined)}
                                    className={`w-full py-2 mb-4 rounded font-bold text-black hover:brightness-110 transition-all ${ia.bg}`}
                                >
                                    {ia.action}
                                </button>

                                <div className="flex-1 bg-black/30 rounded-lg p-3 border border-white/10 overflow-y-auto font-mono text-xs">
                                    {(iaLogs[ia.id] || []).map((log, i) => (
                                        <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0" dangerouslySetInnerHTML={{ __html: log }} />
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};

export default IAPanel;
