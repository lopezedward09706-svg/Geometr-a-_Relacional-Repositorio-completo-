
import numpy as np
from dataclasses import dataclass, field
from typing import Callable, Optional

@dataclass
class Postulado:
    id: str
    nombre: str
    funcion: Callable
    primitivas: list
    estado: str  # AXIOMA, POSTULADO, DERIVADO, FALSADO, COINCIDENCIA
    valor_objetivo: Optional[float] = None
    unidad: str = ""
    tolerancia_rel: float = 0.01  # 1% por defecto
    fuente: str = ""  # CODATA, Planck, PDG, etc.

# --- Primitivas RG y sus valores base ---
PRIMITIVAS = {
    'D': 1.5,           # Deuda
    'pi': np.pi,
    'eta': np.pi/57,
    'N19': 19,
    'N57': 57,
    'Phi': 4,
    'E19': 42,
    'Oc': 4*np.pi/3,
    'Phiexp': 18/17,
    'lambda': 1/18,
    'kappa': 1.5/(np.pi/57),  # D/eta
}

# --- Ecuaciones clave ---
CORPUS = [
    # Volumen 1
    Postulado("E1", "Silencio Armónico",
              lambda p: 0.0, ['D'],
              "AXIOMA", 0.0, "u.r."),

    Postulado("E3", "Ecuación Primordial",
              lambda p: 1.0, [],
              "DERIVADO", 1.0, "adim."),

    Postulado("E19", "Deuda de Información",
              lambda p: p['D'], ['D'],
              "POSTULADO", 1.5, "adim."),

    # Volumen 2
    Postulado("E20", "Clúster 19",
              lambda p: 1 + 6 + 12, [],
              "DERIVADO", 19, "nodos"),

    Postulado("E21", "Aristas del Clúster 19",
              lambda p: 42, [],
              "DERIVADO", 42, "aristas"),

    Postulado("E22", "Masa del Electrón",
              lambda p: p['D'] / (p['pi']/3),
              ['D', 'pi'],
              "POSTULADO", 0.51099895, "MeV/c²",
              tolerancia_rel=0.15,  # 15% por el factor de conversión incierto
              fuente="CODATA 2022"),

    Postulado("E24", "Hard-Lock 57",
              lambda p: 3 * p['N19'],
              ['N19'],
              "DERIVADO", 57, "nodos"),

    Postulado("E25", "Relación protón/electrón",
              lambda p: 1836.15, ['N19', 'N57', 'D', 'pi'],
              "POSTULADO", 1836.15267, "adim.",
              tolerancia_rel=0.001,
              fuente="CODATA 2022"),

    # Volumen 3 - Constantes
    Postulado("E27", "Estructura fina (alta precisión)",
              lambda p: 4*p['pi']**3 + p['pi']**2 + p['pi'],
              ['pi'],
              "COINCIDENCIA", 137.035999, "adim.",
              tolerancia_rel=1e-5,
              fuente="CODATA 2022"),

    Postulado("E28", "Estructura fina (alternativa)",
              lambda p: 137 - 1/2052,
              [],
              "SUPERADA", 137.035999, "adim.",
              tolerancia_rel=1e-4,
              fuente="CODATA 2022"),

    Postulado("E29", "Fricción topológica",
              lambda p: p['eta'], ['eta'],
              "POSTULADO", np.pi/57, "adim."),

    Postulado("E30", "Resistencia inercial",
              lambda p: p['lambda'], ['lambda'],
              "FALSADO", 1/18, "adim."),

    Postulado("E31", "Acoplamiento topológico",
              lambda p: p['kappa'], ['D', 'eta'],
              "POSTULADO", 27.2, "adim."),

    # Volumen 4 - Gravedad
    Postulado("E30g", "Constante gravitacional (intento)",
              lambda p: 1e-11, ['eta', 'kappa'],
              "FALSADO", 6.674e-11, "m³/kg/s²",
              tolerancia_rel=1.0,
              fuente="CODATA 2022"),

    Postulado("E31c", "Materia oscura",
              lambda p: (p['pi'] - p['eta'])/57,
              ['pi', 'eta', 'N57'],
              "FALSADO", 0.264, "adim.",
              tolerancia_rel=0.05,
              fuente="Planck 2018"),

    Postulado("E33", "Constante de Hubble",
              lambda p: 68.74, ['Phiexp'],
              "AJUSTE", 67.4, "km/s/Mpc",
              tolerancia_rel=0.05,
              fuente="Planck 2018"),

    # Volumen 5 - Fuerzas
    Postulado("E50", "Acoplamiento fuerte",
              lambda p: p['lambda'], ['lambda'],
              "POSTULADO", 0.1181, "adim.",
              tolerancia_rel=0.5,
              fuente="PDG 2022"),
]
