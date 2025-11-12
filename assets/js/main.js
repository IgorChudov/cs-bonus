async function loadPartners() {
  const response = await fetch("./assets/data/partners.json");
  const partners = await response.json();

  const container = document.getElementById("partners-container");
  partners.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <p>Вводи промокод: ${p.bonusCode}</p>
      <a href="${p.link}" target="_blank" class="btn">Перейти</a>
    `;
    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadPartners);
