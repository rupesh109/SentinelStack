from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest
from starlette.responses import Response
import time
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

app = FastAPI(
    title="SentinelStack Backend API",
    description="Production-grade FastAPI backend with JWT auth",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing with truncation wrapper
# Password hashing - use bcrypt directly to avoid passlib issues
import bcrypt
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def safe_hash(password: str) -> str:
    """Hash password with bcrypt, truncating to 72 bytes"""
    # Truncate to 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def safe_verify(password: str, hashed_password: str) -> bool:
    """Verify password with bcrypt, truncating to 72 bytes"""
    try:
        # Truncate to 72 bytes
        password_bytes = password.encode('utf-8')[:72]
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False
# Pydantic models
class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

# Mock database (replace with real database in production)
# Mock database (replace with real database in production)
# Use a pre-hashed password to avoid hashing during module import
# Mock database (replace with real database in production)

# Using pre-hashed password to avoid bcrypt initialization issues
# Mock database with pre-computed hash
fake_users_db = {
    "admin": {
        "username": "admin",
        "full_name": "Admin User",
        "email": "admin@sentinelstack.com",
        # Pre-computed bcrypt hash of "admin123"
        "hashed_password": "$2b$12$zXUWvlnweaIklGCzfVXo9O1PtT8RNUTlFzMNQsTlS8pVY/o0MM1FS",
        "disabled": False,
    }
}
# Utility functions
def verify_password(plain_password, hashed_password):
    return safe_verify(plain_password, hashed_password)

def get_password_hash(password):
    return safe_hash(password)
def get_user(username: str):
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return UserInDB(**user_dict)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Middleware for metrics
@app.middleware("http")
async def metrics_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

# Routes
@app.get("/")
async def root():
    return {
        "message": "SentinelStack Backend API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/ready")
async def readiness_check():
    # Add database/redis connection checks here
    return {"status": "ready"}

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/data")
async def get_data(current_user: User = Depends(get_current_active_user)):
    return {
        "user": current_user.username,
        "data": "This is protected data",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
