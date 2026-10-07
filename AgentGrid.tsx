
import React from 'react';
import { AgentStatus } from '../types';
import { PersonalityAgent } from '../App';

interface AgentGridProps {
  agents: PersonalityAgent[];
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents }) => {
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.BUSY: return 'bg-blue-500';
      case AgentStatus.IDLE: return 'bg-emerald-500';
      case AgentStatus.ERROR: return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.BUSY: return 'text-blue-400';
      case AgentStatus.IDLE: return 'text-emerald-400';
      case AgentStatus.ERROR: return 'text-rose-400';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {agents.map(agent => (
        <div key={agent.id} className="glass rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-100 truncate">{agent.name}</h4>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mono shrink-0">{agent.id}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest">{agent.role}</p>
            </div>
            <div className={`text-[9px] font-mono font-bold px-2 py-1 rounded bg-slate-900/80 border border-white/10 ${getStatusText(agent.status)}`}>
              {agent.status}
            </div>
          </div>

          <div className="mb-4 relative z-10">
            <div className="bg-black/20 rounded-lg p-2 border border-white/5">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold mb-2 uppercase tracking-tighter">
                <span>Cognitive Traits</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(agent.traits).map(([trait, value]) => (
                  <div key={trait} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] text-slate-500 uppercase">
                      <span>{trait}</span>
                      <span className="text-slate-300">{(Number(value) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full">
                      <div 
                        className="h-full bg-blue-500/50 rounded-full" 
                        style={{ width: `${Number(value) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-auto space-y-3 relative z-10">
             <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black">Framework</span>
                  <span className="text-[10px] text-blue-400 font-mono tracking-tighter">{agent.framework}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] text-slate-500 uppercase font-black">Load</span>
                  <p className="mono text-[10px] text-slate-300">{agent.load}%</p>
                </div>
             </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${getStatusColor(agent.status)}`}
                style={{ width: `${agent.load}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
              <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(agent.status)} animate-pulse`}></div>
              <span className="truncate">{agent.lastAction}</span>
            </div>
          </div>

          <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity group-hover:opacity-10 ${getStatusColor(agent.status)}`}></div>
        </div>
      ))}
    </div>
  );
};
