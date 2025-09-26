// ---- FRED Data Section ----
// You need a FRED API key for full access.
// Get one for free at https://fred.stlouisfed.org/docs/api/api_key.html
const FRED_API_KEY = ""; // Optional: add your FRED API key here
const FRED_SERIES = [
  { id: "CPIAUCSL", name: "Consumer Price Index (CPI-U)" },
  { id: "UNRATE", name: "Unemployment Rate" },
  { id: "GDP", name: "Gross Domestic Product (GDP)" }
];

async function fetchFRED(seriesId) {
  let url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&file_type=json`;
  if (FRED_API_KEY) url += `&api_key=${FRED_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`FRED API error (${resp.status})`);
  const data = await resp.json();
  const lastObs = data.observations?.slice(-1)[0];
  return {
    date: lastObs?.date,
    value: lastObs?.value,
    units: data.units || "",
    title: data?.seriess?.[0]?.title || seriesId
  };
}

async function renderFRED() {
  const el = document.getElementById("fred-data");
  el.innerHTML = `<div class="card"><span class="spinner"></span> Loading FRED data…</div>`;
  try {
    const results = await Promise.all(FRED_SERIES.map(s => fetchFRED(s.id)));
    el.innerHTML = results.map((d, i) =>
      `<div class="card">
        <strong>${FRED_SERIES[i].name}</strong><br>
        <span>${d.value} (${d.date})</span>
      </div>`
    ).join("");
  } catch (e) {
    el.innerHTML = `<div class="card danger">Error loading FRED data: ${e.message}</div>`;
  }
}

// ---- Federal Reserve News & Publications ----
// Uses the public RSS feed for all press releases (no API key needed)
async function renderFedNews() {
  const el = document.getElementById("fed-news");
  el.innerHTML = `<div class="card"><span class="spinner"></span> Loading news…</div>`;
  try {
    const resp = await fetch("https://www.federalreserve.gov/feeds/press_all.xml");
    if (!resp.ok) throw new Error("Fed news feed error " + resp.status);
    const text = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const items = Array.from(doc.querySelectorAll("item")).slice(0, 6);
    el.innerHTML = items.map(item =>
      `<div class="card">
        <a href="${item.querySelector("link").textContent}" target="_blank">${item.querySelector("title").textContent}</a>
        <div class="meta">${item.querySelector("pubDate")?.textContent || ""}</div>
      </div>`
    ).join("") || `<div class="card empty">No news found.</div>`;
  } catch (e) {
    el.innerHTML = `<div class="card danger">Error loading Fed news: ${e.message}</div>`;
  }
}

// ---- Research & Commentary (Fed Speeches) ----
async function renderFedResearch() {
  const el = document.getElementById("fed-research");
  el.innerHTML = `<div class="card"><span class="spinner"></span> Loading research…</div>`;
  try {
    const resp = await fetch("https://www.federalreserve.gov/feeds/speeches.xml");
    if (!resp.ok) throw new Error("Speeches feed error " + resp.status);
    const text = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");
    const items = Array.from(doc.querySelectorAll("item")).slice(0, 6);
    el.innerHTML = items.map(item =>
      `<div class="card">
        <a href="${item.querySelector("link").textContent}" target="_blank">${item.querySelector("title").textContent}</a>
        <div class="meta">${item.querySelector("pubDate")?.textContent || ""}</div>
      </div>`
    ).join("") || `<div class="card empty">No research found.</div>`;
  } catch (e) {
    el.innerHTML = `<div class="card danger">Error loading research: ${e.message}</div>`;
  }
}

// ---- Tools & Calculators (Static Links, can add widgets) ----
function renderFedTools() {
  const el = document.getElementById("fed-tools");
  el.innerHTML = `
    <div class="card">
      <a href="https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator" target="_blank">Inflation Calculator (Minneapolis Fed)</a>
    </div>
    <div class="card">
      <a href="https://fred.stlouisfed.org/" target="_blank">FRED Data Explorer</a>
    </div>
    <div class="card">
      <a href="https://www.federalreserve.gov/monetarypolicy.htm" target="_blank">Monetary Policy Resources</a>
    </div>
  `;
}

// ---- Run all sections on page load ----
window.addEventListener("DOMContentLoaded", () => {
  renderFRED();
  renderFedNews();
  renderFedResearch();
  renderFedTools();
});
