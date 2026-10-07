
import React from 'react';
import { NetworkTask, TaskStatus } from '../types';

interface TaskMonitorProps {
  tasks: NetworkTask[];
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-800 gap-6 opacity-40">
        <div className="w-20 h-20 rounded-full border border-purple-500/10 flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-purple-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.641.32a4 4 0 01-2.573.345l-2.387-.477a2 2 0 00-1.022.547l-1.162 1.162a2 2 0 01-1.414.586H4.293a2 2 0 01-1.414-.586L2 16.014a2 2 0 01-.586-1.414V14.293a2 2 0 01.586-1.414L3.414 11.464a2 2 0 011.414-.586h1.293a2 2 0 011.414.586l1.414 1.414a2 2 0 001.414.586h1.293a2 2 0 001.414-.586l1.414-1.414a2 2 0 011.414-.586h1.293a2 2 0 011.414.586l1.414 1.414a2 2 0 001.414.586h1.293" />
          </svg>
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.8em] text-center italic">Observing Probabilistic Void...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-black/20 relative z-10">
      {tasks.map(task => {
        const isOrch = task.id.startsWith('ORCH-');
        const isQA = task.id.startsWith('QA-');
        const isCode = task.id.startsWith('CODE-');
        const isSynthesis = task.id.startsWith('SY-');

        const getBaseColor = () => {
          if (task.status === TaskStatus.COMPLETED) return 'emerald';
          if (isOrch) return 'purple';
          if (isQA) return 'indigo';
          if (isSynthesis) return 'fuchsia';
          if (isCode) return 'blue';
          return 'slate';
        };

        const color = getBaseColor();

        return (
          <div 
            key={task.id} 
            className={`flex items-center gap-6 border rounded-3xl p-5 transition-all duration-700 ease-out group ${
              task.status === TaskStatus.COMPLETED 
                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60 grayscale-[0.5]' 
                : `bg-${color}-500/10 border-${color}-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-[1.01]`
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/5 transition-all ${
              task.status === TaskStatus.COMPLETED 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : `bg-${color}-500/20 text-${color}-400 shadow-[0_0_15px_rgba(var(--tw-color-${color}-500),0.3)]`
            }`}>
              <span className="text-[7px] font-black opacity-60 uppercase leading-none mb-1">
                {isOrch ? 'Orch' : isQA ? 'Elite' : isSynthesis ? 'Sync' : 'Task'}
              </span>
              <span className="font-mono text-[11px] font-black tracking-tighter">
                {task.id.split('-')[0]}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-2.5">
                <div className="min-w-0">
                  <p className={`text-[13px] font-bold truncate pr-6 ${task.status === TaskStatus.COMPLETED ? 'text-slate-400' : 'text-slate-100'}`}>
                    {task.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border transition-all ${
                      isOrch ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' : 
                      isQA ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 
                      'bg-slate-800 text-slate-500 border-white/5'
                    }`}>
                      {isOrch ? 'Quantum Path Optimization' : isQA ? 'Elite Supervision Cycle' : 'Neural Processing'}
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono font-bold tracking-tighter opacity-60">ENTANGLEMENT: {task.assignedTo}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[12px] font-mono font-black ${task.status === TaskStatus.COMPLETED ? 'text-emerald-500/50' : `text-${color}-400`}`}>
                    {task.progress}%
                  </span>
                </div>
              </div>
              
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                <div 
                  className={`h-full transition-all duration-1000 ease-in-out relative rounded-full ${
                    task.status === TaskStatus.COMPLETED ? 'bg-emerald-500/40' : `bg-${color}-500 shadow-[0_0_10px_rgba(var(--tw-color-${color}-500),0.5)]`
                  }`}
                  style={{ width: `${task.progress}%` }}
                >
                  {task.status === TaskStatus.IN_PROGRESS && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[quantum_scan_1.5s_infinite]"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 min-w-[110px] text-right">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border tracking-[0.2em] uppercase transition-all ${
                task.status === TaskStatus.COMPLETED 
                  ? 'border-emerald-500/20 text-emerald-500/40 bg-emerald-500/5' 
                  : `border-${color}-500/40 text-${color}-400 bg-${color}-500/10`
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes quantum_scan {
          0% { transform: translateX(-150%) skewX(-30deg) }
          100% { transform: translateX(150%) skewX(-30deg) }
        }
      `}</style>
    </div>
  );
};
