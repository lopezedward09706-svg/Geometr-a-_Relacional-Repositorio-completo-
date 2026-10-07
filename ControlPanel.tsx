
import React, { useState } from 'react';
import { SimulationParameters } from '../types';
import { PRESETS, SCALE_LABELS } from '../constants';

interface ControlPanelProps {
    params: SimulationParameters;
    onParamChange: (key: keyof SimulationParameters, value: number) => void;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onRunAllIAs: () => void;
    onLoadPreset: (preset: SimulationParameters) => void;
    onSaveDeduction: (text: string) => void;
    onTransfer?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
    params, onParamChange, onStart, onPause, onReset, onRunAllIAs, onLoadPreset, onSaveDeduction, onTransfer
}) => {
    const [deduction, setDeduction] = useState("");

    const renderSlider = (label: string, key: keyof SimulationParameters, min: number, max: number, step: number, color: string, displayValue?: string) => (
        <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">{label}</span>
                <span className={`font-bold text-${color}-400`}>{displayValue || params[key]}</span>
            </div>
            <input 
                type="range" min={min} max={max} step={step} 
                value={params[key] ?? min}
                onChange={(e) => onParamChange(key, parseFloat(e.target.value))}
                className={`w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-${color}-500`}
            />
        </div>
    );

    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold border-b-2 border-white/20 pb-2 mb-4">🎛️ CONTROLES UNIVERSALES</h3>
            
            {renderSlider('Escala Dimensional', 'scale', 0, 8, 1, 'cyan', SCALE_LABELS[params.scale])}
            {renderSlider('Densidad (Triángulos N_abc)', 'n_abc', 10, 500, 10, 'purple')}
            {renderSlider('Masa Central (Deformación)', 'centralMass', 0, 10, 0.5, 'orange')}
            {renderSlider('Dimensiones Activas', 'dimensionCount', 1, 11, 1, 'indigo')}
            
            <div className="border-t border-white/10 pt-2 mb-2">
                <h4 className="text-xs font-bold text-gray-400 mb-2">FÍSICA AVANZADA</h4>
                {renderSlider('Velocidad Nave (% c)', 'velocity', 0, 99, 1, 'red', `${params.velocity}%`)}
                {renderSlider('Densidad Espacial', 'density', 0.1, 3.0, 0.1, 'blue')}
                {renderSlider('Energía Fuerte (Unión)', 'strongEnergy', 0.1, 10, 0.1, 'green')}
                {renderSlider('Energía Débil (Decaimiento)', 'weakEnergy', 0.001, 1, 0.001, 'yellow')}
                {renderSlider('Geometría Pi (Vibración)', 'radioPi', 0.1, 3.0, 0.1, 'pink')}
            </div>

            <div className="flex gap-2 mb-4">
                 <button onClick={onStart} className="flex-1 py-2 bg-green-600/80 rounded hover:bg-green-500 font-bold text-sm">▶ INICIAR</button>
                 <button onClick={onPause} className="flex-1 py-2 bg-yellow-600/80 rounded hover:bg-yellow-500 font-bold text-sm">⏸ PAUSAR</button>
                 <button onClick={onReset} className="flex-1 py-2 bg-red-600/80 rounded hover:bg-red-500 font-bold text-sm">↺ REINICIAR</button>
            </div>
            
            <button onClick={onRunAllIAs} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded font-bold mb-3 hover:shadow-lg transition-all text-xs sm:text-sm">
                🤖 EJECUTAR 8 IAS (AUTÓNOMOS)
            </button>
            
            {onTransfer && (
                <button onClick={onTransfer} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-bold mb-6 hover:shadow-lg transition-all text-xs sm:text-sm border border-white/20">
                    🌌 TRANSFERIR DATOS A SIMULACIÓN AVANZADA
                </button>
            )}

            <div className="bg-black/30 p-3 rounded border border-white/10 mb-4">
                <label className="text-xs font-bold text-gray-400 mb-2 block">📝 MIS DEDUCCIONES (PARA IA3):</label>
                <textarea 
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs h-16 text-white mb-2"
                    placeholder="Ayuda a las IAs con tus observaciones..."
                    value={deduction}
                    onChange={(e) => setDeduction(e.target.value)}
                />
                <button 
                    onClick={() => { onSaveDeduction(deduction); setDeduction(""); }}
                    className="w-full py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-cyan-200"
                >
                    GUARDAR EN MEMORIA
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onLoadPreset(PRESETS.planckSoup)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Sopa Planck</button>
                <button onClick={() => onLoadPreset(PRESETS.atomicFormation)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Átomos</button>
                <button onClick={() => onLoadPreset(PRESETS.blackHole)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Agujero Negro</button>
                <button onClick={() => onLoadPreset(PRESETS.lightSpeedTest)} className="p-2 text-xs bg-gray-700 rounded hover:bg-gray-600">Velocidad Luz</button>
            </div>
        </div>
    );
};

export default ControlPanel;
