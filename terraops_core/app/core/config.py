from pydantic import BaseModel, ConfigDict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

class Settings(BaseModel):
    model_config = ConfigDict(extra='ignore')
    
    PROJECT_NAME: str = "TerraOps Core"
    API_V1_STR: str = "/api/v1"
    
    # EPSG Constraints
    EPSG_WGS84: int = 4326
    EPSG_UTM_Z43N: int = 32643
    
    # Statutory Thresholds
    STATUTORY_AREA_TOLERANCE_PCT: float = 0.005 # 0.5%
    POLSBY_POPPER_MIN_SCORE: float = 0.05       # Sliver prevention
    
settings = Settings()

# SlowAPI Rate Limiter
limiter = Limiter(key_func=get_remote_address)
