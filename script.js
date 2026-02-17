/* =========================================================
   CONFIG
   ========================================================= */
const AS_URL_BASE = "https://script.google.com/macros/s/AKfycbzyUrr8MvpdmNwQxPwBxvjG0A8olKI7UiWLXMYXYgfMRMkz9so2w4uc3Bc8QzdovDky/exec";

// Perioada standard pentru bară (4 luni = 120 zile)
const STANDARD_DAYS = 120;

// Delay înainte de redirect automat (când există un singur link)
const AUTO_REDIRECT_DELAY_MS = 2200;

/* =========================================================
   VERSE ROTATOR (păstrăm exact ce aveai)
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

// Elemente existente în pagină (le păstrăm)
const verseEl = document.getElementById("verse");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const loaderEl = document.getElementById("loader");
const buttonsEl = document.getElementById("buttons");

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

/* =========================================================
   HELPERS UI (badge + bară + countdown + mesaje)
   ========================================================= */

// Încarcă stiluri pentru widget (o singură dată)
function ensureStatusStyles() {
  if (document.getElementById("territory-status-styles")) return;

  const style = document.createElement("style");
  style.id = "territory-status-styles";
  style.textContent = `
    .tstatus-card{
      margin: 14px auto 18px auto;
      max-width: 520px;
      border-radius: 18px;
      padding: 16px;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 10px 28px rgba(0,0,0,0.08);
      backdrop-filter: blur(6px);
      text-align: left;
    }
    .tstatus-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .tstatus-title{
      font-weight: 900;
      font-size: 14px;
      opacity: 0.9;
    }
    .tstatus-badge{
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.2px;
    }
    .tstatus-urgent{ background:#ffd6d6; color:#d93025; }
    .tstatus-warning{ background:#fff3cd; color:#f9a825; }
    .tstatus-ok{ background:#e6f4ea; color:#1e8e3e; }

    .tstatus-count{
      margin-top: 10px;
      font-size: 34px;
      font-weight: 1000;
      line-height: 1.05;
    }
    .tstatus-sub{
      margin-top: 2px;
      font-size: 12px;
      font-weight: 800;
      opacity: 0.7;
    }
    .tstatus-msg{
      margin-top: 10px;
      font-size: 13px;
      font-weight: 900;
    }

    .tstatus-progress{
      margin-top: 12px;
      height: 9px;
      background: #e0e0e0;
      border-radius: 999px;
      overflow: hidden;
    }
    .tstatus-bar{
      height: 100%;
      width: 0%;
      transition: width 0.9s ease;
    }

    .tstatus-next{
      margin-top: 10px;
      font-size: 12px;
      font-weight: 800;
      opacity: 0.7;
    }

    /* mic highlight când e urgent */
    .tstatus-card.urgent-glow{
      border-color: rgba(217,48,37,0.35);
      box-shadow: 0 10px 32px rgba(217,48,37,0.12);
    }
  `;
  document.head.appendChild(style);
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function animateNumber(el, target) {
  // Animăm 0 -> target într-un mod “smooth”
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

// Afișează cardul de status deasupra butoanelor
function renderTerritoryStatus({ prenume, teritoriu, zileRamase }) {
  ensureStatusStyles();

  // Ne asigurăm că există un “mount” – îl inserăm înainte de butoane
  let mount = document.getElementById("territoryStatus");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "territoryStatus";

    // Îl punem după titlu, înainte de butoane
    // Dacă nu ai structura exactă, îl punem înainte de buttonsEl
    if (buttonsEl && buttonsEl.parentNode) {
      buttonsEl.parentNode.insertBefore(mount, buttonsEl);
    } else {
      document.body.insertBefore(mount, document.body.firstChild);
    }
  }

  const zile = Number(zileRamase) || 0;
  const luni = Math.floor(Math.max(zile, 0) / 30);

  // Badge + culori + mesaje speciale
  let badgeCls = "tstatus-ok";
  let badgeTxt = "OK";
  let barColor = "#1e8e3e";
  let msg = "";

  if (zile <= 0) {
    badgeCls = "tstatus-urgent";
    badgeTxt = "EXPIRAT";
    barColor = "#d93025";
    msg = "⚠ Teritoriul trebuie predat imediat!";
  } else if (zile < 7) {
    badgeCls = "tstatus-urgent";
    badgeTxt = "URGENT";
    barColor = "#d93025";
    msg = "⚠ Mai ai foarte puțin timp!";
  } else if (zile <= 30) {
    badgeCls = "tstatus-warning";
    badgeTxt = "ATENȚIE";
    barColor = "#f9a825";
    msg = "⏳ Încearcă să finalizezi cât mai repede.";
  }

  // Procent pentru bară (din 120 zile standard)
  const pct = Math.min(Math.max((zile / STANDARD_DAYS) * 100, 0), 100);

  // Highlight vizual când e urgent/expirat
  const glow = (zile <= 0 || zile < 7) ? "urgent-glow" : "";

  mount.innerHTML = `
    <div class="tstatus-card ${glow}">
      <div class="tstatus-top">
        <div class="tstatus-title">${prenume ? `Salut, ${prenume}!` : "Status teritoriu"}</div>
        <span class="tstatus-badge ${badgeCls}">${badgeTxt}</span>
      </div>

      <div class="tstatus-sub">Teritoriu: <b>${teritoriu || "-"}</b></div>

      <div class="tstatus-count">
        <span id="daysCount">0</span> zile
      </div>
      <div class="tstatus-sub">(${luni} luni) rămase</div>

      ${msg ? `<div class="tstatus-msg">${msg}</div>` : ""}

      <div class="tstatus-progress">
        <div class="tstatus-bar" id="daysBar" style="background:${barColor};"></div>
      </div>

      <div class="tstatus-next">Se actualizează automat când se schimbă evidența.</div>
    </div>
  `;

  // Animăm numărul și bara
  const countEl = document.getElementById("daysCount");
  if (countEl) animateNumber(countEl, Math.max(zile, 0));

  setTimeout(() => {
    const bar = document.getElementById("daysBar");
    if (bar) bar.style.width = pct + "%";
  }, 120);
}

/* =========================================================
   MAIN LOGIC (k -> fetch -> status + redirect/butoane)
   ========================================================= */

// Citim parametrul k (ex: "Abrudan Alin")
const k = getParam("k");

// Extragem prenumele (din "Abrudan Alin" -> "Alin")
let prenume = "";
if (k) {
  prenume = k.trim().split(" ").pop();
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.innerText = prenume;
}

// Dacă lipsește k, afișăm mesaj și stop
if (!k) {
  if (titleEl) titleEl.innerText = "Lipsește parametrul k";
  if (loaderEl) loaderEl.style.display = "none";
  if (subtitleEl) subtitleEl.style.display = "none";
  clearInterval(verseInterval);
} else {

  fetch(AS_URL_BASE + "?k=" + encodeURIComponent(k))
    .then(r => r.json())
    .then(data => {
      if (loaderEl) loaderEl.style.display = "none";
      if (subtitleEl) subtitleEl.style.display = "none";
      clearInterval(verseInterval);

      if (!Array.isArray(data) || !data.length) {
        if (titleEl) titleEl.innerText = "Nu există linkuri pentru acest cod";
        return;
      }

      // Dacă avem zileRamase în response, putem afișa statusul
      // - dacă sunt mai multe linkuri: folosim primul (de obicei e teritoriul)
      // - dacă e un singur link: tot îl folosim pentru status
      const primary = data[0] || {};
      const teritoriuLabel = primary.label || "";

      // Render status card (badge + zile + bară + countdown + mesaje)
      renderTerritoryStatus({
        prenume,
        teritoriu: teritoriuLabel,
        zileRamase: primary.zileRamase
      });

      // Titlu personalizat
      if (titleEl) titleEl.innerText = `Alege unde vrei să mergi, ${prenume}`;

      // Dacă există un singur link => redirect automat DUPĂ puțin timp
      // ca fratele să apuce să vadă statusul
      if (data.length === 1 && primary.url) {
        if (buttonsEl) buttonsEl.innerHTML = ""; // nu mai afișăm butoane
        if (titleEl) titleEl.innerText = `Se deschide teritoriul, ${prenume}…`;

        setTimeout(() => {
          window.location.href = primary.url;
        }, AUTO_REDIRECT_DELAY_MS);

        return;
      }

      // Dacă sunt mai multe linkuri => afișăm butoane (ca înainte)
      if (buttonsEl) buttonsEl.innerHTML = "";

      data.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item.label || "Deschide link";
        btn.onclick = () => window.location.href = item.url;
        if (buttonsEl) buttonsEl.appendChild(btn);
      });
    })
    .catch(err => {
      if (loaderEl) loaderEl.style.display = "none";
      if (subtitleEl) subtitleEl.style.display = "none";
      if (titleEl) titleEl.innerText = "Eroare la încărcare";
      clearInterval(verseInterval);
      console.error(err);
    });
}
