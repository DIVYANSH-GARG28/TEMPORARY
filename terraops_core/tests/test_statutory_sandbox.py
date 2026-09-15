import pytest
from app.services.simulation_sandbox import TopologyRepairSandbox, StatutoryViolationException
from shapely.geometry import Polygon

def test_polsby_popper_score():
    sandbox = TopologyRepairSandbox(db_session=None)
    
    # Perfect square: area = 100, perimeter = 40. PP = (4 * pi * 100) / 1600 = ~0.785
    square = Polygon([(0,0), (10,0), (10,10), (0,10)])
    pp_sq = sandbox._polsby_popper_score(square)
    assert 0.78 < pp_sq < 0.79
    
    # Thin sliver: 100x1 rect: area = 100, perimeter = 202. PP = (4 * pi * 100) / 40804 = ~0.03
    sliver = Polygon([(0,0), (100,0), (100,1), (0,1)])
    pp_sl = sandbox._polsby_popper_score(sliver)
    assert pp_sl < 0.05
