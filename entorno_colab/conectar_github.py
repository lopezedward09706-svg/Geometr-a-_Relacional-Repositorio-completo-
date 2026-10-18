# SCRIPT DE RECONEXIÓN AUTOMÁTICA CON GITHUB (SEGURO)
# Geometría Relacional (RG) - Edward P. López

import os
import getpass
from github import Github

USER = "lopezedward09706-svg"
REPO = "Geometr-a-_Relacional-Repositorio-completo-"

def conectar():
    try:
        # Intenta leer desde el entorno del sistema, de lo contrario solicita interactivamente
        token = os.environ.get("GITHUB_PAT")
        if not token:
            print("🔑 Introduce tu Personal Access Token (PAT) de GitHub para autenticar:")
            token = getpass.getpass("Token: ").strip()

        print("📡 Conectando de forma automatizada al repositorio de GitHub...")
        g = Github(token)
        repo = g.get_user().get_repo(REPO)
        print(f"✅ Conexión establecida con éxito. URL: https://github.com/{USER}/{REPO}")
        return repo
    except Exception as e:
        print(f"❌ Error al conectar: {e}")
        return None

if __name__ == '__main__':
    conectar()
