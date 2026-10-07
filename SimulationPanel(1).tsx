
import React, { useRef, useEffect } from 'react';
import { GlobalState } from '../types';

interface SimulationPanelProps {
    metrics: any; 
    simulationStateRef: React.MutableRefObject<GlobalState>;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ metrics, simulationStateRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let frameId: number;
        const render = () => {
            const state = simulationStateRef.current;
            if (!state || !state.parameters) {
                frameId = requestAnimationFrame(render);
                return;
            }

            const { width: w, height: h } = canvas;
            const cx = w / 2; const cy = h / 2;
            const zoom = 500 * Math.pow(0.7, state.parameters.scale - 6);

            // Default blend mode
            ctx.globalCompositeOperation = 'source-over';

            // Fondo de Archivo Clasificado v3.0
            ctx.fillStyle = '#010105';
            ctx.fillRect(0, 0, w, h);
            
            // Scanlines
            ctx.fillStyle = 'rgba(0, 255, 0, 0.01)';
            for(let i = 0; i < h; i += 4) { ctx.fillRect(0, i, w, 1); }

            // --- 0. TEJIDO DE CURVATURA ζ ---
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 255, 120, 0.03)';
            ctx.lineWidth = 0.5;
            const gridSize = 32;
            for(let x = 0; x <= w; x += gridSize) {
                ctx.moveTo(x, 0);
                for(let y = 0; y <= h; y += 12) {
                    let dx = 0;
                    state.nodes.forEach((n: any) => {
                        if (n.isCollapsed || (n.zeta || 1) <= 1.01) return;
                        const nx = cx + n.x * zoom; const ny = cy + n.y * zoom;
                        const d2 = (x - nx)**2 + (y - ny)**2;
                        if (d2 < 15000) {
                            const strength = ((n.zeta || 1) - 1) * 0.5;
                            dx += (nx - x) * strength * (1 - Math.sqrt(d2)/120);
                        }
                    });
                    ctx.lineTo(x + dx, y);
                }
            }
            ctx.stroke();

            // --- 1. RAYOS DE EQUILIBRIO ABC ---
            ctx.globalCompositeOperation = 'screen';
            state.nodes.forEach((n: any) => {
                if (n.isCollapsed) return;
                const nx = cx + n.x * zoom; const ny = cy + n.y * zoom;
                const zetaFactor = Math.pow(n.zeta || 1, 1.05);
                const baseLen = 14 * (zoom / 500) * (n.superposition || 1) * zetaFactor;
                const alpha = Math.max(0.1, 0.9 - state.parameters.scale / 10);

                const drawRay = (v: {x:number, y:number, z:number}, hue: number, phaseOffset: number) => {
                    const osc = Math.sin(n.vibrationPhase + phaseOffset);
                    const length = baseLen * (0.95 + Math.abs(osc) * 0.2);
                    const vx = nx + (v?.x || 0) * length;
                    const vy = ny + (v?.y || 0) * length;

                    ctx.beginPath();
                    ctx.moveTo(nx, ny);
                    ctx.lineTo(vx, vy);
                    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha * (n.superposition || 1)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                };

                // Triada de colores de equilibrio
                const vecA = n.vecA || {x: 1, y: 0, z: 0};
                const vecB = n.vecB || {x: -0.5, y: 0.866, z: 0};
                const vecC = n.vecC || {x: -0.5, y: -0.866, z: 0};

                drawRay(vecA, 140, 0);          
                drawRay(vecB, 200, Math.PI * 0.66);
                drawRay(vecC, 280, Math.PI * 1.33);

                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(nx, ny, 1.2, 0, Math.PI * 2); ctx.fill();
            });

            // --- 2. QUARKS Y HADRONIZACIÓN ---
            ctx.globalCompositeOperation = 'source-over';
            state.quarks.forEach((q: any) => {
                const qx = cx + (q.position?.x || q.x) * zoom; 
                const qy = cy + (q.position?.y || q.y) * zoom;
                ctx.shadowBlur = 15;
                ctx.shadowColor = q.color;
                ctx.fillStyle = q.color;
                ctx.beginPath(); ctx.arc(qx, qy, 5 * (zoom/500), 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [simulationStateRef]);

    return (
        <div className="bg-[#010105] border border-green-500/20 rounded-xl h-full relative overflow-hidden shadow-[inset_0_0_150px_rgba(0,0,0,1)]">
            <div className="absolute top-4 left-6 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <div className="flex flex-col">
                        <div className="text-[10px] text-green-400 font-black tracking-[0.3em] uppercase">SISTEMA ABC v3.0 // EQUILIBRIO</div>
                        <div className="text-[7px] text-green-900 font-mono font-bold tracking-widest uppercase">Protocolo RQNT_BRIDGE: Sincronizado</div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} width={800} height={500} className="w-full h-full" />
        </div>
    );
};

export default SimulationPanel;
