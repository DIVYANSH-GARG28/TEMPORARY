const query = `[out:json];(way["building"](28.612,77.207,28.615,77.211););(._;>;);out body;`;
fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    body: 'data=' + encodeURIComponent(query)
}).then(r => r.json()).then(data => {
    const nodes = {};
    data.elements.forEach(e => { if (e.type === 'node') nodes[e.id] = [e.lat, e.lon]; });
    const ways = data.elements.filter(e => e.type === 'way' && e.nodes).slice(0, 10);
    const polys = ways.map(way => ({
        tags: { building: way.tags.building || 'yes' },
        nodes: way.nodes.map(nid => nodes[nid]).filter(Boolean)
    }));
    require('fs').writeFileSync('polys.json', JSON.stringify(polys));
    console.log('Done, saved ' + polys.length + ' polygons');
}).catch(console.error);
