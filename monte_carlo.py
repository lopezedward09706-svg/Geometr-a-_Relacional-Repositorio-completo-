#!/usr/bin/env python3
"""
MÓDULO DE MONTE CARLO
Geometría Relacional (RG) — Simulación de Perturbaciones
"""

import numpy as np
from config import N_NODOS, N_SAMPLES_MC, EPSILONS, SEED
from topology import construir_matriz_adyacencia
from hamiltonian import energia_red, deuda_informacion
from postulates import verificar_postulados

def ejecutar_monte_carlo(n_samples: int = None) -> dict:
    """
    Ejecuta simulación Monte Carlo sobre el Silencio Armónico.
    
    Perturba el Silencio con ruido gaussiano de amplitud ε
    y mide energía, deuda y cumplimiento de postulados.
    
    Args:
        n_samples: Número de muestras por ε
    
    Returns:
        Diccionario con resultados
    """
    if n_samples is None:
        n_samples = N_SAMPLES_MC
    
    A = construir_matriz_adyacencia()
    rng = np.random.default_rng(SEED)
    theta_silencio = np.zeros(N_NODOS)
    
    epsilons = EPSILONS
    n_eps = len(epsilons)
    
    E_media = np.zeros(n_eps)
    E_std = np.zeros(n_eps)
    D_media = np.zeros(n_eps)
    D_std = np.zeros(n_eps)
    cumplen_suma = np.zeros(n_eps)
    cumplen_deuda = np.zeros(n_eps)
    
    print(f"\n  MONTE CARLO: {n_samples} muestras × {n_eps} valores de ε")
    
    for i, eps in enumerate(epsilons):
        energias = np.zeros(n_samples)
        deudas = np.zeros(n_samples)
        cumple_s = 0
        cumple_d = 0
        
        for s in range(n_samples):
            theta_pert = eps * rng.normal(0, 1, N_NODOS)
            theta = theta_silencio + theta_pert
            
            energias[s] = energia_red(theta, A)
            deudas[s] = deuda_informacion(theta)
            
            post = verificar_postulados(theta)
            if post['cumple_suma']: cumple_s += 1
            if post['cumple_deuda']: cumple_d += 1
        
        E_media[i] = np.mean(energias)
        E_std[i] = np.std(energias)
        D_media[i] = np.mean(deudas)
        D_std[i] = np.std(deudas)
        cumplen_suma[i] = cumple_s / n_samples * 100
        cumplen_deuda[i] = cumple_d / n_samples * 100
        
        if i % 5 == 0:
            print(f"    ε={eps:.2e}: E={E_media[i]:.6f}, 𝔇={D_media[i]:.4f}, "
                  f"Suma={cumplen_suma[i]:.0f}%, Deuda={cumplen_deuda[i]:.0f}%")
    
    return {
        'epsilons': epsilons,
        'E_media': E_media, 'E_std': E_std,
        'D_media': D_media, 'D_std': D_std,
        'cumplen_suma': cumplen_suma, 'cumplen_deuda': cumplen_deuda,
    }
