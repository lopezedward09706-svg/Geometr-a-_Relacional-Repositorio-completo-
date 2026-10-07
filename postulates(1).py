#!/usr/bin/env python3
"""
MÓDULO DE VERIFICACIÓN DE POSTULADOS
Geometría Relacional (RG) — Validación de Ecuaciones Fundamentales
"""

import numpy as np
from config import N_NODOS, DEUDA_TEORICA

def verificar_postulados(theta: np.ndarray) -> dict:
    """
    Verifica todos los postulados de la RG a partir de las fases.
    
    Verifica:
        1. Ecuación Maestra (suma): A+B+C = 2(a+b+c)
        2. Deuda de Información: 𝔇 = ABC - 2abc = 1.5
        3. Valores de los Seis Roles
    
    Args:
        theta: Array de fases (N_NODOS)
    
    Returns:
        Diccionario con resultados de verificación
    """
    c_phase = theta[0]
    a_phases = theta[1:7]
    b_phases = theta[7:19]
    
    # Roles efectivos
    A_eff = 1.0 + np.mean(np.sin(a_phases))
    B_eff = 1.0 + np.mean(np.cos(a_phases))
    a_eff = 0.5 + np.std(a_phases) / 10
    b_eff = 0.5 + np.std(b_phases) / 10
    c_eff = 1.0 + abs(c_phase) / np.pi
    C_eff = A_eff / a_eff if a_eff > 0 else 2.0
    
    # Verificaciones
    suma_lhs = A_eff + B_eff + C_eff
    suma_rhs = 2 * (a_eff + b_eff + c_eff)
    cumple_suma = abs(suma_lhs - suma_rhs) < 0.15
    
    D_est = A_eff * B_eff * C_eff - 2 * a_eff * b_eff * c_eff
    cumple_deuda = abs(D_est - DEUDA_TEORICA) < 0.15
    
    # Joya del Arquitecto
    joya_1 = 2 * DEUDA_TEORICA
    joya_2 = A_eff + B_eff + a_eff + b_eff
    joya_3 = C_eff + c_eff
    cumple_joya = abs(joya_1 - joya_2) < 0.2 and abs(joya_2 - joya_3) < 0.2
    
    # Ecuación de Contracción
    if a_eff > 0 and b_eff > 0 and c_eff > 0:
        contraccion = ((A_eff/a_eff) / (B_eff/b_eff) / (C_eff/c_eff)) * 2
        cumple_contraccion = abs(contraccion - 1.0) < 0.2
    else:
        contraccion = np.nan
        cumple_contraccion = False
    
    return {
        'A': A_eff, 'B': B_eff, 'a': a_eff, 'b': b_eff, 'c': c_eff, 'C': C_eff,
        'suma_lhs': suma_lhs, 'suma_rhs': suma_rhs,
        'deuda_est': D_est,
        'cumple_suma': cumple_suma,
        'cumple_deuda': cumple_deuda,
        'cumple_joya': cumple_joya,
        'cumple_contraccion': cumple_contraccion,
        'contraccion_val': contraccion,
    }


def imprimir_resultados(resultados: dict):
    """Imprime los resultados de verificación de postulados."""
    print("\n  VERIFICACIÓN DE POSTULADOS:")
    print(f"    Roles: A={resultados['A']:.3f}, B={resultados['B']:.3f}, "
          f"a={resultados['a']:.3f}, b={resultados['b']:.3f}, "
          f"c={resultados['c']:.3f}, C={resultados['C']:.3f}")
    print(f"    Ec. Maestra (suma): {resultados['suma_lhs']:.3f} = {resultados['suma_rhs']:.3f} "
          f"→ {'✓' if resultados['cumple_suma'] else '✗'}")
    print(f"    Deuda: 𝔇 = {resultados['deuda_est']:.3f} (teórica: {DEUDA_TEORICA}) "
          f"→ {'✓' if resultados['cumple_deuda'] else '✗'}")
    print(f"    Joya del Arquitecto: {'✓' if resultados['cumple_joya'] else '✗'}")
    print(f"    Contracción: {'✓' if resultados['cumple_contraccion'] else '✗'} "
          f"(valor: {resultados['contraccion_val']:.3f})")


def reporte_final(resultados: dict) -> str:
    """Genera un reporte textual de verificación."""
    todos_cumplen = all([
        resultados['cumple_suma'],
        resultados['cumple_deuda'],
        resultados['cumple_joya'],
        resultados['cumple_contraccion'],
    ])
    
    return f"""
    RESUMEN DE POSTULADOS:
    ═══════════════════════
    
    {'✓ TODOS LOS POSTULADOS CUMPLIDOS' if todos_cumplen else '⚠ ALGUNOS POSTULADOS NO CUMPLIDOS'}
    
    Ecuación Maestra (suma):    {'✓' if resultados['cumple_suma'] else '✗'}
    Deuda de Información (𝔇):   {'✓' if resultados['cumple_deuda'] else '✗'}
    Joya del Arquitecto:        {'✓' if resultados['cumple_joya'] else '✗'}
    Ecuación de Contracción:    {'✓' if resultados['cumple_contraccion'] else '✗'}
    """
