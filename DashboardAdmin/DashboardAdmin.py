"""
Dashboard Administration v1.0
Herramienta de consola para cambiar la contraseña del Control Tower de Repuestos.

Modifica exclusivamente SECURITY.passwordHash en config/security.js.
No realiza git commit, push, respaldos ni publica el sitio.
"""

import hashlib
import os
import re
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
    print("Dashboard Administration v1.0")
    print("=" * 40)
    print()
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
