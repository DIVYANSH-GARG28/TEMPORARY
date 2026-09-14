import urllib.request
import urllib.parse
import json

# Tiny bounding box in Connaught Place (should be fast)
BOUNDS = "28.630, 77.217, 28.632, 77.219"

query = f"""
[out:json];
(
  way["building"]({BOUNDS});
);
(._;>;);
out body;
"""

endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.openstreetmap.ru/cgi/interpreter',
    'https://overpass-api.de/api/interpreter'
]

data = urllib.parse.urlencode({'data': query}).encode('utf-8')

success = False
for url in endpoints:
    print(f"Trying {url}...")
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'GeoSync-SIH/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                result = json.loads(response.read().decode('utf-8'))
                elements = result.get("elements", [])
                ways = [e for e in elements if e["type"] == "way"]
                print(f"Success! Fetched {len(ways)} buildings.")
                success = True
                break
            else:
                print('Failed:', response.status)
    except Exception as e:
        print('Error:', str(e))

if not success:
    print("All endpoints failed.")
