import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://localhost:8000/api/ingest/area',
    data=json.dumps({'min_lat': 28.63, 'min_lon': 77.21, 'max_lat': 28.631, 'max_lon': 77.211}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    print(urllib.request.urlopen(req).read())
except urllib.error.HTTPError as e:
    print(e.read())
