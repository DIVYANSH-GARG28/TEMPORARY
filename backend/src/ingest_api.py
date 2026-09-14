import requests

def upload_dataset(file_path, name, source_type):
    url = "http://localhost:8000/api/datasets/"
    with open(file_path, 'rb') as f:
        files = {'file': (file_path, f, 'application/json')}
        data = {'name': name, 'source_type': source_type, 'version': '1.0'}
        response = requests.post(url, files=files, data=data)
        
    if response.status_code == 200:
        print(f"Successfully uploaded {name} ({source_type})")
    else:
        print(f"Failed to upload {name}: {response.text}")

if __name__ == "__main__":
    upload_dataset("cadastral.geojson", "Delhi Cadastral Survey 2024", "cadastral")
    upload_dataset("municipal.geojson", "Delhi Municipal Tax Records", "municipal")
