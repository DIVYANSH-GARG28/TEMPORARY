const fs = require('fs');
let code = fs.readFileSync('d:/SIH/backend/src/routers/pipeline.py', 'utf8');

const newGeomCode = `
    for b in buildings:
        x, y = transformer.transform(b['lon'], b['lat'])
        # Create a highly realistic angled rectangular building (4 points)
        # We define a rectangle and rotate it slightly
        import math
        angle = random.uniform(-0.3, 0.3) # Slight rotation
        w, h = 18.0, 24.0 # 36x48 meters approx
        
        def rot(px, py, a):
            return x + px*math.cos(a) - py*math.sin(a), y + px*math.sin(a) + py*math.cos(a)
            
        pts = [
            rot(-w, -h, angle),
            rot(w, -h, angle),
            rot(w, h, angle),
            rot(-w, h, angle),
            rot(-w, -h, angle) # close
        ]
        cad_pts_str = ", ".join([f"{px} {py}" for px, py in pts])
        poly_cad = f"SRID=3857;POLYGON(({cad_pts_str}))"
        
        # Municipal is slightly shifted (simulate legacy map error)
        shift_x, shift_y = random.uniform(3.0, 7.0), random.uniform(-6.0, 2.0)
        mun_pts = [
            (px + shift_x, py + shift_y) for px, py in pts
        ]
        mun_pts_str = ", ".join([f"{px} {py}" for px, py in mun_pts])
        poly_mun = f"SRID=3857;POLYGON(({mun_pts_str}))"
`;

code = code.replace(
  /    for b in buildings:\n        x, y = transformer\.transform[\s\S]*?poly_mun = f"SRID=3857;POLYGON\(\(\{mun_pts\}\)\)"/,
  newGeomCode
);

fs.writeFileSync('d:/SIH/backend/src/routers/pipeline.py', code, 'utf8');
console.log("Geometry fixed to clean angled rectangles");
