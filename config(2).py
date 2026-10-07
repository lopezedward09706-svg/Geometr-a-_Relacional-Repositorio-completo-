#!/usr/bin/env python3
"""
MÓDULO DE CONFIGURACIÓN GLOBAL
Geometría Relacional (RG) — Constantes y Parámetros
"""

import numpy as np

# ============================================================
# CONSTANTES FUNDAMENTALES DE LA RG
# ============================================================
DEUDA_TEORICA = 1.5
LAMBDA = 1/18
ETA = np.pi / 57
OMEGA_CRIT = 4 * np.pi / 3

# ============================================================
# PARÁMETROS DE LA RED
# ============================================================
N_NODOS = 19
GAMMA = DEUDA_TEORICA / N_NODOS  # Tasa de inyección de Deuda

# ============================================================
# PARÁMETROS DE SIMULACIÓN
# ============================================================
SEED = 192657
N_SAMPLES_MC = 1000
T_MAX = 50.0
DT = 0.01
EPSILONS = np.logspace(-4, 0, 20)

# ============================================================
# COLORES
# ============================================================
COLORS = {
    'silence': '#1a1a2e',
    'excited': '#e94560',
    'center': '#f39c12',
    'ring1': '#3498db',
    'ring2': '#2ecc71',
    'deuda': '#e74c3c',
    'energy': '#9b59b6',
    'entropy': '#1abc9c',
    'potential': '#e67e22',
    'postulates': '#2c3e50',
}
