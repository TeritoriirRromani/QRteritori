/* =========================================================
   CONFIG
   ========================================================= */

const STANDARD_DAYS = 120;          // 4 luni
const AUTO_REDIRECT_DELAY_MS = 2200;

/* =========================================================
   VERSE ROTATOR
   ========================================================= */

const verses = [
  "„Du-te la furnică, leneșule. Uită-te la căile ei și fii înțelept.” — Proverbele 6:6",
  "„Creația fizică face vizibile calitățile invizibile ale lui Dumnezeu.” — Romani 1:20",
  "„Cerurile declară gloria lui Dumnezeu.” — Psalmul 19:1",
  "„Toate lucrurile au venit în existență prin El.” — Ioan 1:3",
  "„Iehova este bun cu toți...” — Psalmul 145:9"
];

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

function renderTerritoryStatus({ prenume, teritoriu, zileRamase }) {

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

  const zile = Number(zileRamase) || 0;
  const luni = Math.floor(Math.max(zile, 0) / 30);

  let badgeTxt = "OK";
  let badgeColor = "#1e8e3e";
  let msg = "";

  if (zile <= 0) {
    badgeTxt = "EXPIRAT";
    badgeColor = "#d93025";
    msg = "⚠ Teritoriul trebuie predat imediat!";
  } else if (zile < 7) {
    badgeTxt = "URGENT";
    badgeColor = "#d93025";
    msg = "⚠ Mai ai foarte puțin timp!";
  } else if (zile <= 30) {
    badgeTxt = "ATENȚIE";
    badgeColor = "#f9a825";
  }

  const pct = Math.min(Math.max((zile / STANDARD_DAYS) * 100, 0), 100);

  mount.innerHTML = `
    <div style="
      margin:14px auto 18px auto;
      max-width:520px;
      border-radius:18px;
      padding:16px;
      background:white;
      box-shadow:0 10px 28px rgba(0,0,0,0.08);
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:900;">Salut, ${prenume || ""}!</div>
        <span style="
          background:${badgeColor};
          color:white;
          padding:6px 10px;
          border-radius:999px;
          font-size:11px;
          font-weight:900;
        ">${badgeTxt}</span>
      </div>

      <div style="margin-top:6px;font-size:13px;font-weight:700;">
        Teritoriu: <b>${teritoriu || "-"}</b>
      </div>

      <div style="margin-top:10px;font-size:34px;font-weight:1000;">
        <span id="daysCount">0</span> zile
      </div>
      <div style="font-size:12px;font-weight:800;opacity:0.7;">
        (${luni} luni) rămase
      </div>

      ${msg ? `<div style="margin-top:10px;font-weight:900;">${msg}</div>` : ""}

      <div style="margin-top:12px;height:9px;background:#e0e0e0;border-radius:999px;overflow:hidden;">
        <div id="daysBar" style="height:100%;width:0%;background:${badgeColor};transition:width 0.9s;"></div>
      </div>
    </div>
  `;

  animateNumber(document.getElementById("daysCount"), Math.max(zile, 0));
  setTimeout(() => {
    document.getElementById("daysBar").style.width = pct + "%";
  }, 100);
}

/* =========================================================
   MAIN
   ========================================================= */

const k = getParam("k");

let prenume = "";
if (k) {
  prenume = k.trim().split(" ").pop();
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.innerText = prenume;
}

if (!k) {
  titleEl && (titleEl.innerText = "Lipsește parametrul k");
  loaderEl && (loaderEl.style.display = "none");
  subtitleEl && (subtitleEl.style.display = "none");
  clearInterval(verseInterval);
} else {

  // 🔥 FOLOSIM SCRIPT_URL DIN config.js
  fetch(SCRIPT_URL + "?k=" + encodeURIComponent(k))
    .then(r => r.json())
    .then(data => {

      loaderEl && (loaderEl.style.display = "none");
      subtitleEl && (subtitleEl.style.display = "none");
      clearInterval(verseInterval);

      if (!Array.isArray(data) || !data.length) {
        titleEl && (titleEl.innerText = "Nu există linkuri pentru acest cod");
        return;
      }

      const primary = data[0];

      renderTerritoryStatus({
        prenume,
        teritoriu: primary.label,
        zileRamase: primary.zileRamase
      });

      titleEl && (titleEl.innerText = `Alege unde vrei să mergi, ${prenume}`);

      // Redirect automat dacă e un singur link
      if (data.length === 1 && primary.url) {
        buttonsEl && (buttonsEl.innerHTML = "");
        titleEl && (titleEl.innerText = `Se deschide teritoriul, ${prenume}…`);
        setTimeout(() => {
          window.location.href = primary.url;
        }, AUTO_REDIRECT_DELAY_MS);
        return;
      }

      // Mai multe linkuri → butoane cu zile
      buttonsEl && (buttonsEl.innerHTML = "");

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

        buttonsEl.appendChild(btn);
      });

    })
    .catch(err => {
      loaderEl && (loaderEl.style.display = "none");
      subtitleEl && (subtitleEl.style.display = "none");
      titleEl && (titleEl.innerText = "Eroare la încărcare");
      clearInterval(verseInterval);
      console.error(err);
    });
}
