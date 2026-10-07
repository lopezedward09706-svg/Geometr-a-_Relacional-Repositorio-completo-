#!/usr/bin/env python3
"""
PROGRAMA PRINCIPAL
Geometría Relacional (RG) — Monte Carlo del Silencio Armónico
"""

import numpy as np
import time
from config import SEED, N_NODOS, GAMMA
from topology import construir_matriz_adyacencia, imprimir_info_topologia
from hamiltonian import energia_red, deuda_informacion
from dynamics import evolucionar, calcular_historial
from postulates import verificar_postulados, imprimir_resultados
from monte_carlo import ejecutar_monte_carlo
from visualization import graficar_silencio_ruptura

def main():
    inicio = time.time()
    
    print()
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║   MONTE CARLO DEL SILENCIO ARMÓNICO Y SU RUPTURA               ║")
    print("║   Primera Auto-Comparación — Verificación de Postulados         ║")
    print("║   Edward P. López (El Arquitecto) — Julio 2026                  ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    
    np.random.seed(SEED)
    
    # ================================================================
    # 1. TOPOLOGÍA
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 1: CONSTRUCCIÓN DE LA TOPOLOGÍA")
    print("="*70)
    A = construir_matriz_adyacencia()
    imprimir_info_topologia(A)
    
    # ================================================================
    # 2. SILENCIO ARMÓNICO
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 2: SILENCIO ARMÓNICO")
    print("="*70)
    theta_silencio = np.zeros(N_NODOS)
    E_sil = energia_red(theta_silencio, A)
    D_sil = deuda_informacion(theta_silencio)
    post_sil = verificar_postulados(theta_silencio)
    
    print(f"\n  Ĥ|0⟩ = {E_sil:.15f}")
    print(f"  𝔇|0⟩ = {D_sil:.15f}")
    imprimir_resultados(post_sil)
    
    # ================================================================
    # 3. MONTE CARLO
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 3: SIMULACIÓN MONTE CARLO")
    print("="*70)
    resultados_mc = ejecutar_monte_carlo(n_samples=1000)
    
    # ================================================================
    # 4. EVOLUCIÓN TEMPORAL
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 4: EVOLUCIÓN TEMPORAL (DNLS)")
    print("="*70)
    
    rng = np.random.default_rng(SEED)
    psi0 = np.ones(N_NODOS, dtype=complex) + 0.01 * rng.normal(N_NODOS) + 1j * 0.01 * rng.normal(N_NODOS)
    
    din = evolucionar(psi0, A)
    hist = calcular_historial(din['t'], din['psi_history'], A)
    din.update(hist)
    
    # ================================================================
    # 5. VERIFICACIÓN FINAL
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 5: VERIFICACIÓN DE POSTULADOS")
    print("="*70)
    post_final = verificar_postulados(din['theta_final'])
    imprimir_resultados(post_final)
    
    # ================================================================
    # 6. VISUALIZACIÓN
    # ================================================================
    print("\n" + "="*70)
    print("  FASE 6: GENERANDO VISUALIZACIONES")
    print("="*70)
    graficar_silencio_ruptura(resultados_mc, din, post_final, save=True)
    
    fin = time.time()
    print(f"\n  ✓ Simulación completada en {fin-inicio:.1f} segundos")
    print(f"  Archivo: rg_silencio_ruptura.png")
    
    return 0

if __name__ == "__main__":
    exit(main())
