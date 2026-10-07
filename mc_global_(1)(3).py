
import numpy as np
import json
import sys
import os
from corpus import CORPUS, PRIMITIVAS

N_SAMPLES = 100000

def sample_primitivas(n, rng):
    samples = {}
    samples['D']      = rng.normal(1.5, 0.03, n)
    samples['pi']     = np.full(n, np.pi)
    samples['eta']    = rng.normal(np.pi/57, np.pi/570, n)
    samples['N19']    = np.full(n, 19)
    samples['N57']    = np.full(n, 57)
    samples['Phi']    = rng.normal(4, 0.2, n)
    samples['Phiexp'] = rng.normal(18/17, 18/170, n)
    samples['lambda'] = rng.normal(1/18, 0.011, n)
    samples['kappa']  = samples['D'] / samples['eta']
    samples['E19']    = np.full(n, 42)
    samples['Oc']     = np.full(n, 4*np.pi/3)
    return samples

def run_mc(n=N_SAMPLES, seed=192657):
    rng = np.random.default_rng(seed)
    primitivas = sample_primitivas(n, rng)
    resultados = {}
    for post in CORPUS:
        vals = np.zeros(n)
        for i in range(n):
            p = {k: primitivas[k][i] for k in primitivas}
            try:
                vals[i] = post.funcion(p)
            except Exception:
                vals[i] = np.nan
        resultados[post.id] = {
            'nombre': post.nombre,
            'estado': post.estado,
            'valores': vals,
            'media': np.nanmean(vals),
            'std': np.nanstd(vals),
            'objetivo': post.valor_objetivo,
            'tolerancia': post.tolerancia_rel,
            'fuente': post.fuente,
        }
    return resultados

if __name__ == '__main__':
    print(f'Corriendo Monte Carlo con {N_SAMPLES} muestras...')
    resultados = run_mc()
    os.makedirs('outputs', exist_ok=True)
    np.savez('outputs/mc_results.npz', **{k: v['valores'] for k, v in resultados.items()})
