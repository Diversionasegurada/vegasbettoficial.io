// Lógica principal VegasBett
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const CFG = window.VEGASBETT_CONFIG || {};

  // Utils --------------------
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
  function todayKey(){ const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const da=String(d.getDate()).padStart(2,'0'); return `${y}${m}${da}`; }
  const HIDE_KEY = "VB_PROMO_HIDE_"+todayKey();

  // Año en footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Overrides por URL (emergencia) ----
  try {
    const url = new URL(location.href);
    const p = url.searchParams.get("principal");
    const r = url.searchParams.get("respaldo");
    const promos = url.searchParams.get("promos"); // on / off
    if (p) CFG.NUMERO_PRINCIPAL = p;
    if (r) CFG.NUMERO_RESPALDO  = r;
    if (promos==='off') localStorage.setItem(HIDE_KEY,'1');
    if (promos==='on')  localStorage.removeItem(HIDE_KEY);
  } catch (e) {}

  // ====== PROMO TICKER ======
  (function promoTicker(){
    if (!CFG.SHOW_PROMO_TICKER) return;
    if (localStorage.getItem(HIDE_KEY) === '1') return;

    const dias = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
    const idx = new Date().getDay();
    const hoy = dias[idx];
    const pct = (CFG.PROMOS && CFG.PROMOS[hoy]) || 0;

    if (!pct) return; // no hay promo hoy

    const mount = document.getElementById('promoMount');
    if (!mount) return;

    const min = CFG.PROMO_MIN || 2000;
    const max = CFG.PROMO_MAX || 20000;

    const wrap = document.createElement('div');
    wrap.className = 'promo-ticker';
    wrap.innerHTML = `
      <div class="promo-row">
        <div class="promo-day">Promo ${hoy[0].toUpperCase()+hoy.slice(1)}</div>
        <div class="promo-msg">Hoy tenés <strong>+${pct}%</strong> de BONO en cargas de
          <strong>${min.toLocaleString('es-AR')}</strong> a <strong>${max.toLocaleString('es-AR')}</strong>.
        </div>
        <div class="promo-close"><button id="promoHideBtn" title="Ocultar hoy">✕ Ocultar hoy</button></div>
      </div>`;
    mount.replaceChildren(wrap);

    // Ocultar (solo si admin-on)
    $('#promoHideBtn')?.addEventListener('click', ()=>{
      if (!document.body.classList.contains('admin-on')) return;
      localStorage.setItem(HIDE_KEY,'1');
      mount.innerHTML='';
      toast('Banner ocultado por hoy');
    });

    // Clic en logo → cargar
    $('#logoHero')?.addEventListener('click', ()=>{
      location.href='cargar.html';
    });
  })();

  // ====== HOME: botones ======
  if ($("#btnPrincipal")) {
    $("#btnPrincipal").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número principal*.
Gracias.`;
      location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }
  if ($("#btnRespaldo")) {
    $("#btnRespaldo").addEventListener("click", () => {
      const text = `Hola, soy ____.
Necesito atención del *número de reclamos*.
Gracias.`;
      location.href = waUrl(CFG.NUMERO_RESPALDO, text);
    });
  }
  if (document.querySelector('#btnSoyNuevo')) {
    document.querySelector('#btnSoyNuevo').addEventListener('click', () => {
      const texto = "Soy nuevo, quiero mi bono del 35%";
      const url = CFG.NUMERO_PRINCIPAL ? `https://wa.me/${CFG.NUMERO_PRINCIPAL}?text=${encodeURIComponent(texto)}` : `https://wa.me/?text=${encodeURIComponent(texto)}`;
      location.href = url;
    });
  }

  // ====== CARGAR ======
  if ($("#formCargar")) {
    const form  = $("#formCargar");
    const paso2 = $("#paso2");
    const cbu   = $("#cbu");
    const alias = $("#alias");

    if (cbu)   cbu.value   = CFG.CBU   || "";
    if (alias) alias.value = CFG.ALIAS || "";

    $$(".copybtn").forEach(btn => btn.addEventListener("click", (e) => {
      e.preventDefault();
      const ok = copyFromSelector(btn.getAttribute("data-copy"));
      if (!ok) alert('No se pudo copiar');
    }));

    // si hay promo hoy, repetimos nota arriba
    (function mountPromoEnCargar(){
      const mount = document.getElementById('promoMount');
      if (!mount) return;
      const dias = ["domingo","lunes","martes","miercoles","jueves","viernes","sabado"];
      const idx = new Date().getDay(); const hoy = dias[idx];
      const pct = (CFG.PROMOS && CFG.PROMOS[hoy]) || 0;
      if (!CFG.SHOW_PROMO_TICKER || !pct || localStorage.getItem("VB_PROMO_HIDE_"+(new Date().toISOString().slice(0,10).replace(/-/g,'')))==='1') return;
      const min = CFG.PROMO_MIN || 2000;
      const max = CFG.PROMO_MAX || 20000;
      const box = document.createElement('div');
      box.className='promo-ticker';
      box.innerHTML = `<div class="promo-row"><div class="promo-msg">Promo de hoy: <strong>+${pct}%</strong> en cargas de
      <strong>${min.toLocaleString('es-AR')}</strong> a <strong>${max.toLocaleString('es-AR')}</strong>.</div></div>`;
      mount.replaceChildren(box);
    })();

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
        const text = `Hola, soy *${nombre}*.
Quiero *CARGAR* ${moneyFormat(monto)}.
CBU/ALIAS copiado. Envío el comprobante aquí.`;
        location.href = waUrl(CFG.NUMERO_PRINCIPAL, text);
      });
    }
  }

  // ====== RETIRAR ======
  if (document.querySelector("#formRetirar")) {
    const titularInput = document.querySelector("#titularR");
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
      window.location.href = url;
    });
  }

  // ===== Admin oculto (desbloqueo) =====
  (function adminUnlock(){
    const logo = document.getElementById('logoHero');
    const adminBtn = document.getElementById('adminToggle');
    const panel = document.getElementById('adminPanel');
    let tId=null;

    function showAdminBtn(){
      adminBtn?.classList.remove('hidden');
      document.body.classList.add('admin-on');
    }

    // Long-press en logo (~700ms)
    logo?.addEventListener('pointerdown', ()=>{
      tId=setTimeout(showAdminBtn, 700);
    });
    ['pointerup','pointerleave','pointercancel'].forEach(ev=> logo?.addEventListener(ev, ()=>{ if(tId){clearTimeout(tId); tId=null;} }));

    // Acceso rápido: Shift+Alt+A
    document.addEventListener('keydown',(e)=>{
      if (e.shiftKey && e.altKey && (e.key==='a' || e.key==='A')) showAdminBtn();
    });

    adminBtn?.addEventListener('click', ()=> panel?.classList.toggle('hidden'));
  })();

  // Panel Admin acciones
  (function adminPanelActions(){
    const pin   = $("#pin");
    const nP    = $("#nPrincipal");
    const nR    = $("#nRespaldo");
    $("#aplicarAdmin")?.addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      if (nP && nP.value) CFG.NUMERO_PRINCIPAL = nP.value.trim();
      if (nR && nR.value) CFG.NUMERO_RESPALDO  = nR.value.trim();
      toast("Números aplicados (solo en esta sesión)");
    });
    $("#genLink")?.addEventListener("click", () => {
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN || "")) { alert("PIN incorrecto"); return; }
      const base = location.origin + location.pathname.replace(/index\.html?$/i, "");
      const qp = new URLSearchParams();
      if (nP && nP.value) qp.set("principal", nP.value.trim());
      if (nR && nR.value) qp.set("respaldo",  nR.value.trim());
      const link = base + "index.html?" + qp.toString();
      const out = $("#linkResult");
      if (out) { out.value = link; out.select(); document.execCommand("copy"); toast("Link generado"); }
    });
  })();

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

  // ===== Modal "Más info" (spech) =====
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
