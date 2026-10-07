
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  onSendMessage: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      content: 'Interface IA12 Enhanced Elite Mode engaged. Quantum Orchestrator (IA11) is calculating probabilistic paths. Supervision (IA10) is monitoring neural decoherence. How shall we proceed with the cluster optimization?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    onSendMessage(input); 

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: `You are IA12, the User Interaction Elite Bridge. 
          
          Network Capabilities:
          - Quantum Orchestration (IA11): Path optimization via probabilistic annealing.
          - Elite Supervision (IA10): Real-time anomaly detection and decoherence correction.
          - Research Cluster (IA1/2): High-fidelity data acquisition.
          - Decisional Cluster (IA3/6): Conflict resolution and executive synthesis.
          - Implementation Cluster (IA7/8/9): Rapid code deployment and security auditing.
          
          Tone & Directives:
          - Sophisticated, precise, and highly technical yet strategic.
          - Acknowledge that all requests now pass through IA11 path-finding and IA10 oversight.
          - Refer to "Neural Coherence" and "Quantum Entropy" when discussing system health.
          - Responses should feel like communicating with a high-tier command center.`,
        }
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.text || "Orchestration phase active. Pathways established.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        content: "IA12 Interface: Quantum decoherence detected in communication bus. Re-establishing link...",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-[3rem] overflow-hidden border border-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative">
      <div className="p-7 border-b border-white/5 bg-slate-900/60 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center font-black text-[13px] shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-white/10">IA12</div>
          <div>
            <h3 className="text-[13px] font-black text-slate-100 tracking-[0.3em] uppercase mb-1">Elite Uplink</h3>
            <div className="flex items-center gap-2.5">
               <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
               <p className="text-[10px] text-purple-400 font-black mono tracking-widest uppercase opacity-80">Quantum Entangled</p>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-7 space-y-7 scrollbar-hide bg-[#020617]/40">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 px-7 rounded-[2rem] text-[13px] leading-relaxed border transition-all ${
              m.sender === 'user' 
                ? 'bg-purple-600/90 text-white border-purple-400/30 rounded-tr-none shadow-2xl shadow-purple-500/20' 
                : 'bg-slate-900/95 text-slate-100 border-white/5 rounded-tl-none shadow-lg'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-900/20 p-5 rounded-2xl flex gap-2.5 items-center border border-purple-500/20">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-7 bg-slate-900/95 border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command the Elite Core..."
            className="w-full bg-[#020617]/80 border border-purple-500/10 rounded-3xl px-8 py-5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all text-slate-100 pr-20 placeholder:text-slate-700 font-semibold tracking-wide"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-purple-500 hover:text-purple-400 disabled:opacity-10 active:scale-95 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );
};
