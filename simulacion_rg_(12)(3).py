import numpy as np
import matplotlib.pyplot as plt
import os

# Set matplotlib to non-interactive mode
import matplotlib
matplotlib.use('Agg')

def run_simulation():
    # 1. Metastable Potential V(theta)
    D = 1.5
    N = 19
    theta = np.linspace(-2 * np.pi, 2 * np.pi, 500)
    V = (D / N) * ((theta / np.pi)**4 - 2 * (theta / np.pi)**2 + 1)

    # 2. Faraday Metric
    def faraday_metric(x, y):
        # Prevent division by zero and large values
        x = np.clip(x, 0.01, 10.0)
        y = np.clip(y, 0.01, 10.0)
        return np.sqrt((x**x * y**y) / (x**y * y**x))

    x_vals = np.linspace(0.1, 2.0, 100)
    y_vals = np.linspace(0.1, 2.0, 100)
    X, Y = np.meshgrid(x_vals, y_vals)
    Z_faraday = faraday_metric(X, Y)

    # 3. Cosmology RG: w(rho)
    eta = np.pi / 57
    rho_ratio = np.logspace(-2, 2, 200) # representing rho / rho_P
    w = -1 + 1.0 / (3.0 * (1.0 + rho_ratio)) - (eta / 3.0) / rho_ratio

    # Plotting everything in a consolidated figure
    fig, axs = plt.subplots(2, 2, figsize=(12, 10))

    # Plot 1: Metastable Potential
    axs[0, 0].plot(theta / np.pi, V, color='#cc5500', linewidth=2)
    axs[0, 0].axhline(0, color='gray', linestyle='--', linewidth=0.5)
    axs[0, 0].axvline(0, color='gray', linestyle='--', linewidth=0.5)
    axs[0, 0].set_title("Potencial Metaestable V(theta) (Silencio)", fontsize=12, fontweight='bold', pad=10)
    axs[0, 0].set_xlabel("theta / pi", fontsize=10)
    axs[0, 0].set_ylabel("V(theta)", fontsize=10)
    axs[0, 0].grid(True, linestyle=':', alpha=0.6)

    # Plot 2: Faraday Metric Heatmap
    im = axs[0, 1].contourf(X, Y, Z_faraday, levels=20, cmap='inferno')
    fig.colorbar(im, ax=axs[0, 1], label="D(x, y)")
    axs[0, 1].set_title("Metrica de Faraday", fontsize=12, fontweight='bold', pad=10)
    axs[0, 1].set_xlabel("x", fontsize=10)
    axs[0, 1].set_ylabel("y", fontsize=10)

    # Plot 3: Ecuación de Estado w(rho/rho_P)
    axs[1, 0].semilogx(rho_ratio, w, color='#0055ff', linewidth=2)
    axs[1, 0].axhline(-1, color='red', linestyle='--', label="Limite de Energia Oscura")
    axs[1, 0].set_title("Ecuacion de Estado Cosmografica w(rho)", fontsize=12, fontweight='bold', pad=10)
    axs[1, 0].set_xlabel("rho / rho_P", fontsize=10)
    axs[1, 0].set_ylabel("w(rho)", fontsize=10)
    axs[1, 0].legend(loc="lower right")
    axs[1, 0].grid(True, which="both", linestyle=':', alpha=0.6)

    # Plot 4: Relational Structure (Conceptual Triad)
    axs[1, 1].axis('off')
    axs[1, 1].text(0.5, 0.8, "Triada Fundamental A-B-C", fontsize=14, fontweight='bold', ha='center', color='#403228')
    axs[1, 1].text(0.5, 0.6, "A (Accion) = 1.0   B (Resistencia) = 1.0   C (Cierre) = 2.0", fontsize=11, ha='center')
    axs[1, 1].text(0.5, 0.4, "Deuda de Informacion: D = ABC - 2abc = 1.5", fontsize=12, fontweight='bold', ha='center', color='#cc5500')
    axs[1, 1].text(0.5, 0.2, "Hard-Lock N57 (Proton)   Cluster N19 (Electron)", fontsize=11, ha='center')

    plt.tight_layout()
    os.makedirs('/workspace/scratch', exist_ok=True)
    plt.savefig('/workspace/scratch/graficos_rg.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Simulación ejecutada y gráficos generados exitosamente sin fallos de parseo.")

if __name__ == '__main__':
    run_simulation()