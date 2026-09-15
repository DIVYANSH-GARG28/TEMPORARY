import networkx as nx

class ActiveLearningGraphOptimizer:
    def __init__(self):
        pass

    def prioritize_field_missions(self, parcels: list[dict], k_missions: int = 5) -> list[dict]:
        """
        Builds a planar graph of ambiguous parcels and calculates Information Gain Value (IGV) 
        to prioritize GNSS field survey missions.
        
        Args:
            parcels: List of dicts representing parcels. Each dict must contain:
                     - id: parcel ID
                     - confidence_score: float (0.0 to 1.0) representing confidence of the AI match
                     - boundary_vertices: list of (x,y) tuples for the parcel polygon
        """
        G = nx.Graph()
        
        # 1. Build planar graph where nodes are vertices and edges are parcel boundaries
        vertex_to_parcels = {}
        
        for p in parcels:
            pid = p['id']
            conf = p['confidence_score']
            vertices = p['boundary_vertices']
            
            for v in vertices:
                if v not in vertex_to_parcels:
                    vertex_to_parcels[v] = []
                vertex_to_parcels[v].append({'id': pid, 'conf': conf})
                
                # Add node
                if not G.has_node(v):
                    G.add_node(v)
            
            # Add edges for this parcel's boundary
            for i in range(len(vertices)):
                v1 = vertices[i]
                v2 = vertices[(i + 1) % len(vertices)]
                if v1 != v2:
                    G.add_edge(v1, v2)
                    
        # 2. Calculate Information Gain Value (IGV) for each vertex
        # IGV(v) = Sum_{p in adjacent_parcels(v)} (1.0 - confidence_score(p)) * Degree(v)
        node_igvs = []
        
        for node in G.nodes():
            degree = G.degree(node)
            adj_parcels = vertex_to_parcels.get(node, [])
            
            igv_sum = sum((1.0 - p['conf']) for p in adj_parcels)
            igv = igv_sum * degree
            
            node_igvs.append({
                "coordinate": node,
                "igv": igv,
                "degree": degree,
                "adjacent_parcels": [p['id'] for p in adj_parcels]
            })
            
        # 3. Sort by IGV descending
        node_igvs.sort(key=lambda x: x['igv'], reverse=True)
        
        # 4. Return Top-K
        return node_igvs[:k_missions]
