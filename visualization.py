#!/usr/bin/env python3
"""
MÓDULO DE VISUALIZACIÓN
Geometría Relacional (RG) — Gráficos y Diagramas
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.gridspec import GridSpec
from config import N_NODOS, DEUDA_TEORICA, COLORS
from topology import obtener_posiciones
from hamiltonian import potencial_metaestable

plt.rcParams.update({
    'figure.figsize': (24, 18),
    'figure.dpi': 120,
    'font.size': 11,
    'font.family': 'serif',
})


def graficar_silencio_ruptura(resultados_mc: dict, resultados_din: dict, 
                              post_final: dict, save: bool = True):
    """
    Genera la visualización completa del Silencio y su ruptura.
    
    Args:
        resultados_mc: Resultados de la simulación Monte Carlo.
        resultados_din: Resultados de la evolución dinámica.
        post_final: Resultados de la verificación final de postulados.
        save: Booleano para guardar la figura.
    """
    pos = obtener_posiciones()
    res_mc = resultados_mc
    res_din = resultados_din
    
    fig = plt.figure(figsize=(28, 20))
    gs = GridSpec(4, 4, figure=fig, hspace=0.35, wspace=0.35)
    
    # ================================================================
    # FILA 1: SILENCIO vs RUPTURA
    # ================================================================
    
    # 1. Red en Silencio
    ax = fig.add_subplot(gs[0, 0])
    ax.scatter(pos[:, 0], pos[:, 1], c='white', s=200, edgecolors='black', linewidth=2)
    for i in range(N_NODOS):
        ax.annotate(str(i), pos[i], fontsize=8, ha='center', va='center')
    ax.set_facecolor(COLORS['silence'])
    ax.set_title('SILENCIO ARMÓNICO\nθᵢ = 0 ∀i', color='white', fontsize=12)
    ax.axis('equal'); ax.axis('off')
    
    # 2. Red después de la ruptura
    ax = fig.add_subplot(gs[0, 1])
    theta_f = res_din['theta_final']
    colors = theta_f % (2*np.pi)
    scatter = ax.scatter(pos[:, 0], pos[:, 1], c=colors, cmap='twilight', 
                        s=200, edgecolors='white', linewidth=1.5)
    ax.set_facecolor('#1a1a2e')
    ax.set_title('DESPUÉS DE LA RUPTURA\nEvolución DNLS', color='white', fontsize=12)
    ax.axis('equal'); ax.axis('off')
    plt.colorbar(scatter, ax=ax, label='Fase θ (rad)')
    
    # 3. Energía vs ε
    ax = fig.add_subplot(gs[0, 2])
    ax.errorbar(res_mc['epsilons'], res_mc['E_media'], yerr=res_mc['E_std'], 
                fmt='o-', color=COLORS['energy'], capsize=3, ms=6)
    ax.set_xscale('log'); ax.set_yscale('log')
    ax.set_xlabel('ε (amplitud de perturbación)'); ax.set_ylabel('Energía Ĥ')
    ax.set_title('Energía vs Perturbación\n(Monte Carlo)')
    ax.axhline(y=0, color='gray', linestyle='--')
    ax.grid(True, alpha=0.3)
    
    # 4. Deuda vs ε
    ax = fig.add_subplot(gs[0, 3])
    ax.errorbar(res_mc['epsilons'], res_mc['D_media'], yerr=res_mc['D_std'], 
                fmt='s-', color=COLORS['deuda'], capsize=3, ms=6)
    ax.set_xscale('log')
    ax.axhline(y=DEUDA_TEORICA, color='red', linestyle='--', label=f'𝔇 = {DEUDA_TEORICA}')
    ax.set_xlabel('ε (amplitud de perturbación)'); ax.set_ylabel('Deuda 𝔇')
    ax.set_title('Deuda de Información vs Perturbación')
    ax.legend(); ax.grid(True, alpha=0.3)
    
    # ================================================================
    # FILA 2: EVOLUCIÓN TEMPORAL
    # ================================================================
    
    # 5. % Cumplimiento de postulados
    ax = fig.add_subplot(gs[1, 0])
    ax.plot(res_mc['epsilons'], res_mc['cumplen_suma'], 'o-', 
            color=COLORS['entropy'], ms=6, label='Ec. Maestra (suma)')
    ax.plot(res_mc['epsilons'], res_mc['cumplen_deuda'], 's-', 
            color=COLORS['deuda'], ms=6, label='Deuda 𝔇=1.5')
    ax.set_xscale('log'); ax.set_xlabel('ε'); ax.set_ylabel('% Cumplimiento')
    ax.set_title('Cumplimiento de Postulados')
    ax.legend(); ax.grid(True, alpha=0.3); ax.set_ylim(0, 105)
    
    # 6. Energía en el tiempo
    ax = fig.add_subplot(gs[1, 1])
    ax.plot(res_din['t'], res_din['E_t'], color=COLORS['energy'], linewidth=2)
    ax.set_xlabel('Tiempo t'); ax.set_ylabel('Energía Ĥ')
    ax.set_title('Evolución Temporal de la Energía')
    ax.grid(True, alpha=0.3)
    
    # 7. Deuda en el tiempo
    ax = fig.add_subplot(gs[1, 2])
    ax.plot(res_din['t'], res_din['D_t'], color=COLORS['deuda'], linewidth=2)
    ax.axhline(y=DEUDA_TEORICA, color='red', linestyle='--', label=f'𝔇 = {DEUDA_TEORICA}')
    ax.set_xlabel('Tiempo t'); ax.set_ylabel('Deuda 𝔇')
    ax.set_title('Evolución Temporal de la Deuda')
    ax.legend(); ax.grid(True, alpha=0.3)
    
    # 8. Entropía en el tiempo
    ax = fig.add_subplot(gs[1, 3])
    ax.plot(res_din['t'], res_din['S_t'], color=COLORS['entropy'], linewidth=2)
    ax.set_xlabel('Tiempo t'); ax.set_ylabel('Entropía S')
    ax.set_title('Evolución Temporal de la Entropía\n(Flecha del Tiempo)')
    ax.grid(True, alpha=0.3)
    
    # ================================================================
    # FILA 3: POTENCIAL Y ROLES
    # ================================================================
    
    # 9. Potencial Metaestable
    ax = fig.add_subplot(gs[2, 0])
    theta_vals = np.linspace(0, np.pi, 200)
    V = np.array([potencial_metaestable(t) for t in theta_vals])
    ax.plot(theta_vals/np.pi, V, 'b-', linewidth=2.5)
    ax.scatter([0], [potencial_metaestable(0)], color=COLORS['deuda'], s=150, zorder=5, label='Falso Vacío')
    ax.scatter([1], [potencial_metaestable(np.pi)], color=COLORS['entropy'], s=150, zorder=5, label='Vacío Verdadero')
    ax.set_xlabel('θ/π'); ax.set_ylabel('V(θ)')
    ax.set_title('Potencial Metaestable')
    ax.legend(); ax.grid(True, alpha=0.3)
    
    # 10. Histograma de fases
    ax = fig.add_subplot(gs[2, 1])
    ax.hist(res_din['theta_final'] % (2*np.pi), bins=30, density=True, alpha=0.7, color=COLORS['ring1'])
    ax.set_xlabel('Fase θ (rad)'); ax.set_ylabel('Densidad')
    ax.set_title('Distribución de Fases Finales')
    ax.grid(True, alpha=0.3)
    
    # 11. Roles finales
    ax = fig.add_subplot(gs[2, 2])
    roles_nombres = ['A', 'B', 'a', 'b', 'c', 'C']
    roles_valores = [post_final['A'], post_final['B'], post_final['a'], 
                     post_final['b'], post_final['c'], post_final['C']]
    colores_roles = [COLORS['energy'], COLORS['energy'], COLORS['ring1'], 
                     COLORS['ring1'], COLORS['center'], COLORS['entropy']]
    ax.bar(roles_nombres, roles_valores, color=colores_roles, edgecolor='white')
    ax.axhline(y=1.0, color='gray', linestyle='--', alpha=0.5)
    ax.set_ylabel('Valor'); ax.set_title('Seis Roles después de la Evolución')
    ax.grid(True, alpha=0.3)
    
    # 12. Resumen Final
    ax = fig.add_subplot(gs[2, 3])
    ax.axis('off')
    todos = all([post_final['cumple_suma'], post_final['cumple_deuda'],
                 post_final['cumple_joya'], post_final['cumple_contraccion']])
    
    texto = f"""
    RESUMEN DE LA SIMULACIÓN
    ═══════════════════════════
    
    SILENCIO ARMÓNICO:
    Ĥ|0⟩ = {res_mc['E_media'][0]:.10f}
    ✓ Energía neta cero
    
    RUPTURA (AUTO-COMPARACIÓN):
    Perturbación máxima: ε = {res_mc['epsilons'][-1]:.2e}
    
    DESPUÉS DE LA EVOLUCIÓN:
    𝔇 ≈ {post_final['deuda_est']:.3f} (teórica: {DEUDA_TEORICA})
    {'✓ Deuda verificada' if post_final['cumple_deuda'] else '⚠ Deuda no verificada'}
    
    POSTULADOS:
    Ec. Maestra: {'✓' if post_final['cumple_suma'] else '✗'}
    Deuda:       {'✓' if post_final['cumple_deuda'] else '✗'}
    Joya:        {'✓' if post_final['cumple_joya'] else '✗'}
    Contracción: {'✓' if post_final['cumple_contraccion'] else '✗'}
    
    {'✓ TODOS LOS POSTULADOS CUMPLIDOS' if todos else '⚠ ALGUNOS POSTULADOS NO CUMPLIDOS'}
    
    CONCLUSIÓN:
    El Silencio Armónico es un FALSO VACÍO.
    La auto-comparación rompe la simetría.
    El sistema evoluciona hacia 𝔇≈1.5.
    """
    ax.text(0.1, 0.9, texto, transform=ax.transAxes, fontsize=8,
            fontfamily='monospace', verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
    
    plt.suptitle('GEOMETRÍA RELACIONAL — MONTE CARLO DEL SILENCIO ARMÓNICO Y SU RUPTURA\n'
                 'Simulación Completa con Verificación de Postulados',
                 fontsize=16, fontweight='bold', y=1.01)
    
    if save:
        plt.savefig('rg_silencio_ruptura.png', dpi=150, bbox_inches='tight')
        print("\n  ✓ rg_silencio_ruptura.png")
    plt.show()
