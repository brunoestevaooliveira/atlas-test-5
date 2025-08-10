// Initialize a Leaflet map centered on Santa Maria-DF with a reasonable zoom level.
const map = L.map('map').setView([-15.9, -47.95], 13);

// Use the OpenStreetMap tile layer. You can replace this with your own
// provider if desired. The maxZoom ensures the map doesn’t zoom in too far.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Fetch recent issues from the API and add them as markers on the map.
async function loadIssues() {
  try {
    const res = await fetch('/api/issues');
    if (!res.ok) throw new Error('Erro ao buscar ocorrências');
    const issues = await res.json();
    issues.forEach((issue) => {
      const marker = L.marker([issue.lat, issue.lng]).addTo(map);
      const cat = issue.category_name || '';
      marker.bindPopup(
        `<b>${issue.title}</b><br />${cat}<br />Status: ${issue.status}`
      );
    });
  } catch (err) {
    console.error(err);
  }
}

loadIssues();