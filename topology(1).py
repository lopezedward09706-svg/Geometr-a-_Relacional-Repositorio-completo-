#!/usr/bin/env python3
"""
MÓDULO DE TOPOLOGÍA
Geometría Relacional (RG) — Construcción del Clúster 19
"""

import numpy as np
from config import N_NODOS

def construir_matriz_adyacencia() -> np.ndarray:
    """
    Construye la matriz de adyacencia del Clúster 19.
    
    Estructura:
        Nodo 0: Centro (huella c=1)
        Nodos 1-6: Primer anillo (6 nodos, sombras a,b)
        Nodos 7-18: Segundo anillo (12 nodos, envoltura C)
    
    Returns:
        Matriz de adyacencia A (19×19)
    """
    A = np.zeros((N_NODOS, N_NODOS))
    
    # Centro (0) → Anillo 1 (1-6)
    for i in range(1, 7):
        A[0, i] = A[i, 0] = 1
    
    # Conexiones dentro del Anillo 1 (hexágono)
    for i in range(1, 7):
        j = i + 1 if i < 6 else 1
        A[i, j] = A[j, i] = 1
    
    # Anillo 1 → Anillo 2 (7-18)
    for i in range(1, 7):
        idx1 = 6 + 2*(i-1) + 1
        idx2 = 6 + 2*(i-1) + 2
        A[i, idx1] = A[idx1, i] = 1
        A[i, idx2] = A[idx2, i] = 1
    
    # Conexiones dentro del Anillo 2
    for i in range(7, 19):
        j = i + 1 if i < 18 else 7
        A[i, j] = A[j, i] = 1
    
    return A


def obtener_posiciones() -> np.ndarray:
    """
    Calcula las coordenadas 2D para visualización del Clúster 19.
    
    Returns:
        Array de posiciones (19×2)
    """
    pos = np.zeros((N_NODOS, 2))
    
    # Centro
    pos[0] = [0, 0]
    
    # Anillo 1 (radio 1)
    for i in range(6):
        ang = i * np.pi / 3
        pos[1 + i] = [np.cos(ang), np.sin(ang)]
    
    # Anillo 2 (radio 2)
    for i in range(12):
        ang = i * np.pi / 6 + np.pi / 12
        pos[7 + i] = [2 * np.cos(ang), 2 * np.sin(ang)]
    
    return pos


def obtener_grados(A: np.ndarray) -> np.ndarray:
    """Calcula el grado de cada nodo."""
    return np.sum(A, axis=1)


def obtener_laplaciano(A: np.ndarray) -> np.ndarray:
    """Calcula el Laplaciano de grafo: L = D - A."""
    D = np.diag(np.sum(A, axis=1))
    return D - A


def imprimir_info_topologia(A: np.ndarray):
    """Imprime información sobre la topología."""
    grados = obtener_grados(A)
    
    print("\n  TOPOLOGÍA DEL CLÚSTER 19:")
    print(f"    Nodos totales: {N_NODOS}")
    print(f"    Centro (nodo 0): grado = {int(grados[0])}")
    print(f"    Anillo 1 (nodos 1-6): grados = {grados[1:7].astype(int)}")
    print(f"    Anillo 2 (nodos 7-18): grados = {grados[7:19].astype(int)}")
    print(f"    Enlaces totales: {int(np.sum(A)/2)}")
    print(f"    Enlaces activos esperados: 18")
    print(f"    ¿Coinciden? {'✓' if int(np.sum(A)/2) == 18 else '✗'}")
