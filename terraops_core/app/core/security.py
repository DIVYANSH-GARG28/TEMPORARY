import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext

# ---------------------------------------------------------
# Cryptographic Keys (Dummy setup for testing)
# In production, these must be injected securely.
# ---------------------------------------------------------
SECRET_KEY = "dummy-symmetric-key-for-testing-only"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Telegram / n8n Webhook Secret (Dummy)
WEBHOOK_SECRET = "dummy-webhook-secret-key-1234"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], roles: list[str], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode = {"exp": expire, "sub": str(subject), "roles": roles}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_webhook_signature(payload_body: bytes, signature_header: str) -> bool:
    """
    Verifies HMAC-SHA256 signature for webhooks from n8n or Telegram.
    """
    if not signature_header:
        return False
        
    expected_mac = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_mac, signature_header)
