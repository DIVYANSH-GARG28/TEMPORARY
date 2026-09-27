import requests
import json

overpass_url = "http://overpass-api.de/api/interpreter"
query = """
[out:json];
area["name"="New Delhi"]->.searchArea;
(
  way["building"](28.631,77.215,28.634,77.220);
);
out geom 6;
"""
response = requests.post(overpass_url, data={'data': query})
data = response.json()

buildings = []
for el in data['elements']:
    if el['type'] == 'way':
        pts = []
        for nd in el['geometry']:
            pts.append([nd['lon'], nd['lat']])
        buildings.append(pts)

print(json.dumps(buildings))
