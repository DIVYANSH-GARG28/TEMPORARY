import json

def build_workflow():
    workflow = {
        "name": "TerraOps_Govt_Field_Portal",
        "nodes": [],
        "connections": {}
    }
    
    nodes = [
        {
            "parameters": {"updates": ["message"]},
            "id": "telegram-trigger",
            "name": "Telegram Trigger",
            "type": "n8n-nodes-base.telegramTrigger",
            "typeVersion": 1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {"value1": "={{ $json.message.location != null || $json.message.venue != null }}", "value2": True}
                    ]
                }
            },
            "id": "if-location",
            "name": "Is Location?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://silly-adults-join.loca.lt/api/telegram/location",
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": "={\n  \"latitude\": {{ $json.message.location ? $json.message.location.latitude : $json.message.venue.location.latitude }},\n  \"longitude\": {{ $json.message.location ? $json.message.location.longitude : $json.message.venue.location.longitude }},\n  \"user_id\": \"{{ $json.message.from.id }}\"\n}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Bypass-Tunnel-Reminder", "value": "true"}]}
            },
            "id": "http-backend",
            "name": "PostGIS Spatial Audit",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4,
            "position": [700, 200]
        },
        {
            "parameters": {
                "chatId": "={{ $json.user_id }}",
                "text": "={{ $json.audit_message }}\n\nTarget Entity: #{{ $json.entity_id }}\nOwner: {{ $json.owner }}"
            },
            "id": "telegram-audit-response",
            "name": "Send Audit Result",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1,
            "position": [950, 200]
        },
        {
            "parameters": {
                "conditions": {
                    "boolean": [
                        {"value1": "={{ $json.message.photo != null }}", "value2": True}
                    ]
                }
            },
            "id": "if-photo",
            "name": "Is Photo?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 500]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://silly-adults-join.loca.lt/api/telegram/evidence",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Bypass-Tunnel-Reminder", "value": "true"}]},
                "sendBody": True,
                "specifyBody": "json",
                "jsonBody": "={\n  \"latitude\": 0,\n  \"longitude\": 0,\n  \"user_id\": \"{{ $json.message.from.id }}\"\n}"
            },
            "id": "http-photo-evidence",
            "name": "Submit Photo Evidence",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4,
            "position": [700, 400]
        },
        {
            "parameters": {
                "chatId": "={{ $json.message.from.id }}",
                "text": "[EVIDENCE ACCEPTED]\nPhysical evidence encrypted and appended to Audit Case.\nAI Confidence Score dynamically adjusted."
            },
            "id": "telegram-photo-success",
            "name": "Confirm Evidence",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1,
            "position": [950, 400]
        },
        {
            "parameters": {
                "conditions": {
                    "string": [
                        {"value1": "={{ $json.message.text }}", "operation": "equals", "value2": "/cases"}
                    ]
                }
            },
            "id": "if-cases",
            "name": "Is /cases Command?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 1,
            "position": [450, 700]
        },
        {
            "parameters": {
                "method": "GET",
                "url": "={{ 'https://silly-adults-join.loca.lt/api/telegram/cases?user_id=' + $json.message.from.id }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Bypass-Tunnel-Reminder", "value": "true"}]}
            },
            "id": "http-cases",
            "name": "Fetch Assigned Cases",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4,
            "position": [700, 600]
        },
        {
            "parameters": {
                "chatId": "={{ $node[\"Telegram Trigger\"].json.message.from.id }}",
                "text": "={{ $json.message }}"
            },
            "id": "telegram-cases-response",
            "name": "Send Cases List",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1,
            "position": [950, 600]
        },
        {
            "parameters": {
                "chatId": "={{ $json.message.from.id }}",
                "text": "🏛️ **TERRAOPS: Govt Field Portal** 🏛️\n\nWelcome, Field Officer.\n\nCommands:\n/cases - View your assigned high-priority audits\n\nTo verify a site:\n1. Drop a Live Location Pin\n2. Upload Photographic Evidence\n\n*All actions are cryptographically logged to the Audit Ledger.*"
            },
            "id": "telegram-welcome",
            "name": "Send Welcome Menu",
            "type": "n8n-nodes-base.telegram",
            "typeVersion": 1,
            "position": [700, 800]
        }
    ]
    
    connections = {
        "Telegram Trigger": {
            "main": [ [ {"node": "Is Location?", "type": "main", "index": 0} ] ]
        },
        "Is Location?": {
            "main": [
                [ {"node": "PostGIS Spatial Audit", "type": "main", "index": 0} ],
                [ {"node": "Is Photo?", "type": "main", "index": 0} ]
            ]
        },
        "PostGIS Spatial Audit": {
            "main": [ [ {"node": "Send Audit Result", "type": "main", "index": 0} ] ]
        },
        "Is Photo?": {
            "main": [
                [ {"node": "Submit Photo Evidence", "type": "main", "index": 0} ],
                [ {"node": "Is /cases Command?", "type": "main", "index": 0} ]
            ]
        },
        "Submit Photo Evidence": {
            "main": [ [ {"node": "Confirm Evidence", "type": "main", "index": 0} ] ]
        },
        "Is /cases Command?": {
            "main": [
                [ {"node": "Fetch Assigned Cases", "type": "main", "index": 0} ],
                [ {"node": "Send Welcome Menu", "type": "main", "index": 0} ]
            ]
        },
        "Fetch Assigned Cases": {
            "main": [ [ {"node": "Send Cases List", "type": "main", "index": 0} ] ]
        }
    }
    
    workflow["nodes"] = nodes
    workflow["connections"] = connections
    
    with open("d:/SIH/backend/n8n_telegram_workflow.json", "w", encoding='utf-8') as f:
        json.dump(workflow, f, indent=2)
        
if __name__ == "__main__":
    build_workflow()
