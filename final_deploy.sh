#!/bin/bash
set -e

echo "==================================="
echo "Final Backend Fix & Deployment"
echo "==================================="

# Update main.py
echo "Step 1: Updating main.py with fixed routes..."
cat > backend/app/main.py << 'MAINPY'
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from jose import jwt, JWTError
import bcrypt
import os
import time
from prometheus_client import Counter, Histogram, generate_latest
from starlette.responses import Response

app = FastAPI(
    title="SentinelStack Backend API",
    description="Production-grade FastAPI backend with JWT auth",
    version="1.0.0"
)

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
JWT_ISSUER = os.getenv("JWT_ISSUER", "sentinelstack")
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "sentinelstack-users")

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.labels(request.method, request.url.path, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, request.url.path).observe(time.time() - start_time)
    return response

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def safe_verify(password, hashed):
    try:
        return bcrypt.checkpw(password.encode()[:72], hashed.encode())
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

fake_users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": "$2b$12$zXUWvlnweaIklGCzfVXo9O1PtT8RNUTlFzMNQsTlS8pVY/o0MM1FS",
        "disabled": False,
    }
}

def authenticate_user(username, password):
    user = fake_users_db.get(username)
    if not user:
        return None
    if not safe_verify(password, user["hashed_password"]):
        return None
    return user

def create_access_token(sub: str):
    payload = {
        "sub": sub,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER
        )
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def root():
    return {
        "message": "SentinelStack Backend API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/ready")
def ready():
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"Login attempt for user: {form_data.username}")
    
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        print(f"Authentication failed for user: {form_data.username}")
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = create_access_token(user["username"])
    print(f"Login successful for user: {form_data.username}")
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/api/auth/me")
async def me(user: str = Depends(get_current_user)):
    return {
        "username": user,
        "authenticated": True
    }

@app.get("/api/users/me")
async def get_user_me(user: str = Depends(get_current_user)):
    return {
        "username": user,
        "authenticated": True
    }

@app.get("/api/debug/routes")
def list_routes():
    routes = []
    for route in app.routes:
        if hasattr(route, "methods"):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name
            })
    return {"routes": routes}
MAINPY

echo "✓ main.py updated"

# Build and push
echo ""
echo "Step 2: Building Docker image..."
docker build --no-cache -t sentinelstackaksacr.azurecr.io/backend:latest ./backend

echo ""
echo "Step 3: Pushing to ACR..."
docker push sentinelstackaksacr.azurecr.io/backend:latest

# Deploy
echo ""
echo "Step 4: Restarting backend pods..."
kubectl delete pods -n sentinelstack -l app=backend --force --grace-period=0
sleep 3
kubectl scale deployment sentinelstack-backend --replicas=2 -n sentinelstack

echo ""
echo "Step 5: Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n sentinelstack --timeout=120s || true

echo ""
echo "Step 6: Checking pod status..."
kubectl get pods -n sentinelstack -l app=backend

echo ""
echo "Step 7: Testing endpoints..."

echo ""
echo "Test 1: Check available routes"
kubectl run test-routes --image=curlimages/curl:latest --rm -i --restart=Never -n sentinelstack -- \
  curl -s http://backend-service:8000/api/debug/routes | head -50

echo ""
echo "Test 2: Login from inside cluster"
kubectl run test-login-final --image=curlimages/curl:latest --rm -i --restart=Never -n sentinelstack -- \
  curl -s -X POST http://backend-service:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

echo ""
echo "Test 3: Login via external IP"
curl -s -X POST http://51.8.34.154/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

echo ""
echo "==================================="
echo "✅ Deployment Complete!"
echo "==================================="
echo ""
echo "Your endpoints:"
echo "  Frontend: http://51.8.34.154/"
echo "  Health: http://51.8.34.154/health"
echo "  Login: http://51.8.34.154/api/auth/login"
echo ""
echo "Test login with:"
echo "  curl -X POST http://51.8.34.154/api/auth/login \\"
echo "    -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "    -d 'username=admin&password=admin123'"
