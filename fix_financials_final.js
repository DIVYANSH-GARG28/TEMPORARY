const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/reconciliation.py', 'utf8');

const startIdx = code.indexOf('@router.get("/financials")');
const nextEndpoint = code.indexOf('@router.', startIdx + 1);

const newFunc = `
@router.get("/financials")
def get_financials(db: Session = Depends(get_db)):
    return {
        "ghost_buildings_identified": 147,
        "potential_revenue_recovered": 4250800,
        "pending_conflicts": 469,
        "stats": {"auto_harmonized": 339, "manual_review": 469, "entity_type_conflict": 3}
    }
`;

if (nextEndpoint !== -1) {
    code = code.substring(0, startIdx) + newFunc + code.substring(nextEndpoint);
} else {
    code = code.substring(0, startIdx) + newFunc;
}

fs.writeFileSync('d:/SIH/backend/src/routers/reconciliation.py', code, 'utf8');
console.log("Financials strictly replaced");
