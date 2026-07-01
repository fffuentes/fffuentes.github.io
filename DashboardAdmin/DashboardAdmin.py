"""
Dashboard Administration v2.0
Herramienta de consola para cambiar la contraseña del Control Tower de Repuestos.

Flujo completo: verificar rama → ingresar contraseña → backup →
actualizar security.js → git add → git commit → git push (opcional).

Trabaja exclusivamente sobre la rama main.
"""

import hashlib
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime


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


def _ruta_backup_dir():
    """Devuelve la ruta absoluta a DashboardAdmin/backup/."""
    return os.path.join(_obtener_raiz_repo(), "DashboardAdmin", "backup")


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


# ============================================================
# HASH
# ============================================================

def _sha256(texto):
    """Calcula SHA-256 y retorna string hexadecimal en minúsculas."""
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


# ============================================================
# BACKUP
# ============================================================

def _crear_backup():
    """
    Crea una copia de seguridad de config/security.js en
    DashboardAdmin/backup/security-YYYYMMDD-HHMMSS.js.
    Retorna la ruta del backup creado.
    """
    ruta_origen = _ruta_security_js()
    ruta_backup_dir = _ruta_backup_dir()

    os.makedirs(ruta_backup_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    nombre = f"security-{timestamp}.js"
    ruta_destino = os.path.join(ruta_backup_dir, nombre)

    try:
        shutil.copy2(ruta_origen, ruta_destino)
    except OSError as e:
        print(f"\n[ERROR] No se pudo crear el backup:\n  {e}")
        sys.exit(1)

    return ruta_destino


def _limpiar_backups(mantener=10):
    """
    Elimina los backups más antiguos si hay más de 'mantener'.
    Solo elimina archivos con el formato security-YYYYMMDD-HHMMSS.js.
    """
    ruta_backup_dir = _ruta_backup_dir()

    if not os.path.isdir(ruta_backup_dir):
        return

    patron = re.compile(r"^security-\d{8}-\d{6}\.js$")
    archivos = [f for f in os.listdir(ruta_backup_dir) if patron.match(f)]

    if len(archivos) <= mantener:
        return

    archivos.sort()  # Orden alfabético = orden cronológico
    for archivo in archivos[:-mantener]:
        try:
            os.remove(os.path.join(ruta_backup_dir, archivo))
        except OSError:
            pass  # Si no se puede eliminar, continuar


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
# OPERACIONES GIT
# ============================================================

def _verificar_diff():
    """
    Ejecuta git diff --name-only.
    Si hay archivos modificados distintos de config/security.js,
    pregunta si continuar. Cancela si responde N.
    """
    raiz = _obtener_raiz_repo()

    try:
        resultado = subprocess.run(
            ["git", "diff", "--name-only"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=10,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Fallo al verificar cambios (git diff):\n  {e.stderr.strip() if e.stderr else e}")
        sys.exit(1)
    except FileNotFoundError:
        print("\n[ERROR] Git no está instalado.")
        sys.exit(1)

    archivos = [a.strip() for a in resultado.stdout.strip().split("\n") if a.strip()]

    if not archivos:
        return  # Sin cambios

    # Filtrar: solo config/security.js es aceptable
    otros = [a for a in archivos if a != "config/security.js"]

    if not otros:
        return  # Solo security.js modificado

    print("\n[ADVERTENCIA] Se detectaron archivos adicionales modificados:")
    for a in sorted(otros):
        print(f"  - {a}")
    print()

    respuesta = input("¿Desea continuar? (S/N): ").strip().upper()
    if respuesta != "S":
        print("\nOperación cancelada.")
        sys.exit(0)


def _git_add():
    """Ejecuta git add config/security.js exclusivamente."""
    raiz = _obtener_raiz_repo()

    try:
        subprocess.run(
            ["git", "add", "config/security.js"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=10,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Fallo al preparar el archivo (git add):\n  {e.stderr.strip() if e.stderr else e}")
        sys.exit(1)


def _git_commit():
    """
    Ejecuta git commit con mensaje fijo.
    No solicita el mensaje al usuario.
    """
    raiz = _obtener_raiz_repo()

    try:
        subprocess.run(
            ["git", "commit", "-m", "chore(security): actualizar contraseña del dashboard"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=10,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Fallo al crear el commit:\n  {e.stderr.strip() if e.stderr else e}")
        sys.exit(1)


def _git_push():
    """Ejecuta git push origin main."""
    raiz = _obtener_raiz_repo()

    try:
        subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=raiz,
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Fallo al publicar los cambios (git push):\n  {e.stderr.strip() if e.stderr else e}")
        sys.exit(1)


# ============================================================
# CLI
# ============================================================

def main():
    print("=" * 50)
    print("Dashboard Administration v2.0")
    print("=" * 50)
    print()

    # --------------------------------------------------------
    # Paso 1: Verificar rama main
    # --------------------------------------------------------
    _verificar_rama_main()

    # --------------------------------------------------------
    # Paso 2: Solicitar contraseña
    # --------------------------------------------------------
    password = input("Ingrese la nueva contraseña: ").strip()
    if not password:
        print("\n[ERROR] La contraseña no puede estar vacía.")
        sys.exit(1)

    confirmacion = input("Confirmar contraseña      : ").strip()
    if password != confirmacion:
        print("\n[ERROR] Las contraseñas no coinciden.")
        sys.exit(1)

    # --------------------------------------------------------
    # Paso 3: Resumen y confirmación final
    # --------------------------------------------------------
    print()
    print("=" * 50)
    print("Resumen")
    print("=" * 50)
    print()
    print("Nueva contraseña:")
    print("*" * len(password))
    print()

    respuesta = input("¿Desea continuar? (S/N): ").strip().upper()
    if respuesta != "S":
        print("\nOperación cancelada.")
        sys.exit(0)

    # --------------------------------------------------------
    # Paso 4: Backup
    # --------------------------------------------------------
    print("\nCreando backup...")
    ruta_backup = _crear_backup()
    _limpiar_backups(mantener=10)
    print(f"✔ Backup creado: {ruta_backup}")

    # --------------------------------------------------------
    # Paso 5: Actualizar security.js
    # --------------------------------------------------------
    print("\nActualizando security.js...")
    nuevo_hash = _sha256(password)

    if not _actualizar_password_hash(nuevo_hash):
        print("\n[ERROR] No se pudo encontrar la propiedad passwordHash en el archivo.")
        print("Verifique que config/security.js tenga el formato esperado.")
        sys.exit(1)

    fecha_actualizacion = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print("✔ security.js actualizado")

    # --------------------------------------------------------
    # Paso 6: Verificar cambios con git diff
    # --------------------------------------------------------
    print("\nVerificando cambios...")
    _verificar_diff()

    # --------------------------------------------------------
    # Paso 7: git add
    # --------------------------------------------------------
    print("\nPreparando archivo para commit...")
    _git_add()
    print("✔ git add realizado")

    # --------------------------------------------------------
    # Paso 8: git commit
    # --------------------------------------------------------
    print("\nCreando commit...")
    _git_commit()
    print("✔ Commit realizado")

    # --------------------------------------------------------
    # Paso 9: Resumen y decisión de push
    # --------------------------------------------------------
    print()
    print("=" * 50)
    print("Dashboard Administration v2.0")
    print("=" * 50)
    print()
    print("✔ Contraseña actualizada")
    print(f"✔ Backup creado: {os.path.basename(ruta_backup)}")
    print("✔ security.js actualizado")
    print(f"SHA-256: {nuevo_hash}")
    print(f"Fecha:   {fecha_actualizacion}")
    print("✔ Git Commit realizado")
    print()

    respuesta_push = input("¿Desea publicar los cambios en GitHub? (S/N): ").strip().upper()

    if respuesta_push != "S":
        print()
        print("=" * 50)
        print("Dashboard Administration v2.0")
        print("=" * 50)
        print()
        print("✔ Contraseña actualizada")
        print("✔ Backup creado")
        print("✔ security.js actualizado")
        print("✔ Git Commit realizado")
        print()
        print("Git Push omitido por el usuario.")
        print()
        print("Los cambios están en local. Para publicarlos manualmente:")
        print("  git push origin main")
        print("=" * 50)
        sys.exit(0)

    # --------------------------------------------------------
    # Paso 10: git push
    # --------------------------------------------------------
    print("\nPublicando cambios en GitHub...")
    _git_push()
    print("✔ Push realizado")

    print()
    print("=" * 50)
    print("Dashboard Administration v2.0")
    print("=" * 50)
    print()
    print("✔ Contraseña actualizada")
    print("✔ Backup creado")
    print("✔ security.js actualizado")
    print("✔ Git Commit realizado")
    print("✔ Git Push realizado")
    print()
    print("Dashboard disponible en:")
    print("https://fffuentes.github.io")
    print("=" * 50)


if __name__ == "__main__":
    main()
