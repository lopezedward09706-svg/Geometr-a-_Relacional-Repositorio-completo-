
import json
import os
from datetime import datetime

def generar_reporte():
    os.makedirs('outputs', exist_ok=True)
    path_json = 'outputs/classification.json'
    if not os.path.exists(path_json):
        print('Error de reporte: falta classification.json')
        return
    with open(path_json, 'r', encoding='utf-8') as f:
        clasif = json.load(f)
    lines = [
        "# Reporte Global de Validación — Simulación Monte Carlo RG",
        f"\n**Fecha de ejecución:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "**Muestras Monte Carlo (N):** 100,000\n",
        "## 📊 Resumen Estadístico por Clase",
        "La clasificación se realiza evaluando el error relativo frente a datos experimentales y la varianza de la distribución:\n"
    ]
    conteo = {}
    for c in clasif.values():
        conteo[c['clase_mc']] = conteo.get(c['clase_mc'], 0) + 1
    lines.append("| Clase Epistémica | Cantidad de Postulados | Descripción |")
    lines.append("|---|---|---|")
    lines.append(f"| **ROBUSTO** | {conteo.get('ROBUSTO', 0)} | Consistente con datos externos y con baja dispersión (baja sensibilidad). |")
    lines.append(f"| **FRAGIL** | {conteo.get('FRAGIL', 0)} | Consistente experimentalmente pero altamente sensible a la fluctuación. |")
    lines.append(f"| **INCIERTO** | {conteo.get('INCIERTO', 0)} | Discrepancia matemática cercana al límite de tolerancia. |")
    lines.append(f"| **FALSADO** | {conteo.get('FALSADO', 0)} | Desviación crítica e incompatible con los valores experimentales. |")
    lines.append("\n## 🔍 Detalle Cuantitativo del Corpus")
    lines.append("| ID | Postulado Físico / Ecuación | Estado Original | Clase MC | Error Relativo (%) | Fuente de Referencia |")
    lines.append("|---|---|---|---|---|---|")
    for pid, c in sorted(clasif.items(), key=lambda x: x[0]):
        err = c['error_relativo']
        err_str = f"{err*100:.5g}%" if err is not None else "—"
        lines.append(f"| {pid} | {c['nombre']} | {c['estado_original']} | **{c['clase_mc']}** | {err_str} | {c['fuente'] if c['fuente'] else '—'} |")
    path_reporte = 'outputs/reporte_final.md'
    with open(path_reporte, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'✅ Reporte unificado generado exitosamente en: {path_reporte}')

if __name__ == '__main__':
    generar_reporte()
