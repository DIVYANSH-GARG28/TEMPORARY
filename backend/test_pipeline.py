import requests

# Get demo data
resp1 = requests.get('http://localhost:8000/api/pipeline/demo-data')
demo_data = resp1.json()
print(f"Loaded {len(demo_data)} demo records.")

# Test schema-detect
payload2 = {"data": demo_data}
resp2 = requests.post('http://localhost:8000/api/pipeline/schema-detect', json=payload2)
print("Schema Detect Status:", resp2.status_code)
mappings_list = resp2.json().get("mappings", [])

# Test normalize
mapping_dict = {m["source"]: m["canonical"] for m in mappings_list if m["canonical"]}
payload3 = {"data": demo_data, "mappings": mapping_dict}
resp3 = requests.post('http://localhost:8000/api/pipeline/normalize', json=payload3)
print("Normalize Status:", resp3.status_code)
normalized_data = resp3.json().get("normalized_data", [])

# Test validate
payload4 = {"normalized_data": normalized_data}
resp4 = requests.post('http://localhost:8000/api/pipeline/validate', json=payload4)
print("Validate Status:", resp4.status_code)
print("Validation Report:", resp4.json())

# Test commit
resp5 = requests.post('http://localhost:8000/api/pipeline/commit', json={})
print("Commit Status:", resp5.status_code)
