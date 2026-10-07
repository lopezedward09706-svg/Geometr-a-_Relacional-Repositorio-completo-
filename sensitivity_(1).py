
import numpy as np
import matplotlib.pyplot as plt
import os
from corpus import CORPUS, PRIMITIVAS

N_SAMPLES_SENSITIVITY = 10000

def sample_primitivas_local(n, rng):
    import corpus
    samples = {}
    d_base = corpus.PRIMITIVAS.get('D', 1.5)
    eta_base = corpus.PRIMITIVAS.get('eta', np.pi/57)
    phi_base = corpus.PRIMITIVAS.get('Phi', 4)
    phiexp_base = corpus.PRIMITIVAS.get('Phiexp', 18/17)
    lambda_base = corpus.PRIMITIVAS.get('lambda', 1/18)
    samples['D']      = rng.normal(d_base, 0.03, n)
    samples['pi']     = np.full(n, np.pi)
    samples['eta']    = rng.normal(eta_base, eta_base/10, n)
    samples['N19']    = np.full(n, 19)
    samples['N57']    = np.full(n, 57)
    samples['Phi']    = rng.normal(phi_base, phi_base/20, n)
    samples['Phiexp'] = rng.normal(phiexp_base, phiexp_base/10, n)
    samples['lambda'] = rng.normal(lambda_base, lambda_base/5, n)
    samples['kappa']  = samples['D'] / samples['eta']
    samples['E19']    = np.full(n, 42)
    samples['Oc']     = np.full(n, 4*np.pi/3)
    return samples

def run_mc_local(n=N_SAMPLES_SENSITIVITY, seed=192657):
    rng = np.random.default_rng(seed)
    primitivas = sample_primitivas_local(n, rng)
    resultados = {}
    for post in CORPUS:
        vals = np.zeros(n)
        for i in range(n):
            p = {k: float(primitivas[k][i]) for k in primitivas}
            try:
                vals[i] = post.funcion(p)
            except Exception:
                vals[i] = np.nan
        resultados[post.id] = {
            'nombre': post.nombre,
            'estado': post.estado,
            'valores': vals,
            'media': float(np.nanmean(vals)),
            'std': float(np.nanstd(vals)),
            'objetivo': post.valor_objetivo,
            'tolerancia': post.tolerancia_rel,
            'fuente': post.fuente,
        }
    return resultados

def perturbar_primitiva(primitiva, factor):
    import corpus
    original = corpus.PRIMITIVAS[primitiva]
    corpus.PRIMITIVAS[primitiva] = original * factor
    resultados = run_mc_local(n=N_SAMPLES_SENSITIVITY)
    corpus.PRIMITIVAS[primitiva] = original
    return resultados

def matriz_sensibilidad(primitivas_a_testear, factores=[0.9, 1.1]):
    sensibilidad = {post.id: {} for post in CORPUS}
    for prim in primitivas_a_testear:
        for factor in factores:
            res = perturbar_primitiva(prim, factor)
            for pid, r in res.items():
                sensibilidad.setdefault(pid, {}).setdefault(prim, []).append(r['media'])
    return sensibilidad

if __name__ == '__main__':
    print('Analizando sensibilidad...')
    prims_a_testear = ['D', 'eta', 'Phi', 'Phiexp', 'lambda']
    sens = matriz_sensibilidad(prims_a_testear)
    ids = list(sens.keys())
    prims = list(prims_a_testear)
    M = np.zeros((len(ids), len(prims)))
    for i, pid in enumerate(ids):
        for j, prim in enumerate(prims):
            vals = sens[pid].get(prim, [])
            if len(vals) == 2:
                denominador = abs(np.mean(vals))
                M[i, j] = abs(vals[1] - vals[0]) / denominador if denominador > 0 else abs(vals[1] - vals[0])
    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(M, cmap='hot', aspect='auto')
    ax.set_xticks(range(len(prims)))
    ax.set_xticklabels(prims)
    ax.set_yticks(range(len(ids)))
    ax.set_yticklabels(ids)
    ax.set_title('Sensibilidad: cambio relativo por perturbación de primitiva')
    plt.colorbar(im, ax=ax, label='cambio relativo')
    plt.tight_layout()
    os.makedirs('outputs', exist_ok=True)
    plt.savefig('outputs/sensitivity_heatmap.png', dpi=150)
    plt.close()
    print('Sensibilidad guardada en outputs/sensitivity_heatmap.png')
