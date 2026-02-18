/* =========================================================
   CONFIG
   ========================================================= */

// 4 luni = 120 zile (pentru bară)
const STANDARD_DAYS = 120;

// Delay redirect automat (când e un singur link)
const AUTO_REDIRECT_DELAY_MS = 2200;

// Fallback URL (dacă config.js nu e încărcat / SCRIPT_URL lipsește)
const FALLBACK_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx49hDTAhuifxbylssXlhhlhO5Le70iTxWokvagKUnOXYsItpMwqIhMcOSKsVp2myw/exec";

// Aici alegem URL-ul real:
// - dacă există SCRIPT_URL (din config.js), îl folosim
// - altfel folosim fallback
const AS_URL = (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL)
  ? SCRIPT_URL
  : FALLBACK_SCRIPT_URL;

/* =========================================================
   VERSE ROTATOR
   ========================================================= */

const verses = [
   "„Du-te la furnică, leneșule. Uită-te la căile ei și fii înțelept.” — Proverbele 6:6",
   "„Creația fizică face vizibile calitățile invizibile ale lui Dumnezeu.” — Romani 1:20", 
   "„Cerurile declară gloria lui Dumnezeu.” — Psalmul 19:1",
   "„Toate lucrurile au venit în existență prin El.” — Ioan 1:3",
   "„Iehova este bun cu toți, iar îndurările Lui sunt peste toate lucrările Sale.” — Psalmul 145:9",
   "„Animalele nu au glas, dar existența lor vorbește despre un Creator înțelept.”",
   "„Furnica nu are conducător, dar își pregătește hrana la timp.” — Proverbele 6:7,8",
   "„Observarea naturii ne poate întări credința într-un Creator.”",
   "„Iehova a făcut totul cu un scop.” — Proverbele 16:4",
   "„Pământul este plin de lucrările Tale.” — Psalmul 104:24",
   "„Chiar și cele mai mici creaturi reflectă înțelepciunea divină.”",
   "„Dumnezeu a văzut tot ce făcuse și iată că era foarte bun.” — Geneza 1:31",
   "„Viața nu este rezultatul întâmplării, ci al unui proiect inteligent.”",
   "„Păsările cerului nu seamănă, totuși sunt hrănite.” — Matei 6:26",
   "„Creația proclamă gloria lui Dumnezeu, zi de zi.”",
   "„Iehova este aproape de toți cei ce îl cheamă cu sinceritate.” — Psalmul 145:18",
   "„Ordinea din natură indică un Creator ordonat.”",
   "„Fiecare formă de viață are un rol stabilit.”",
   "„Înțelepciunea lui Dumnezeu se vede chiar și în cele mai mici lucruri.”"
];

// Elemente din pagină
const verseEl = document.getElementById("verse");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const loaderEl = document.getElementById("loader");
const buttonsEl = document.getElementById("buttons");

// Rotire versete
function showRandomVerse() {
  if (!verseEl) return;
  verseEl.style.opacity = 0;
  setTimeout(() => {
    verseEl.innerText = verses[Math.floor(Math.random() * verses.length)];
    verseEl.style.opacity = 1;
  }, 300);
}
showRandomVerse();
const verseInterval = setInterval(showRandomVerse, 5000);

// Helper: oprește “loading mode”
function stopLoadingUI() {
  if (loaderEl) loaderEl.style.display = "none";
  if (subtitleEl) subtitleEl.style.display = "none";
  clearInterval(verseInterval);
}

// Helper: afișează eroare clară în UI
function showErrorUI(msg) {
  stopLoadingUI();
  if (titleEl) titleEl.innerText = msg || "Eroare";
}

/* =========================================================
   HELPERS
   ========================================================= */

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function animateNumber(el, target) {
  const duration = 650;
  const start = 0;
  const t0 = performance.now();

  function step(t) {
    const p = Math.min((t - t0) / duration, 1);
    const v = Math.round(start + (target - start) * p);
    el.textContent = v;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =========================================================
   STATUS CARD
   ========================================================= */

function renderTerritoryStatusList({ prenume, items }) {
  // mount deasupra butoanelor
  let mount = document.getElementById("territoryStatus");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "territoryStatus";
    if (buttonsEl?.parentNode) {
      buttonsEl.parentNode.insertBefore(mount, buttonsEl);
    } else {
      document.body.prepend(mount);
    }
  }

  const arr = Array.isArray(items) ? [...items] : [];

  // sortăm de la cel mai urgent la cel mai "lejer"
  arr.sort((a, b) => (Number(a.zileRamase) || 0) - (Number(b.zileRamase) || 0));

  // sumar sus
  const total = arr.length;
  const urgent = arr.filter(x => {
    const z = Number(x.zileRamase) || 0;
    return z > 0 && z < 7;
  }).length;
  const expirat = arr.filter(x => (Number(x.zileRamase) || 0) <= 0).length;

  mount.innerHTML = `
    <div style="
      margin:14px auto 18px auto;
      max-width:520px;
      border-radius:18px;
      padding:16px;
      background:white;
      box-shadow:0 10px 28px rgba(0,0,0,0.08);
      text-align:left;
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="font-weight:900;">Salut, ${prenume || ""}!</div>
        <div style="font-size:12px;font-weight:900;opacity:0.75;">
          ${total} teritorii • ${urgent} urgente • ${expirat} expirate
        </div>
      </div>

      <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;" id="territoryCards"></div>
    </div>
  `;

  const listEl = document.getElementById("territoryCards");

  arr.forEach((item, idx) => {
    const teritoriu = item.label || "-";
    const zile = Number(item.zileRamase) || 0;
    const luni = Math.floor(Math.max(zile, 0) / 30);
    const pct = Math.min(Math.max((zile / STANDARD_DAYS) * 100, 0), 100);

    let badgeTxt = "OK";
    let color = "#1e8e3e";
    let msg = "";

    if (zile <= 0) {
      badgeTxt = "EXPIRAT";
      color = "#d93025";
      msg = "Predă imediat";
    } else if (zile < 7) {
      badgeTxt = "URGENT";
      color = "#d93025";
      msg = "Foarte puțin timp";
    } else if (zile <= 30) {
      badgeTxt = "ATENȚIE";
      color = "#f9a825";
      msg = "Finalizează curând";
    }

    const card = document.createElement("div");
    card.innerHTML = `
      <div style="
        border:1px solid rgba(0,0,0,0.08);
        border-left:6px solid ${color};
        border-radius:14px;
        padding:12px;
        background:rgba(248,250,253,0.95);
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div style="font-weight:900;">${teritoriu}</div>
          <span style="
            background:${color};
            color:white;
            padding:5px 9px;
            border-radius:999px;
            font-size:11px;
            font-weight:900;
            white-space:nowrap;
          ">${badgeTxt}</span>
        </div>

        <div style="margin-top:6px;font-size:14px;font-weight:900;color:${color};">
          <span id="days-${idx}">0</span> zile
          <span style="font-size:12px;opacity:0.8;">(${luni} luni)</span>
        </div>

        ${msg ? `<div style="margin-top:6px;font-size:12px;font-weight:900;opacity:0.75;">${msg}</div>` : ""}

        <div style="margin-top:10px;height:9px;background:#e0e0e0;border-radius:999px;overflow:hidden;">
          <div id="bar-${idx}" style="height:100%;width:0%;background:${color};transition:width 0.9s;"></div>
        </div>
      </div>
    `;

    listEl.appendChild(card);

    // animăm numărul + bara
    const countEl = document.getElementById(`days-${idx}`);
    const barEl = document.getElementById(`bar-${idx}`);
    if (countEl) animateNumber(countEl, Math.max(zile, 0));
    setTimeout(() => { if (barEl) barEl.style.width = pct + "%"; }, 120);
  });
}


/* =========================================================
   MAIN
   ========================================================= */

const k = getParam("k");

// prenume din “Abrudan Alin” -> “Alin”
let prenume = "";
if (k) {
  prenume = k.trim().split(" ").pop();
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.innerText = prenume;
}

// fără k -> stop
if (!k) {
  showErrorUI("Lipsește parametrul k");
} else {
  // Afișăm (opțional) în consolă ce URL folosește
  console.log("Apps Script URL folosit:", AS_URL);

  fetch(AS_URL + "?k=" + encodeURIComponent(k))
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      stopLoadingUI();

      if (!Array.isArray(data) || !data.length) {
        if (titleEl) titleEl.innerText = "Nu există linkuri pentru acest cod";
        return;
      }

      renderTerritoryStatusList({
  prenume,
  items: data
});


      if (titleEl) titleEl.innerText = `Alege unde vrei să mergi, ${prenume}`;

      // 1 link -> redirect după puțin timp
      if (data.length === 1 && primary.url) {
        if (buttonsEl) buttonsEl.innerHTML = "";
        if (titleEl) titleEl.innerText = `Se deschide teritoriul, ${prenume}…`;

        setTimeout(() => {
          window.location.href = primary.url;
        }, AUTO_REDIRECT_DELAY_MS);

        return;
      }

      // mai multe -> butoane cu zile
      if (buttonsEl) buttonsEl.innerHTML = "";

      data.forEach(item => {
        const zile = Number(item.zileRamase) || 0;
        const luni = Math.floor(Math.max(zile, 0) / 30);

        let accent = "#1e8e3e";
        if (zile <= 0 || zile < 7) accent = "#d93025";
        else if (zile <= 30) accent = "#f9a825";

        const btn = document.createElement("button");
        btn.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start;">
            <div style="font-weight:800;">${item.label || "Deschide link"}</div>
            <div style="font-size:12px;font-weight:800;color:${accent};">
              ${zile} zile (${luni} luni)
            </div>
          </div>
        `;

        btn.style.borderLeft = `6px solid ${accent}`;
        btn.onclick = () => window.location.href = item.url;

        if (buttonsEl) buttonsEl.appendChild(btn);
      });
    })
    .catch(err => {
      console.error(err);
      showErrorUI("Eroare la încărcare (verifică URL / deploy / permisiuni)");
    });
}
