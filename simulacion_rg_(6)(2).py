
# =====================================================================
# SIMULACIÓN MONTE CARLO DEL SILENCIO ARMÓNICO - GEOMETRÍA RELACIONAL (RG)
# =====================================================================
import numpy as np
import matplotlib.pyplot as plt

def red_hexagonal():
    return np.zeros(19)

def matriz_adyacencia():
    adj = np.zeros((19, 19))
    for i in range(1, 7):
        adj[0, i] = adj[i, 0] = 1.0
    for i in range(1, 7):
        sig = i + 1 if i < 6 else 1
        adj[i, sig] = adj[sig, i] = 1.0
        ext_1 = 2 * i + 5
        ext_2 = 2 * i + 6 if i < 6 else 7
        adj[i, ext_1] = adj[ext_1, i] = 1.0
        adj[i, ext_2] = adj[ext_2, i] = 1.0
    for i in range(7, 19):
        sig = i + 1 if i < 18 else 7
        adj[i, sig] = adj[sig, i] = 1.0
    return adj

def hamiltoniano(fases, adj):
    J = 3.116242
    H = 0.0
    for i in range(len(fases)):
        for j in range(i + 1, len(fases)):
            if adj[i, j] > 0:
                H += J * (1.0 - np.cos(fases[i] - fases[j]))
    return H

np.random.seed(192657)
fases = red_hexagonal()
adj = matriz_adyacencia()
H = hamiltoniano(fases, adj)
print(f"H|0⟩ = {H:.15f}")

N = 150000
ruido = np.random.normal(0, 0.05, (N, 19))
tensiones = []
for i in range(N):
    tensiones.append(hamiltoniano(fases + ruido[i], adj))

media = np.mean(tensiones)
std = np.std(tensiones)
print(f"Energía media = {media:.6f} eV")
print(f"Desviación = {std:.6f} eV")

plt.hist(tensiones, bins=100, color='#00FFCC', alpha=0.7, edgecolor='black')
plt.axvline(H, color='red', linestyle='--', label='H|0⟩ = 0')
plt.xlabel('Energía')
plt.ylabel('Frecuencia')
plt.legend()
plt.show()
