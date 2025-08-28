VegasBett — Sitio privado (GitHub Pages)

Qué incluye
- index.html (home con banner de promos, botones a WhatsApp, modal info)
- cargar.html (flujo en 2 pasos + promo del día)
- retirar.html (mensaje limpio con 4 datos)
- assets/config.js (NÚMEROS, CBU/ALIAS, promos, etc.)
- assets/app.js (lógica)
- assets/styles.css (estilos)
- assets/portada_paginaweb.png (portada de ejemplo)

Cómo activar promos
- Editá assets/config.js → SHOW_PROMO_TICKER:true
- Mín/Máx carga promo: PROMO_MIN / PROMO_MAX
- Días: PROMOS:{ lunes:20, ... }

Ocultar banner HOY
- URL con ?promos=off, o
- Desbloqueá admin (long-press en el logo ~0.7s o Shift+Alt+A) → botón ✕ Ocultar hoy (solo visible en admin), o
- Cambiá SHOW_PROMO_TICKER:false

Números de WhatsApp
- Deben estar SIN + ni espacios (ej: 5492233415879). Editá en assets/config.js.
