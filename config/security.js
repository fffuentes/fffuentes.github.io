// =====================================================
// CONTROL TOWER DE REPUESTOS
// config/security.js
// Infraestructura de seguridad del Dashboard.
// =====================================================

var SECURITY = {

    // -------------------------------------------------
    // Hash SHA-256 de la contraseña inicial.
    // NUNCA almacenar la contraseña en texto plano.
    // -------------------------------------------------
    passwordHash: "830c10cd10cd9517ae3413ae22d9b4662e7fb2c355d8e435d44685db822096ae",

    // -------------------------------------------------
    // Número máximo de intentos fallidos antes de bloqueo.
    // -------------------------------------------------
    maxAttempts: 5,

    // -------------------------------------------------
    // Tiempo de inactividad (en minutos) antes de que
    // la sesión expire automáticamente.
    // -------------------------------------------------
    sessionTimeout: 30,

    // -------------------------------------------------
    // Versión del módulo de seguridad.
    // Incrementar al añadir nuevas funcionalidades.
    // -------------------------------------------------
    version: "1.0.0",

    // -------------------------------------------------
    // === SLOTS DE EXTENSIÓN FUTURA ===
    // Reservados para ampliaciones. No modificar su
    // posición ni nombre. Inicializados en null.
    // -------------------------------------------------

    // Duración del bloqueo temporal (en minutos) tras
    // exceder maxAttempts. null = sin bloqueo temporal.
    _lockoutDuration: null,

    // Lista de roles permitidos (ej. ["admin", "viewer"]).
    // null = sin control de roles.
    _roles: null,

    // Mapa de usuarios adicionales { usuario: hash }.
    // null = solo contraseña global.
    _users: null

};
