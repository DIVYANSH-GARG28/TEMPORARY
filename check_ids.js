const axios = require('axios');
async function check() {
  try {
    const geoRes = await axios.get('http://localhost:8000/reconciliation/geojson');
    const geoIds = geoRes.data.features.map(f => f.properties.id);
    
    const queueRes = await axios.get('http://localhost:8000/audit/queue?status=PENDING_REVIEW&limit=10');
    const queueIds = (queueRes.data.items || queueRes.data).map(e => e.id);
    
    console.log("GeoJSON Feature IDs:", [...new Set(geoIds)].slice(0, 5));
    console.log("Queue Entity IDs:", queueIds.slice(0, 5));
    
    // Check overlap
    const overlap = queueIds.filter(id => geoIds.includes(id));
    console.log("Overlap count:", overlap.length);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
check();
