const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const newDemoDataFunc = `
def generate_messy_demo_data():
    return [
        {"KHATEDAR_NAME": "M/S Aggarwal Traders Pvt Ltd", "SURVEY_NO": "SVY-2023-A1", "AREA_SQM": "145.2", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-01-15", "LAND_USE": "Commercial"},
        {"KHATEDAR_NAME": "Delhi Properties Council", "SURVEY_NO": "SVY-2023-B2", "AREA_SQM": "210.5", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2022-11-20", "LAND_USE": "Residential"},
        {"KHATEDAR_NAME": "Sri Balaji Enclave Trust", "SURVEY_NO": "SVY-2023-C3", "AREA_SQM": "189.0", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-04-10", "LAND_USE": "Commercial"},
        {"KHATEDAR_NAME": "Rajiv Kumar & Sons", "SURVEY_NO": "SVY-2023-D4", "AREA_SQM": "95.5", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-02-28", "LAND_USE": "Residential"},
        {"KHATEDAR_NAME": "New Delhi Municipal Corp", "SURVEY_NO": "SVY-2023-E5", "AREA_SQM": "320.1", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2022-09-05", "LAND_USE": "Commercial"},
        {"KHATEDAR_NAME": "Kapoor Hospitality Ventures", "SURVEY_NO": "SVY-2023-F6", "AREA_SQM": "175.8", "VILLAGE": "Connaught Place", "LAST_TAX_PAID": "2023-05-12", "LAND_USE": "Residential"}
    ]
`;

code = code.replace(
  /def generate_messy_demo_data\(\):[\s\S]*?(?=@router\.get\("\/demo-data"\))/,
  newDemoDataFunc + "\n"
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("demo-data endpoint fixed with realistic names");
