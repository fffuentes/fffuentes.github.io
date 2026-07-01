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

    // -------------------------------------------------
    // API pública
    // -------------------------------------------------
    return {
        sha256: sha256,
        validar: validar,
        intentosRestantes: intentosRestantes,
        reiniciarIntentos: reiniciarIntentos
    };

})();
