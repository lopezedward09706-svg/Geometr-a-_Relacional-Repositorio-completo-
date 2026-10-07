
import React from 'react';
import { Agent } from '../types';

interface NetworkVisualizerProps {
  agents: Agent[];
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ agents }) => {
  return (
    <div className="h-full w-full glass rounded-2xl relative overflow-hidden flex items-center justify-center p-12">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Central Node */}
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-pulse">
          <span className="font-bold text-xl text-blue-400">BUS</span>
        </div>
        
        {/* Connection Lines & Agent Nodes */}
        {agents.map((agent, i) => {
          const angle = (i * (360 / agents.length)) * (Math.PI / 180);
          const radius = 220;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <React.Fragment key={agent.id}>
              {/* Line */}
              <div 
                className="absolute top-1/2 left-1/2 h-px bg-gradient-to-r from-blue-500 to-transparent origin-left opacity-30"
                style={{ 
                  width: `${radius}px`, 
                  transform: `translateY(-50%) rotate(${angle}rad)` 
                }}
              ></div>
              
              {/* Node */}
              <div 
                className="absolute w-48 transition-all duration-500 hover:scale-110"
                style={{ 
                  left: `calc(50% + ${x}px)`, 
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="glass bg-slate-900/80 border border-white/10 p-3 rounded-xl shadow-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-100 uppercase truncate">{agent.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500">
                    <span>{agent.id}</span>
                    <span className="mono">{agent.load}% CPU</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
