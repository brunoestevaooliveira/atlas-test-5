const map = L.map('map').setView([-15.9, -47.95], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Referências aos elementos da interface
const searchInput = document.getElementById('search');
const toggleIssues = document.getElementById('toggleIssues');
const issuePanel = document.getElementById('issuePanel');
const issuesList = document.getElementById('issuesList');

let issuesData = [];
let markers = [];

// Busca ocorrências da API e atualiza o mapa e a lista
async function fetchIssues() {
  try {
    const res = await fetch('/api/issues');
    if (!res.ok) throw new Error('Erro ao buscar ocorrências');
    issuesData = await res.json();
    renderMarkers();
    renderList();
  } catch (err) {
    console.error(err);
  }
}

// Filtra uma ocorrência com base na busca
function filterIssue(issue) {
  const query = searchInput.value.trim().toLowerCase();
  return (
    issue.title.toLowerCase().includes(query) ||
    issue.description.toLowerCase().includes(query) ||
    issue.category_name.toLowerCase().includes(query)
  );
}

// Renderiza marcadores no mapa de acordo com o filtro e o estado do toggle
function renderMarkers() {
  // Remove marcadores atuais
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
  if (!toggleIssues.checked) return;
  const filtered = issuesData.filter(filterIssue);
  filtered.forEach((issue) => {
    const marker = L.marker([issue.lat, issue.lng]).addTo(map);
    marker.bindPopup(
      `<b>${issue.title}</b><br>${issue.category_name}<br>Status: ${issue.status}<br>Votos: ${issue.votes}`
    );
    markers.push(marker);
  });
}

// Renderiza a lista de ocorrências no painel lateral
function renderList() {
  issuesList.innerHTML = '';
  if (!toggleIssues.checked) return;
  const filtered = issuesData.filter(filterIssue);
  if (filtered.length === 0) {
    issuesList.innerHTML =
      '<p class="text-gray-500 p-4">Nenhuma ocorrência encontrada.</p>';
    return;
  }
  filtered.forEach((issue) => {
    const item = document.createElement('div');
    item.className = 'p-4 border-b cursor-pointer';
    item.innerHTML = `
      <h3 class="font-semibold text-lg">${issue.title}</h3>
      <p><span class="font-medium">Categoria:</span> ${issue.category_name}</p>
      <p><span class="font-medium">Status:</span> ${issue.status}</p>
      <p><span class="font-medium">Votos:</span> ${issue.votes}</p>
    `;
    item.addEventListener('click', () => {
      map.setView([issue.lat, issue.lng], 15);
    });
    issuesList.appendChild(item);
  });
}

// Observa alterações no campo de busca
searchInput.addEventListener('input', () => {
  renderMarkers();
  renderList();
});

// Observa alterações no toggle para mostrar/ocultar ocorrências
toggleIssues.addEventListener('change', () => {
  issuePanel.style.display = toggleIssues.checked ? '' : 'none';
  renderMarkers();
  renderList();
});

// Configuração inicial
toggleIssues.checked = true;
issuePanel.style.display = '';
fetchIssues();
