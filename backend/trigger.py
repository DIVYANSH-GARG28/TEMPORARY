import urllib.request, json
req = urllib.request.Request('http://localhost:8000/api/ingest/area', 
    data=b'{"min_lat":28.61,"min_lon":77.20,"max_lat":28.62,"max_lon":77.21}',
    headers={'X-API-Key':'sih-demo-key', 'Content-Type':'application/json'},
    method='POST')
print(urllib.request.urlopen(req).read().decode())
req2 = urllib.request.Request('http://localhost:8000/api/reconciliation/trigger', data=b'', method='POST')
print(urllib.request.urlopen(req2).read().decode())
