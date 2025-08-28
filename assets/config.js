// Configuración central — VegasBett (privado)
window.VEGASBETT_CONFIG = {
  // Gate 18+
  AGE_GATE_ENABLED: true,
  EDAD_MINIMA: 18,

  // Marca
  MARCA: "VegasBett",

  // Números (sin + ni espacios)
  NUMERO_PRINCIPAL: "5492233415879",
  NUMERO_RESPALDO:  "5492233458173", // reclamos

  // Datos bancarios
  CBU: "0000003100056935839518",
  ALIAS: "Vegass.bet",
  TITULAR: "Priscila Correa",

  // Vista previa al compartir
  SHARE_PREVIEW: true,
  OG_IMAGE: "assets/portada_paginaweb.png",

  // Privacidad (no indexar por buscadores)
  NO_INDEX: true,

  // Pixel (apagado por defecto)
  TRACKING_ENABLED: false,
  PIXEL_ID: "24100361799629508",

  // Admin
  EMERGENCY_PIN: "4321",

  // ===== Promos =====
  SHOW_PROMO_TICKER: true,   // mostrarlas por defecto
  PROMO_MIN: 2000,
  PROMO_MAX: 20000,
  PROMOS: {
    lunes:    20,
    martes:   15,
    miercoles:10,
    jueves:   10,
    viernes:  20,
    sabado:   20,
    domingo:  25
  }
};
