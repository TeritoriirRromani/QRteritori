const AS_URL_BASE = "https://script.google.com/macros/s/AKfycbzyUrr8MvpdmNwQxPwBxvjG0A8olKI7UiWLXMYXYgfMRMkz9so2w4uc3Bc8QzdovDky/exec";

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

// 🔹 Elemente din pagină
const verseEl = document.getElementById("verse");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const loaderEl = document.getElementById("loader");
const buttonsEl = document.getElementById("buttons");

// 🔹 Afișare text random
function showRandomVerse() {
  verseEl.style.opacity = 0;
  setTimeout(() => {
    verseEl.innerText = verses[Math.floor(Math.random() * verses.length)];
    verseEl.style.opacity = 1;
  }, 300);
}

showRandomVerse();
const verseInterval = setInterval(showRandomVerse, 5000);

// 🔹 Citim parametrul k
const params = new URLSearchParams(window.location.search);
const k = params.get("k");

// 🔹 Extragem prenumele (din "Abrudan Alin" → "Alin")
let prenume = "";
if (k) {
  prenume = k.trim().split(" ").pop();
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.innerText = prenume;
}

// 🔹 Dacă lipsește k
if (!k) {
  titleEl.innerText = "Lipsește parametrul k";
  loaderEl.style.display = "none";
  subtitleEl.style.display = "none";
  clearInterval(verseInterval);
} else {
  fetch(AS_URL_BASE + "?k=" + encodeURIComponent(k))
    .then(r => r.json())
    .then(data => {
      loaderEl.style.display = "none";
      subtitleEl.style.display = "none";
      clearInterval(verseInterval);

      if (!data.length) {
        titleEl.innerText = "Nu există linkuri pentru acest cod";
        return;
      }

      // 🔹 Redirect automat dacă există un singur link
      if (data.length === 1) {
        window.location.href = data[0].url;
        return;
      }

      // 🔹 Titlu personalizat
      titleEl.innerText = `Alege unde vrei să mergi, ${prenume}`;

      // 🔹 Butoane
      data.forEach(item => {
        const btn = document.createElement("button");
        btn.innerText = item.label || "Deschide link";
        btn.onclick = () => window.location.href = item.url;
        buttonsEl.appendChild(btn);
      });
    })
    .catch(err => {
      loaderEl.style.display = "none";
      subtitleEl.style.display = "none";
      titleEl.innerText = "Eroare la încărcare";
      clearInterval(verseInterval);
      console.error(err);
    });
}
