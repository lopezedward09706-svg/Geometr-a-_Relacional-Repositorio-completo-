#!/usr/bin/env python3
"""
MÓDULO DE DINÁMICA
Geometría Relacional (RG) — Evolución Temporal DNLS
"""

import numpy as np
from scipy.integrate import solve_ivp
from config import N_NODOS, GAMMA, T_MAX
from topology import construir_matriz_adyacencia

def rhs_dnls(t: float, psi: np.ndarray, A: np.ndarray, gamma: float) -> np.ndarray:
    """
    Lado derecho de la Ecuación de Schrödinger No Lineal Discreta.
    
    i dψₙ/dt = -Σₘ Aₙₘ ψₘ - γ|ψₙ|²ψₙ
    
    Args:
        t: Tiempo (no usado, ecuación autónoma)
        psi: Vector de estado (2N: parte real + imaginaria)
        A: Matriz de adyacencia
        gamma: Coeficiente no lineal
    
    Returns:
        dψ/dt (2N)
    """
    psi_complex = psi[:N_NODOS] + 1j * psi[N_NODOS:]
    
    # Término lineal: -i Σ Aᵢⱼ ψⱼ
    lineal = -1j * (A @ psi_complex)
    
    # Término no lineal: -i γ |ψ|² ψ
    no_lineal = -1j * gamma * np.abs(psi_complex)**2 * psi_complex
    
    dpsi = lineal + no_lineal
    return np.concatenate([np.real(dpsi), np.imag(dpsi)])


def evolucionar(psi0: np.ndarray, A: np.ndarray = None, 
                t_span: tuple = None, n_points: int = 500) -> dict:
    """
    Evoluciona el sistema desde un estado inicial.
    
    Args:
        psi0: Estado inicial (complejo, N_NODOS)
        A: Matriz de adyacencia
        t_span: (t_inicio, t_final)
        n_points: Número de puntos de evaluación
    
    Returns:
        Diccionario con t, psi_history, E_history, D_history, S_history
    """
    if A is None:
        A = construir_matriz_adyacencia()
    if t_span is None:
        t_span = (0, T_MAX)
    
    t_eval = np.linspace(t_span[0], t_span[1], n_points)
    y0 = np.concatenate([np.real(psi0), np.imag(psi0)])
    
    print(f"  Evolucionando DNLS: t ∈ [{t_span[0]}, {t_span[1]}], {n_points} puntos...")
    
    sol = solve_ivp(
        rhs_dnls, t_span, y0, t_eval=t_eval, args=(A, GAMMA),
        method='RK45', rtol=1e-6, atol=1e-9
    )
    
    t = sol.t
    psi_history = sol.y[:N_NODOS, :] + 1j * sol.y[N_NODOS:, :]
    
    return {
        't': t,
        'psi_history': psi_history,
        'psi_final': psi_history[:, -1],
        'theta_final': np.angle(psi_history[:, -1]),
    }


def calcular_historial(t: np.ndarray, psi_history: np.ndarray, 
                       A: np.ndarray = None) -> dict:
    """
    Calcula energía, deuda y entropía a lo largo de la evolución.
    
    Args:
        t: Array de tiempos
        psi_history: Historia de estados (N × n_tiempos)
        A: Matriz de adyacencia
    
    Returns:
        Diccionario con E_t, D_t, S_t
    """
    from hamiltonian import energia_red, deuda_informacion
    
    if A is None:
        A = construir_matriz_adyacencia()
    
    n_t = len(t)
    E_t = np.zeros(n_t)
    D_t = np.zeros(n_t)
    S_t = np.zeros(n_t)
    
    for i in range(n_t):
        theta_t = np.angle(psi_history[:, i])
        E_t[i] = energia_red(theta_t, A)
        D_t[i] = deuda_informacion(theta_t)
        
        dens = np.abs(psi_history[:, i])**2
        p = dens / np.sum(dens)
        S_t[i] = -np.sum(p[p > 1e-12] * np.log(p[p > 1e-12]))
    
    return {'E_t': E_t, 'D_t': D_t, 'S_t': S_t}
