#!/usr/bin/env python3
"""
MÓDULO DEL HAMILTONIANO
Geometría Relacional (RG) — Energía y Deuda
"""

import numpy as np
from config import N_NODOS, DEUDA_TEORICA
from topology import construir_matriz_adyacencia

def energia_red(theta: np.ndarray, A: np.ndarray = None) -> float:
    """
    Calcula la energía total de la red: Ĥ = Σ[1 - cos(θᵢ - θⱼ)].
    
    Args:
        theta: Array de fases (N_NODOS,)
        A: Matriz de adyacencia (opcional)
    
    Returns:
        Energía normalizada
    """
    if A is None:
        A = construir_matriz_adyacencia()
    
    E = 0.0
    for i in range(N_NODOS):
        for j in range(i+1, N_NODOS):
            if A[i, j] > 0:
                E += 1 - np.cos(theta[i] - theta[j])
    
    return E / (N_NODOS * (N_NODOS-1) / 2)


def deuda_informacion(theta: np.ndarray) -> float:
    """
    Estima la Deuda de Información 𝔇 a partir de las fases.
    
    Extrae los roles efectivos (A,B,a,b,c,C) de la configuración
    de fases y calcula 𝔇 = ABC - 2abc.
    
    Args:
        theta: Array de fases (N_NODOS,)
    
    Returns:
        Deuda de Información estimada
    """
    c_phase = theta[0]                      # Centro (huella)
    a_phases = theta[1:7]                   # Primer anillo (sombras)
    b_phases = theta[7:19]                  # Segundo anillo (envoltura)
    
    # Roles efectivos
    A_eff = 1.0 + np.mean(np.sin(a_phases))
    B_eff = 1.0 + np.mean(np.cos(a_phases))
    C_eff = 2.0 + np.mean(np.sin(b_phases))
    a_eff = 0.5 + np.std(a_phases) / 10
    b_eff = 0.5 + np.std(b_phases) / 10
    c_eff = 1.0 + abs(c_phase) / np.pi
    
    return A_eff * B_eff * C_eff - 2 * a_eff * b_eff * c_eff


def energia_por_nodo(theta: np.ndarray, A: np.ndarray = None) -> np.ndarray:
    """
    Calcula la energía local en cada nodo.
    
    Args:
        theta: Array de fases
        A: Matriz de adyacencia
    
    Returns:
        Array de energías por nodo
    """
    if A is None:
        A = construir_matriz_adyacencia()
    
    E_nodal = np.zeros(N_NODOS)
    for i in range(N_NODOS):
        for j in range(N_NODOS):
            if A[i, j] > 0:
                E_nodal[i] += 1 - np.cos(theta[i] - theta[j])
        if np.sum(A[i]) > 0:
            E_nodal[i] /= np.sum(A[i])
    
    return E_nodal


def potencial_metaestable(theta: float) -> float:
    """
    Calcula el potencial metaestable V(θ).
    
    V(θ) = (𝔇/N)[(θ/π)⁴ - 2(θ/π)² + 1]
    
    Args:
        theta: Ángulo de fase
    
    Returns:
        Valor del potencial
    """
    x = theta / np.pi
    return (DEUDA_TEORICA / N_NODOS) * (x**4 - 2*x**2 + 1)
