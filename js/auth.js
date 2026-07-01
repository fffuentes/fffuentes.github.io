// =====================================================
// CONTROL TOWER DE REPUESTOS
// js/auth.js
// Módulo de autenticación — validación por hash SHA-256.
// =====================================================

var Auth = (function () {
    "use strict";

    // -------------------------------------------------
    // Estado interno (no accesible desde fuera)
    // -------------------------------------------------
    var _intentos = 0;

    // -------------------------------------------------
    // sha256(texto)
    // Calcula SHA-256 usando Web Crypto API nativa.
    // Retorna: Promise<string> — hash en hexadecimal.
    // -------------------------------------------------
    function sha256(texto) {
        var encoder = new TextEncoder();
        var data = encoder.encode(texto);

        return crypto.subtle.digest("SHA-256", data).then(function (hashBuffer) {
            var hashArray = Array.from(new Uint8Array(hashBuffer));
            var hashHex = hashArray.map(function (b) {
                return b.toString(16).padStart(2, "0");
            }).join("");
            return hashHex;
        });
    }

    // -------------------------------------------------
    // validar(password)
    // Compara SHA-256(password) contra SECURITY.passwordHash.
    // Retorna: Promise<boolean> — true si coincide.
    // Incrementa el contador de intentos en caso de fallo.
    // -------------------------------------------------
    function validar(password) {
        if (!password || typeof password !== "string" || password.length === 0) {
            _intentos++;
            return Promise.resolve(false);
        }

        return sha256(password).then(function (hash) {
            if (hash === SECURITY.passwordHash) {
                _intentos = 0;
                return true;
            }
            _intentos++;
            return false;
        });
    }

    // -------------------------------------------------
    // intentosRestantes()
    // Retorna cuántos intentos quedan antes del bloqueo.
    // Si SECURITY._lockoutDuration es null, siempre
    // retorna Infinity (sin límite de bloqueo).
    // -------------------------------------------------
    function intentosRestantes() {
        if (SECURITY._lockoutDuration === null) {
            return Infinity;
        }
        var restantes = SECURITY.maxAttempts - _intentos;
        return restantes < 0 ? 0 : restantes;
    }

    // -------------------------------------------------
    // reiniciarIntentos()
    // Reinicia el contador de intentos fallidos a 0.
    // -------------------------------------------------
    function reiniciarIntentos() {
        _intentos = 0;
    }

    // =====================================================
    // MODAL — Componente visual (sin lógica de autenticación)
    // =====================================================

    var _modalVisible = false;

    function mostrarModal() {
        var overlay = document.getElementById("modalAuth");
        var input = document.getElementById("modalPassword");
        var error = document.getElementById("modalError");
        var toggleBtn = document.getElementById("modalToggle");
        var toggleIcon = toggleBtn ? toggleBtn.querySelector("i") : null;

        if (!overlay || !input) return;

        overlay.classList.add("activo");
        _modalVisible = true;

        // Limpiar estado previo
        input.value = "";
        input.type = "password";
        if (error) error.textContent = "";
        if (toggleIcon) {
            toggleIcon.className = "fa-regular fa-eye";
        }

        // Foco automático
        setTimeout(function () {
            input.focus();
        }, 100);
    }

    function cerrarModal() {
        var overlay = document.getElementById("modalAuth");
        if (!overlay) return;

        overlay.classList.remove("activo");
        _modalVisible = false;
    }

    // --- Event listeners del modal (se registran una sola vez al cargar el DOM) ---
    function _inicializarModal() {
        var overlay = document.getElementById("modalAuth");
        var input = document.getElementById("modalPassword");
        var toggleBtn = document.getElementById("modalToggle");
        var btnCancelar = document.getElementById("modalCancelar");
        var btnActualizar = document.getElementById("modalActualizar");

        if (!overlay) return;

        // Cerrar con clic fuera del modal
        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) {
                cerrarModal();
            }
        });

        // Cerrar con ESC
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && _modalVisible) {
                cerrarModal();
            }
        });

        // Botón Cancelar
        if (btnCancelar) {
            btnCancelar.addEventListener("click", function () {
                cerrarModal();
            });
        }

        // Mostrar/Ocultar contraseña
        if (toggleBtn) {
            toggleBtn.addEventListener("click", function () {
                var icon = toggleBtn.querySelector("i");
                if (!input || !icon) return;

                if (input.type === "password") {
                    input.type = "text";
                    icon.className = "fa-regular fa-eye-slash";
                    toggleBtn.setAttribute("aria-label", "Ocultar contraseña");
                } else {
                    input.type = "password";
                    icon.className = "fa-regular fa-eye";
                    toggleBtn.setAttribute("aria-label", "Mostrar contraseña");
                }
            });
        }

        // Enviar con ENTER — placeholder: aquí se conectará la autenticación
        if (input && btnActualizar) {
            input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    btnActualizar.click();
                }
            });
        }

        // Botón Actualizar — placeholder: aquí se conectará la autenticación
        if (btnActualizar) {
            btnActualizar.addEventListener("click", function () {
                // TODO: conectar Auth.validar() en fase posterior
                console.log("Modal: botón Actualizar presionado (autenticación no conectada aún)");
            });
        }
    }

    // Registrar listeners cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", _inicializarModal);
    } else {
        _inicializarModal();
    }

    // -------------------------------------------------
    // API pública
    // -------------------------------------------------
    return {
        sha256: sha256,
        validar: validar,
        intentosRestantes: intentosRestantes,
        reiniciarIntentos: reiniciarIntentos,
        mostrarModal: mostrarModal,
        cerrarModal: cerrarModal
    };

})();
