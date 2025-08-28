// Lógica principal VegasBett
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.VEGASBETT_CONFIG || {};

  // Utilidades
  function waUrl(number, text) {
    const msg = encodeURIComponent(text || "");
    return number ? `https://wa.me/${number}?text=${msg}` : `https://wa.me/?text=${msg}`;
  }
  function moneyFormat(n) {
    try {
      const v = Number(n);
      if (isNaN(v)) return n;
      return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
    } catch (e) { return n; }
  }
  function copyFromSelector(sel) {
    const el = document.querySelector(sel);
    if (!el) return false;
    el.select();
    document.execCommand("copy");
    toast("Copiado ✅");
    return true;
  }
  function toast(text) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = text;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1600);
  }

  // Año footer
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Overrides por URL
  try {
    const url = new URL(location.href);
    const p = url.searchParams.get("principal");
    const r = url.searchParams.get("respaldo");
    if (p) CFG.NUMERO_PRINCIPAL = p;
    if (r) CFG.NUMERO_RESPALDO  = r;
  } catch (e) {}

  // ===== PROMO DEL DÍA (Index) =====
  (function promoTicker(){
    const a = $("#promoTicker"); if (!a) return;
    const qp = new URLSearchParams(location.search);
    const forceOff = qp.get("promos")==="off";
    const forceOn  = qp.get("promos")==="on";
    if ((!CFG.SHOW_PROMO_TICKER && !forceOn) || forceOff) { a.classList.add("hidden"); return; }

    const day = new Date().getDay(); // 0=Dom..6=Sáb
    const pct = (CFG.PROMO_BONUS_BY_DAY||{})[day];
    if (!pct) { a.classList.add("hidden"); return; }

    const txt = `Hoy: bono +${pct}% en cargas de ${moneyFormat(CFG.PROMO_MIN)} a ${moneyFormat(CFG.PROMO_MAX)}.`;
    $("#promoText").textContent = txt;
    a.classList.remove("hidden");
    a.addEventListener("click", (e)=>{
      e.preventDefault();
      const url = new URL(location.origin + location.pathname.replace(/index\.html?$/i,'') + "cargar.html");
      url.searchParams.set("promo","1");
      url.searchParams.set("pct", String(pct));
      url.searchParams.set("min", String(CFG.PROMO_MIN||2000));
      url.searchParams.set("max", String(CFG.PROMO_MAX||20000));
      location.href = url.toString();
    });
  })();

  // ===== Botones Home =====
  if ($("#btnPrincipal")) {
    $("#btnPrincipal").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número principal*.
Gracias.`;
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "direct", target: "principal" }); }
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }
  if ($("#btnRespaldo")) {
    $("#btnRespaldo").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número de reclamos*.
Gracias.`;
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "direct", target: "respaldo" }); }
      location.href = waUrl(CFG.NUMERO_RESPALDO, text);
    });
  }
  // Soy nuevo
  if ($("#btnSoyNuevo")) {
    $("#btnSoyNuevo").addEventListener("click", () => {
      const texto = "Soy nuevo, quiero mi bono del 35%";
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "bono_nuevo" }); }
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, texto);
    });
  }

  // ===== CARGAR =====
  if ($("#formCargar")) {
    const form  = $("#formCargar");
    const paso2 = $("#paso2");
    const cbu   = $("#cbu");
    const alias = $("#alias");

    if (cbu)   cbu.value   = CFG.CBU   || "";
    if (alias) alias.value = CFG.ALIAS || "";

    // Promo enforcement si viene ?promo=1
    (function promoNotice(){
      const url = new URL(location.href);
      const isPromo = url.searchParams.get("promo")==="1";
      const pct = Number(url.searchParams.get("pct")||0);
      const min = Number(url.searchParams.get("min")||CFG.PROMO_MIN||2000);
      const max = Number(url.searchParams.get("max")||CFG.PROMO_MAX||20000);
      const box = $("#promoNotice");
      if (isPromo && box) {
        box.textContent = `Promo activa: +${pct}% en cargas desde ${moneyFormat(min)} hasta ${moneyFormat(max)}.`;
        box.classList.remove("hidden");
        // Guardamos para validar al enviar
        box.dataset.promo = "1";
        box.dataset.pct = String(pct);
        box.dataset.min = String(min);
        box.dataset.max = String(max);
      }
    })();

    $$(".copybtn").forEach(btn => btn.addEventListener("click", (e) => {
      e.preventDefault();
      copyFromSelector(btn.getAttribute("data-copy"));
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#nombre").value.trim();
      const monto  = $("#monto").value.trim();
      if (!nombre || !monto) { alert("Completá nombre y monto."); return; }
      paso2.classList.remove("hidden");
      paso2.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const enviar = $("#enviarWhatsCargar");
    if (enviar) {
      enviar.addEventListener("click", () => {
        const nombre = $("#nombre").value.trim();
        const monto  = $("#monto").value.trim();
        if (!nombre || !monto) { alert("Completá nombre y monto."); return; }

        // Validación promo si corresponde
        const promoBox = $("#promoNotice");
        if (promoBox && promoBox.dataset.promo==="1") {
          const min = Number(promoBox.dataset.min||2000);
          const max = Number(promoBox.dataset.max||20000);
          const v = Number(monto||0);
          if (v < min || v > max) {
            alert(`Esta promo aplica entre ${moneyFormat(min)} y ${moneyFormat(max)}.\nCargaste: ${moneyFormat(monto)}.`);
            return;
          }
        }

        const text = `Hola, soy *${nombre}*.
Quiero *CARGAR* ${moneyFormat(monto)}.
CBU/ALIAS copiado. Envío el comprobante aquí.`;        
        if (typeof fbq === "function") { fbq("track", "Contact", { flow: "cargar" }); }
        location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
      });
    }
  }

  // ===== RETIRAR =====
  if ($("#formRetirar")) {
    const titularInput = $("#titularR");
    const cbuAliasInput = $("#cbuAliasR");
    if (titularInput && CFG.TITULAR) titularInput.value = CFG.TITULAR;
    if (cbuAliasInput) cbuAliasInput.value = (CFG.ALIAS || CFG.CBU || "");

    $("#formRetirar").addEventListener("submit", (e) => {
      e.preventDefault();

      const usuario  = $("#usuarioR").value.trim();
      const titular  = $("#titularR").value.trim();
      const cbuAlias = $("#cbuAliasR").value.trim();
      const monto    = $("#montoR").value.trim();

      if (!usuario || !titular || !cbuAlias || !monto) {
        alert("Completá todos los campos.");
        return;
      }
      if (Number(monto) > 250000) {
        alert("El monto máximo por retiro es $250.000");
        return;
      }

      const text = `Usuario: ${usuario}
Titular: ${titular}
CBU o Alias: ${cbuAlias}
Monto a retirar: ${moneyFormat(monto)}`;

      const url = waUrl(CFG.NUMERO_PRINCIPAL, text);
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "retirar" }); }
      window.location.href = url;
    });
  }

  // ===== Panel Admin =====
  const adminToggle = $("#adminToggle");
  const panel = $("#adminPanel");
  const pin   = $("#pin");
  const nP    = $("#nPrincipal");
  const nR    = $("#nRespaldo");

  if (adminToggle && panel) adminToggle.addEventListener("click", () => panel.classList.toggle("hidden"));
  if ($("#aplicarAdmin")) {
    $("#aplicarAdmin").addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      if (nP && nP.value) CFG.NUMERO_PRINCIPAL = nP.value.trim();
      if (nR && nR.value) CFG.NUMERO_RESPALDO  = nR.value.trim();
      toast("Números aplicados (solo en esta sesión)");
    });
  }
  if ($("#genLink")) {
    $("#genLink").addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      const base = location.origin + location.pathname.replace(/index\.html?$/i, "");
      const qp = new URLSearchParams();
      if (nP && nP.value) qp.set("principal", nP.value.trim());
      if (nR && nR.value) qp.set("respaldo",  nR.value.trim());
      const link = base + "index.html?" + qp.toString();
      const out = $("#linkResult");
      if (out) { out.value = link; out.select(); document.execCommand("copy"); toast("Link generado"); }
    });
  }

  // ===== Age Gate 18+ =====
  (function ageGate(){
    if (!CFG.AGE_GATE_ENABLED) return;
    if (localStorage.getItem('AGE_OK') === '1') return;

    const minAge = CFG.EDAD_MINIMA || 18;
    const backdrop = document.createElement('div');
    backdrop.className = 'age-backdrop';
    backdrop.innerHTML = `
      <div class="age-modal">
        <h3>Confirmación de edad <span class="age-badge">${minAge}+</span></h3>
        <p>Para continuar, confirmá que sos mayor de ${minAge} años. Jugá responsable.</p>
        <div class="age-actions">
          <button id="ageYes" class="btn ok">Sí, soy mayor</button>
          <button id="ageNo" class="btn warn">No, salir</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    $("#ageYes")?.addEventListener('click', () => { localStorage.setItem('AGE_OK','1'); backdrop.remove(); });
    $("#ageNo")?.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });
  })();

  // ===== Modal "Más info" =====
  (function(){
    const modal   = $("#modalInfo");
    const btnOpen = $("#btnMasInfo");
    const btnClose= $("#modalClose");
    const btnOk   = $("#modalOk");
    const btnCopy = $("#copySpech");
    const spech   = $("#spechText");
    if (!modal || !btnOpen) return;

    const open  = ()=> { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); };
    const close = ()=> { modal.classList.add('hidden');   modal.setAttribute('aria-hidden','true');  };
    btnOpen.addEventListener('click', open);
    btnClose?.addEventListener('click', close);
    btnOk?.addEventListener('click', close);
    modal.querySelector('.vb-modal__backdrop')?.addEventListener('click', e=>{ if (e.target.dataset.close) close(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
    btnCopy?.addEventListener('click', ()=>{
      const txt = spech?.innerText || '';
      (navigator.clipboard?.writeText(txt) || Promise.reject()).then(
        ()=> toast('Texto copiado ✅'),
        ()=> { const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Texto copiado ✅'); }
      );
    });
  })();
})();
