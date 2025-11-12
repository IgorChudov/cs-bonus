let skins = [];

async function loadSkins() {
  const response = await fetch("./assets/data/skins.json");
  skins = await response.json();
  displaySkins(skins);
}

function displaySkins(list) {
  const container = document.getElementById("skins-container");
  container.innerHTML = "";

  list.forEach((skin) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${skin.image}" alt="${skin.name}">
      <h3>${skin.name}</h3>
      <p><strong>Редкость:</strong> ${skin.rarity}</p>
      <p><strong>Цена:</strong> ${skin.price}</p>
      <p>${skin.description}</p>
    `;
    container.appendChild(card);
  });
}

document.getElementById("search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const filtered = skins.filter((s) => s.name.toLowerCase().includes(value));
  displaySkins(filtered);
});

document.addEventListener("DOMContentLoaded", loadSkins);
