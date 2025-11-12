// app.js — vanilla JS for dynamic behaviors

const API = {
  partners: "/assets/data/partners.json",
};

// Utility: fetch JSON
async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error("Failed to load " + url);
  return res.json();
}

// Render partners in multiple locations
async function initPartners() {
  try {
    const data = await fetchJSON(API.partners);
    renderInlineLogos(data.slice(0, 4));
    renderPartnersGrid(data);
    renderModalList(data);
    window.PARTNERS_DATA = data; // for debugging
  } catch (e) {
    console.error(e);
  }
}

function renderInlineLogos(list) {
  const host = document.getElementById("partners-inline");
  if (!host) return;
  host.innerHTML = list
    .map(
      (p) =>
        `<img loading="lazy" src="${p.logo}" alt="${p.name}" title="${p.name}">`
    )
    .join("");
}

function renderPartnersGrid(data) {
  const host =
    document.getElementById("partners-list") ||
    document.getElementById("partners-grid") ||
    document.getElementById("partners-list");
  if (!host) return;
  host.innerHTML = data.map((p) => partnerCardHtml(p)).join("");
  attachPartnerButtons();
}

function partnerCardHtml(p) {
  return `
    <article class="card" data-type="${p.type}">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${p.logo}" alt="${
    p.name
  }" loading="lazy" style="height:48px;object-contain">
        <div>
          <div style="font-weight:600">${
            p.name
          } <span style="background:var(--gold);color:#000;padding:2px 6px;border-radius:6px;margin-left:8px;font-size:12px">${
    p.badge || ""
  }</span></div>
          <div style="font-size:13px;color:var(--muted)">${p.type} • рейтинг ${
    p.rating
  }</div>
        </div>
      </div>
      <p style="margin-top:10px;color:var(--muted)">${p.description}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
        <div style="font-family:monospace">${p.bonus}</div>
        <div style="display:flex;gap:8px">
          <button class="btn small" data-open="${p.id}">Перейти</button>
          <a class="btn ghost" href="/reviews.html#${p.id}">Обзор</a>
        </div>
      </div>
    </article>
  `;
}

function attachPartnerButtons() {
  document.querySelectorAll("button[data-open]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-open");
      const p = window.PARTNERS_DATA.find((x) => x.id === id);
      if (!p) return alert("Партнёр не найден");
      trackClick("open_partner", { partner: id });
      window.open(p.url, "_blank", "noopener");
    });
  });
}

function renderModalList(data) {
  const host = document.getElementById("modal-list");
  if (!host) return;
  host.innerHTML = data
    .slice(0, 6)
    .map(
      (p) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.02)">
      <div>
        <div style="font-weight:600">${p.name}</div>
        <div style="font-size:13px;color:var(--muted)">${p.bonus}</div>
      </div>
      <div>
        <button class="btn" data-modal-open="${p.id}">Активировать</button>
      </div>
    </div>
  `
    )
    .join("");

  // attach modal buttons
  host.querySelectorAll("button[data-modal-open]").forEach((b) => {
    b.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-modal-open");
      const p = window.PARTNERS_DATA.find((x) => x.id === id);
      if (!p) return;
      trackClick("activate_bonus", { partner: id });
      window.open(p.url, "_blank", "noopener");
    });
  });
}

// Quick tracking placeholder
function trackClick(action, meta) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: action, ...meta });
  } catch (e) {}
}

// Modal behavior
(function modalSetup() {
  document.addEventListener("click", (e) => {
    if (e.target.id === "modal-close") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  document.getElementById("modal")?.addEventListener("click", (e) => {
    if (e.target.id === "modal") closeModal();
  });
  document.getElementById("open-modal")?.addEventListener("click", openModal);
  document.getElementById("modal-close")?.addEventListener("click", closeModal);
})();
function openModal() {
  document.getElementById("modal").classList.add("open");
}
function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

// Exit-intent popup
(function exitIntent() {
  let shown = false;
  window.addEventListener("mousemove", (e) => {
    if (e.clientY < 10 && !shown) {
      shown = true;
      openModal();
    }
  });
})();

// Connect subscribe form
document.addEventListener("submit", (e) => {
  if (e.target && e.target.id === "subscribe-form") {
    e.preventDefault();
    const em =
      e.target.querySelector('input[name="email"]') ||
      e.target.querySelector('input[type="email"]');
    if (!em.value) return alert("Введите email");
    const subs = JSON.parse(localStorage.getItem("subs") || "[]");
    subs.push({ email: em.value, ts: Date.now() });
    localStorage.setItem("subs", JSON.stringify(subs));
    alert("Спасибо! Вы подписаны.");
    e.target.reset();
  }
});

// Filters on partners page
document.addEventListener("DOMContentLoaded", () => {
  initPartners();
  const filter = document.getElementById("filter-type");
  const search = document.getElementById("search");
  if (filter) filter.addEventListener("change", applyFilterSearch);
  if (search) search.addEventListener("input", applyFilterSearch);
});

function applyFilterSearch() {
  const type = document.getElementById("filter-type")?.value || "all";
  const q = (document.getElementById("search")?.value || "").toLowerCase();
  const cards = document.querySelectorAll(
    "#partners-grid .card, #partners-list .card"
  );
  cards.forEach((card) => {
    const cardType = card.getAttribute("data-type") || "";
    const title = (card.textContent || "").toLowerCase();
    const visible =
      (type === "all" || cardType === type) && (!q || title.includes(q));
    card.style.display = visible ? "" : "none";
  });
}

// Simple countdown formatter (used in modal placeholder)
function startModalTimer(seconds) {
  const el = document.getElementById("modal-timer");
  if (!el) return;
  let s = seconds;
  const t = setInterval(() => {
    if (s <= 0) {
      clearInterval(t);
      el.textContent = "00:00:00";
      return;
    }
    s--;
    const h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    el.textContent = `${h}:${m}:${ss}`;
  }, 1000);
}
startModalTimer(12 * 3600 + 34 * 60 + 56);
