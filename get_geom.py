import requests, json
url = "http://overpass-api.de/api/interpreter"
q = "[out:json];way['building'](28.631,77.215,28.634,77.220);out geom 10;"
d = requests.post(url, data={'data':q}).json()
bldgs = []
for w in d.get('elements', []):
    if 'geometry' in w:
        pts = [[nd['lon'], nd['lat']] for nd in w['geometry']]
        if len(pts) >= 4: bldgs.append(pts)
with open("d:/SIH/bldgs.json", "w") as f: json.dump(bldgs[:6], f)
print("Saved to bldgs.json")
