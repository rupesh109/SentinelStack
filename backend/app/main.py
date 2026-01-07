from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import jwt
import bcrypt
import os

print("=" * 50)
print("Starting SentinelStack Backend...")
print("=" * 50)

app = FastAPI(title="SentinelStack Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretjwtkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

fake_users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$zXUWvlnweaIklGCzfVXo9O1PtT8RNUTlFzMNQsTlS8pVY/o0MM1FS",
    }
}

def authenticate_user(username: str, password: str):
    user = fake_users_db.get(username)
    if not user:
        return None
    try:
        if bcrypt.checkpw(password.encode()[:72], user["hashed_password"].encode()):
            return user
    except:
        pass
    return None

def create_access_token(sub: str):
    payload = {
        "sub": sub,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@app.get("/")
def root():
    print("Root endpoint called")
    return {"message": "SentinelStack Backend", "status": "running"}

@app.get("/health")
def health():
    print("Health endpoint called")
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
def ready():
    print("Ready endpoint called")
    return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login endpoint called - username: {form_data.username}")
    
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        print(f"Authentication failed for: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(user["username"])
    print(f"Login successful for: {form_data.username}")
    
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/test")
def test():
    print("Test endpoint called")
    return {"message": "API test successful"}

print("\nRegistered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', set())
        print(f"  {route.path} - {methods}")
print("=" * 50)
