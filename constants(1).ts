
import { SimulationParameters } from './types';

export const IA_COLORS = {
    ia1: '#FF4444',
    ia2: '#4444FF',
    ia3: '#44FF44',
    ia4: '#FF44FF',
    ia5: '#FFFF44',
    ia6: '#44FFFF',
    ia7: '#FF8844',
    ia8: '#00FF9D', // Verde neón cuántico
    system: '#4fc3f7',
    user: '#ffffff'
};

export const INITIAL_PARAMETERS: SimulationParameters = {
    scale: 0,
    n_abc: 100,
    centralMass: 1.0,
    timeSpeed: 1.0,
    velocity: 0,
    density: 1.0,
    strongEnergy: 1.0,
    weakEnergy: 0.1,
    radioPi: 1.0,
    evolutionRate: 0.05,
    dimensionCount: 3.0
};

export const PRESETS: Record<string, SimulationParameters> = {
    planckSoup: { scale: 0, n_abc: 300, centralMass: 0, timeSpeed: 5.0, velocity: 90, density: 0.1, strongEnergy: 0.1, weakEnergy: 1.0, radioPi: 3.0, evolutionRate: 0.2, dimensionCount: 3.0 },
    atomicFormation: { scale: 1, n_abc: 400, centralMass: 0, timeSpeed: 0.5, velocity: 0, density: 3.0, strongEnergy: 5.0, weakEnergy: 0.001, radioPi: 1.0, evolutionRate: 0.01, dimensionCount: 3.0 },
    blackHole: { scale: 6, n_abc: 500, centralMass: 15, timeSpeed: 0.2, velocity: 0, density: 5.0, strongEnergy: 10.0, weakEnergy: 0.001, radioPi: 0.2, evolutionRate: 0.05, dimensionCount: 3.0 },
    lightSpeedTest: { scale: 8, n_abc: 150, centralMass: -2.0, timeSpeed: 2.0, velocity: 99, density: 0.5, strongEnergy: 0.5, weakEnergy: 0.5, radioPi: 1.5, evolutionRate: 0.1, dimensionCount: 3.0 },
    quantumEntanglement: { scale: 0, n_abc: 200, centralMass: 0.5, timeSpeed: 1.0, velocity: 0, density: 2.0, strongEnergy: 2.0, weakEnergy: 2.0, radioPi: 2.5, evolutionRate: 0.1, dimensionCount: 3.0 }
};

export const COSMOLOGICAL_TIMELINE = [
    { t: "0s", event: "BANG ABSOLUTO", log: "[IA-1]: ¡INICIO! 10⁸⁰ nodos primordiales. Energía del vacío 10¹⁹ GeV." },
    { t: "10⁻⁴³s", event: "TIEMPO DE PLANCK", log: "[IA-2]: 47 ciclos A→B→C estables. Coherencia Δ < 0.005." },
    { t: "10⁻³⁵s", event: "INFLACIÓN", log: "[IA-3]: Formación masiva de tripletes acc, aac, abc. Expansión 10³⁰x." },
    { t: "10⁻⁶s", event: "ERA DE LOS QUARKS", log: "[IA-2]: Ratio UP/DOWN: 1.02/1. Carga neta converge a -0.666." },
    { t: "1s", event: "NUCLEOSÍNTESIS", log: "[CONSENSO]: Helio-4 al 24.3%. Coincidencia con observación real: 99.8%." }
];

export const PLANCK_ENERGY = 1.9561e9;
export const SCALE_LABELS = ['Planck', 'Maya/Grid', 'Atomic', 'Molecular', 'Micro', 'Humano', 'Planetario', 'Estelar', 'Cósmico'];
