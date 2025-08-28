// ===============================
// Lógica principal VegasBett (privado)
// ===============================
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.VEGASBETT_CONFIG || {};

  // -------- Utilidades --------
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
  function todayPromoPercent() {
    const map = CFG.PROMOS || {};
    const p = Number(map[(new Date()).getDay()] || 0);
    return isNaN(p) ? 0 : p;
  }

  // Año en footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Overrides por URL (emergencia)
  try {
    const url = new URL(location.href);
    const p = url.searchParams.get("principal");
    const r = url.searchParams.get("respaldo");
    if (p) CFG.NUMERO_PRINCIPAL = p;
    if (r) CFG.NUMERO_RESPALDO  = r;
  } catch (e) {}

  // Logo click -> Cargar
  $("#logoHero")?.addEventListener("click", ()=> location.href = "cargar.html");

  // Mostrar botón Admin con long-press en logo (o Shift+Alt+A)
  const adminBtn = $("#adminToggle");
  const logo = $("#logoHero");
  let pressTimer;
  function showAdmin(){ if (adminBtn) adminBtn.style.display = 'inline-block'; toast('Admin visible'); }
  logo?.addEventListener('mousedown', ()=> { pressTimer = setTimeout(showAdmin, 700); });
  logo?.addEventListener('touchstart', ()=> { pressTimer = setTimeout(showAdmin, 700); }, {passive:true});
  ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => logo?.addEventListener(ev, ()=> clearTimeout(pressTimer)));
  document.addEventListener('keydown', (e)=>{ if(e.shiftKey && e.altKey && e.code==='KeyA') showAdmin(); });

  // Home: botones directos
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
  // Soy nuevo (bono 35%)
  if (document.querySelector('#btnSoyNuevo')) {
    document.querySelector('#btnSoyNuevo').addEventListener('click', () => {
      const texto = "Soy nuevo, quiero mi bono del 35%";
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "bono_nuevo" }); }
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, texto);
    });
  }

  // ===== Banner promo en Home =====
  (function initPromoTicker(){
    const el = document.getElementById('promoTicker');
    if (!el) return;
    const pct = todayPromoPercent();
    const min = CFG.PROMO_MIN || 2000;
    const max = CFG.PROMO_MAX || 20000;

    // overrides por URL: ?promos=off / ?promos=on
    let force = null;
    try {
      const q = new URL(location.href).searchParams.get('promos');
      if (q === 'off') force = false;
      if (q === 'on')  force = true;
    } catch(e){}

    const shouldShow = (force !== null) ? force : (!!CFG.SHOW_PROMO_TICKER && pct > 0);
    if (!shouldShow) { el.classList.add('hidden'); return; }

    const txt = document.getElementById('promoText');
    if (txt) txt.textContent = `Hoy: bono +${pct}% en cargas de ${moneyFormat(min)} a ${moneyFormat(max)}.`;
    el.classList.remove('hidden');
  })();

  // ===== CARGAR =====
  if ($("#formCargar")) {
    const form  = $("#formCargar");
    const paso2 = $("#paso2");
    const cbu   = $("#cbu");
    const alias = $("#alias");

    // Detectar si entró por promo
    const qp = new URL(location.href).searchParams;
    const promoOn  = qp.get('promo') === 'on';
    const promoPct = todayPromoPercent();
    const promoMin = CFG.PROMO_MIN || 2000;
    const promoMax = CFG.PROMO_MAX || 20000;

    // Nota “promo activa”
    if (promoOn && promoPct > 0) {
      const note = document.createElement('div');
      note.className = 'note'; note.style.marginTop = '8px';
      note.textContent = `Promo +${promoPct}% activa hoy en cargas de ${moneyFormat(promoMin)} a ${moneyFormat(promoMax)}.`;
      form.parentNode.insertBefore(note, form);
    }

    if (cbu)   cbu.value   = CFG.CBU   || "";
    if (alias) alias.value = CFG.ALIAS || "";

    $$(".copybtn").forEach(btn => btn.addEventListener("click", (e) => {
      e.preventDefault();
      copyFromSelector(btn.getAttribute("data-copy"));
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#nombre").value.trim();
      const monto  = $("#monto").value.trim();
      if (!nombre || !monto) { alert("Completá nombre y monto."); return; }

      // Rango obligatorio solo si vienen por promo
      if (promoOn && promoPct > 0) {
        const val = Number(monto);
        if (isNaN(val) || val < promoMin || val > promoMax) {
          alert(`Para aplicar el bono +${promoPct}%, la carga debe ser entre ${moneyFormat(promoMin)} y ${moneyFormat(promoMax)}.`);
          return;
        }
      }

      paso2.classList.remove("hidden");
      paso2.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const enviar = $("#enviarWhatsCargar");
    if (enviar) {
      enviar.addEventListener("click", () => {
        const nombre = $("#nombre").value.trim();
        const monto  = $("#monto").value.trim();
        if (!nombre || !monto) { alert("Completá nombre y monto."); return; }

        if (promoOn && promoPct > 0) {
          const val = Number(monto);
          if (isNaN(val) || val < promoMin || val > promoMax) {
            alert(`Para aplicar el bono +${promoPct}%, la carga debe ser entre ${moneyFormat(promoMin)} y ${moneyFormat(promoMax)}.`);
            return;
          }
        }

        const extra = (promoOn && promoPct > 0) ? `\n[PROMO +${promoPct}% válida hoy]` : '';
        const text = `Hola, soy *${nombre}*.
Quiero *CARGAR* ${moneyFormat(monto)}.
CBU/ALIAS copiado. Envío el comprobante aquí.${extra}`;
        if (typeof fbq === "function") { fbq("track", "Contact", { flow: "cargar" }); }
        location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
      });
    }
  }

  // ===== RETIRAR (solo DATOS) =====
  if (document.querySelector("#formRetirar")) {
    const titularInput  = document.querySelector("#titularR");
    const cbuAliasInput = document.querySelector("#cbuAliasR");
    if (titularInput && CFG.TITULAR) titularInput.value = CFG.TITULAR;
    if (cbuAliasInput) cbuAliasInput.value = (CFG.ALIAS || CFG.CBU || "");

    document.querySelector("#formRetirar").addEventListener("submit", (e) => {
      e.preventDefault();

      const usuario  = document.querySelector("#usuarioR").value.trim();
      const titular  = document.querySelector("#titularR").value.trim();
      const cbuAlias = document.querySelector("#cbuAliasR").value.trim();
      const monto    = document.querySelector("#montoR").value.trim();

      if (!usuario || !titular || !cbuAlias || !monto) {
        alert("Completá todos los campos."); return;
      }
      if (Number(monto) > 250000) {
        alert("El monto máximo por retiro es $250.000"); return;
      }

      const text = `Usuario: ${usuario}
Titular: ${titular}
CBU o Alias: ${cbuAlias}
Monto a retirar: ${moneyFormat(monto)}`;
      if (typeof fbq === "function") { fbq("track", "Contact", { flow: "retirar" }); }
      window.location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }

  // ===== Panel Admin =====
  const adminToggle = $("#adminToggle");
  const panel = $("#adminPanel");
  const pin   = $("#pin");
  const nP    = $("#nPrincipal");
  const nR    = $("#nRespaldo");

  if (adminToggle && panel) {
    adminToggle.addEventListener("click", () => panel.classList.toggle("hidden"));
  }
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

  // ---- Age Gate 18+ ----
  (function ageGate(){
    const C = window.VEGASBETT_CONFIG || {};
    if (!C.AGE_GATE_ENABLED) return;
    if (localStorage.getItem('AGE_OK') === '1') return;

    const minAge = C.EDAD_MINIMA || 18;
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
      </div>
    `;
    document.body.appendChild(backdrop);

    document.getElementById('ageYes')?.addEventListener('click', () => {
      localStorage.setItem('AGE_OK', '1');
      backdrop.remove();
    });
    document.getElementById('ageNo')?.addEventListener('click', () => {
      window.location.href = 'https://www.google.com';
    });
  })();

  // ===== Modal "Más info" =====
  (function(){
    const modal   = document.getElementById('modalInfo');
    const btnOpen = document.getElementById('btnMasInfo');
    const btnClose= document.getElementById('modalClose');
    const btnOk   = document.getElementById('modalOk');
    const btnCopy = document.getElementById('copySpech');
    const spech   = document.getElementById('spechText');

    if (!modal || !btnOpen) return;

    const open  = ()=> { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); };
    const close = ()=> { modal.classList.add('hidden');   modal.setAttribute('aria-hidden','true');  };

    btnOpen.addEventListener('click', open);
    btnClose?.addEventListener('click', close);
    btnOk?.addEventListener('click', close);
    modal.querySelector('.vb-modal__backdrop')?.addEventListener('click', e=>{
      if (e.target.dataset.close) close();
    });
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
