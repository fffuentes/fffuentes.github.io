# Dashboard Administration

Herramienta de consola para cambiar la contraseña del **Control Tower de Repuestos**.

## Requisitos

- Python 3.6 o superior.
- Sin dependencias externas (solo librería estándar).

## Uso

Desde la carpeta `DashboardAdmin/`:

```bash
python DashboardAdmin.py
```

O desde cualquier ubicación:

```bash
python DashboardAdmin/DashboardAdmin.py
```

## Flujo

1. Solicita la nueva contraseña.
2. Solicita confirmación.
3. Pide confirmación explícita (`S/N`).
4. Calcula SHA-256.
5. Reemplaza únicamente `SECURITY.passwordHash` en `config/security.js`.
6. Conserva intacto el resto del archivo.

## Qué modifica

| Archivo | Propiedad | 
|---|---|
| `config/security.js` | `SECURITY.passwordHash` |

Ningún otro archivo es modificado.

## Limitaciones actuales

- No realiza `git commit` ni `git push`.
- No crea respaldos del archivo anterior.
- No publica el sitio en GitHub Pages.
- Solo modifica el hash, no otras propiedades de seguridad.

## Estructura

```
fffuentes.github.io/
├── config/
│   └── security.js          ← archivo modificado
├── DashboardAdmin/
│   ├── DashboardAdmin.py    ← herramienta
│   ├── requirements.txt
│   └── README.md
├── js/  css/  charts/  data/
└── index.html
```
