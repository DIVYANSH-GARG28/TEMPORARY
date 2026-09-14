import urllib.request
import urllib.parse
import json

query = """
[out:json];
// Connaught Place bounding box (approximate)
(
  way["building"](28.625, 77.21, 28.635, 77.225);
);
out body;
>;
out skel qt;
"""

print("Fetching OSM data for Connaught Place, New Delhi...")
url = 'https://overpass-api.de/api/interpreter'
data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request(url, data=data)

try:
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            elements = data.get("elements", [])
            print(f"Fetched {len(elements)} elements.")
            ways = [e for e in elements if e["type"] == "way"]
            print(f"Found {len(ways)} building footprints.")
        else:
            print('Failed:', response.status)
except Exception as e:
    print('Error:', str(e))
