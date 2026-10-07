
import numpy as np
import json
import os
from corpus import CORPUS
from mc_global import run_mc

def clasificar(r):
    if r['objetivo'] is None:
        return "SIN_DATO", None, None
    media = r['media']
    std = r['std']
    obj = r['objetivo']
    tol = r['tolerancia']
    if obj == 0.0:
        err_rel = abs(media - obj)
    else:
        err_rel = abs(media - obj) / abs(obj)
    std_rel = std / abs(media) if media != 0 else np.inf
    if err_rel < tol:
        if std_rel < tol / 2:
            return "ROBUSTO", err_rel, std_rel
        else:
            return "FRAGIL", err_rel, std_rel
    elif err_rel < 2 * tol:
        return "INCIERTO", err_rel, std_rel
    else:
        return "FALSADO", err_rel, std_rel

def analizar(resultados):
    clasificacion = {}
    for pid, r in resultados.items():
        clase, err, std_rel = clasificar(r)
        clasificacion[pid] = {
            'nombre': r['nombre'],
            'estado_original': r['estado'],
            'clase_mc': clase,
            'error_relativo': err,
            'std_relativa': std_rel,
            'valor_mc': r['media'],
            'valor_objetivo': r['objetivo'],
            'fuente': r['fuente'],
        }
    return clasificacion

if __name__ == '__main__':
    resultados = run_mc()
    clasif = analizar(resultados)
    os.makedirs('outputs', exist_ok=True)
    with open('outputs/classification.json', 'w') as f:
        json.dump(clasif, f, indent=2)
    print('Clasificación automatizada finalizada con éxito.')
