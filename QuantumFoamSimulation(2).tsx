
import React, { useRef, useEffect } from 'react';
import { SimulationParameters } from '../types';

interface QuantumFoamSimulationProps {
    params: SimulationParameters;
    onBack: () => void;
}

const QuantumFoamSimulation: React.FC<QuantumFoamSimulationProps> = ({ params, onBack }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const bubbles: {x: number, y: number, r: number, life: number, v: number}[] = [];
        
        const createBubble = () => {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 5 + 2,
                life: 1.0,
                v: Math.random() * 0.5 + 0.2
            };
        };

        for(let i=0; i<100; i++) bubbles.push(createBubble());

        const render = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = '#010108';
            ctx.fillRect(0, 0, w, h);

            // Background distortion effect
            ctx.strokeStyle = 'rgba(0, 255, 128, 0.05)';
            ctx.lineWidth = 1;
            for(let i=0; i<w; i+=40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                for(let j=0; j<h; j+=20) {
                    const offset = Math.sin(i * 0.01 + j * 0.01 + Date.now() * 0.002) * 10;
                    ctx.lineTo(i + offset, j);
                }
                ctx.stroke();
            }

            // Wheeler bubbles rendering
            bubbles.forEach((b, i) => {
                b.life -= 0.005 * params.timeSpeed;
                b.r += b.v;
                
                if(b.life <= 0) {
                    bubbles[i] = createBubble();
                }

                ctx.beginPath();
                const alpha = Math.sin(b.life * Math.PI);
                ctx.strokeStyle = `rgba(103, 232, 249, ${alpha * 0.3})`;
                ctx.fillStyle = `rgba(103, 232, 249, ${alpha * 0.1})`;
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.stroke();
                if(Math.random() > 0.98) ctx.fill();
            });

            frameId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(frameId);
    }, [params]);

    return (
        <div className="absolute inset-0 bg-[#010108] flex flex-col">
            <div className="absolute top-6 left-8 z-20">
                <h3 className="text-xl font-black text-white tracking-[0.3em] uppercase">Espuma de Wheeler</h3>
                <div className="text-[10px] text-cyan-400 font-mono mt-1">SISTEMA VIBRACIONAL v3.0 // ESCALA PLANCK</div>
            </div>
            <button 
                onClick={onBack}
                className="absolute top-6 right-8 z-20 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all"
            >
                Cerrar Vista
            </button>
            <canvas ref={canvasRef} width={1200} height={800} className="w-full h-full opacity-60" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#010108] via-transparent to-transparent"></div>
        </div>
    );
};

export default QuantumFoamSimulation;
