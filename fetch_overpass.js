const https = require('https');
const fs = require('fs');

const query = `[out:json];
way["building"](28.630,77.215,28.635,77.225);
out geom;`;

const options = {
  hostname: 'overpass-api.de',
  port: 443,
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      let bldgs = [];
      for(let w of json.elements) {
        if(w.geometry && w.geometry.length > 5) {
            let pts = w.geometry.map(nd => [nd.lon, nd.lat]);
            bldgs.push(pts);
        }
      }
      fs.writeFileSync('d:/SIH/bldgs.json', JSON.stringify(bldgs));
      console.log(`Saved ${bldgs.length} buildings`);
    } catch(e) {
      console.error(e);
    }
  });
});

req.write('data=' + encodeURIComponent(query));
req.end();
