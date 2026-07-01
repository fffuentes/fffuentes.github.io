"""
Dashboard Administration v1.1
Herramienta de consola para cambiar la contraseña del Control Tower de Repuestos.

Modifica exclusivamente SECURITY.passwordHash en config/security.js.
No realiza git commit, push, respaldos ni publica el sitio.

Trabaja exclusivamente sobre la rama main.
"""

import hashlib
import os
import re
import subprocess
import sys


# ============================================================
# RUTAS
# ============================================================

def _obtener_raiz_repo():
    """Devuelve la ruta absoluta a la raíz del repositorio."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(script_dir)


def _ruta_security_js():
    """Devuelve la ruta absoluta a config/security.js."""
    return os.path.join(_obtener_raiz_repo(), "config", "security.js")


# ============================================================
# VERIFICACIONES GIT
# ============================================================

def _verificar_rama_main():
    """
    Verifica que el repositorio esté en la rama main.
    Si no lo está, muestra un mensaje y cancela la operación.
    No realiza checkout automático.
    """
    raiz = _obtener_raiz_repo()

    try:
        resultado = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except FileNotFoundError:
        print("\n[ERROR] Git no está instalado o no se encuentra en el PATH.")
        sys.exit(1)
    except subprocess.TimeoutExpired:
        print("\n[ERROR] La verificación de Git tardó demasiado.")
        sys.exit(1)

    rama = resultado.stdout.strip()

    if rama != "main":
        print(f"\n[ERROR] Este repositorio está en la rama '{rama}', no en 'main'.")
        print("Debe cambiar manualmente a la rama main antes de ejecutar esta herramienta:")
        print("  git checkout main")
        sys.exit(1)


def _verificar_arbol_limpio():
    """
    Verifica que el árbol de Git esté limpio.
    Si existen archivos modificados distintos de config/security.js,
    muestra un aviso y solicita confirmación para continuar.
    """
    raiz = _obtener_raiz_repo()

    try:
        resultado = subprocess.run(
            ["git", "status", "--porcelain"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except FileNotFoundError:
        # Si Git no está instalado, no verificamos el árbol
        return
    except subprocess.TimeoutExpired:
        print("\n[ADVERTENCIA] La verificación del estado de Git tardó demasiado. Continuando...")
        return

    lineas = [linea.strip() for linea in resultado.stdout.strip().split("\n") if linea.strip()]

    if not lineas:
        # Árbol completamente limpio
        return

    # Extraer nombres de archivo (formato: " M archivo" o "?? archivo")
    archivos_modificados = set()
    for linea in lineas:
        # El formato de git status --porcelain es: XY ruta
        # donde X es el estado en staging, Y es el estado en working tree
        partes = linea.split(" ", 2)
        if len(partes) >= 3:
            archivos_modificados.add(partes[2].strip())
        elif len(partes) == 2:
            archivos_modificados.add(partes[1].strip())
        else:
            archivos_modificados.add(partes[0].strip())

    # Si solo está modificado config/security.js, es aceptable
    if archivos_modificados == {"config/security.js"}:
        return

    # Hay otros archivos modificados
    print("\n[ADVERTENCIA] El árbol de Git no está limpio.")
    print("Archivos modificados:")
    for archivo in sorted(archivos_modificados):
        print(f"  - {archivo}")
    print()

    respuesta = input("¿Desea continuar a pesar de los cambios pendientes? (S/N): ").strip().upper()
    if respuesta != "S":
        print("\nOperación cancelada.")
        sys.exit(0)


# ============================================================
# HASH
# ============================================================

def _sha256(texto):
    """Calcula SHA-256 y retorna string hexadecimal en minúsculas."""
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


# ============================================================
# LECTURA / ESCRITURA
# ============================================================

def _actualizar_password_hash(nuevo_hash):
    """
    Reemplaza el valor de passwordHash en config/security.js.
    Conserva EXACTAMENTE el resto del archivo.
    Retorna True si tuvo éxito, False si no encontró la propiedad.
    """
    ruta = _ruta_security_js()

    if not os.path.isfile(ruta):
        print(f"\n[ERROR] No se encontró el archivo:\n  {ruta}")
        sys.exit(1)

    with open(ruta, "r", encoding="utf-8") as f:
        contenido = f.read()

    # Patrón: passwordHash: "cualquier_hash_de_64_caracteres_hex"
    patron = r'(passwordHash:\s*)"[0-9a-fA-F]{64}"'
    nuevo = f'\\1"{nuevo_hash}"'

    nuevo_contenido, num_reemplazos = re.subn(patron, nuevo, contenido)

    if num_reemplazos == 0:
        return False

    with open(ruta, "w", encoding="utf-8") as f:
        f.write(nuevo_contenido)

    return True


# ============================================================
# CLI
# ============================================================

def main():
    print("=" * 40)
    print("Dashboard Administration v1.1")
    print("=" * 40)
    print()

    # --- Verificaciones de entorno ---
    _verificar_rama_main()
    _verificar_arbol_limpio()

    print("Esta herramienta cambia la contraseña del Dashboard.")
    print(f"Archivo: {_ruta_security_js()}")
    print()

    # --- Solicitar contraseña ---
    password = input("Ingrese la nueva contraseña: ").strip()
    if not password:
        print("\n[ERROR] La contraseña no puede estar vacía.")
        sys.exit(1)

    confirmacion = input("Confirmar contraseña      : ").strip()
    if password != confirmacion:
        print("\n[ERROR] Las contraseñas no coinciden.")
        sys.exit(1)

    # --- Confirmación ---
    print()
    respuesta = input("¿Desea actualizar la contraseña? (S/N): ").strip().upper()
    if respuesta != "S":
        print("\nOperación cancelada.")
        sys.exit(0)

    # --- Calcular hash y actualizar ---
    nuevo_hash = _sha256(password)

    if _actualizar_password_hash(nuevo_hash):
        print("\n✔ Contraseña actualizada correctamente.")
    else:
        print("\n[ERROR] No se pudo encontrar la propiedad passwordHash en el archivo.")
        print("Verifique que config/security.js tenga el formato esperado.")
        sys.exit(1)


if __name__ == "__main__":
    main()
