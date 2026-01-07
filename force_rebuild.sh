#!/bin/bash

echo "==================================="
echo "Frontend Login Flow Check"
echo "==================================="

# Check frontend logs
echo "1. Checking frontend pod logs..."
kubectl logs -l app=frontend -n sentinelstack --tail=50

# Check if frontend can reach backend
echo ""
echo "2. Testing backend connectivity from frontend pod..."
FRONTEND_POD=$(kubectl get pods -n sentinelstack -l app=frontend -o jsonpath='{.items[0].metadata.name}')
kubectl exec $FRONTEND_POD -n sentinelstack -- sh -c "
  apk add curl 2>/dev/null || true
  curl -s http://backend-service:8000/health
" || echo "Could not test from frontend pod"

# Check the frontend source to see login handling
echo ""
echo "3. Checking frontend src files..."
kubectl exec $FRONTEND_POD -n sentinelstack -- ls -la /usr/share/nginx/html/static/js/ 2>/dev/null || \
kubectl exec $FRONTEND_POD -n sentinelstack -- ls -la /usr/share/nginx/html/

echo ""
echo "4. Testing login via browser console (open browser dev tools and run):"
echo "
fetch('http://51.8.34.154/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: 'username=admin&password=admin123'
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  localStorage.setItem('token', data.access_token);
  console.log('Token saved:', localStorage.getItem('token'));
})
.catch(e => console.error('Error:', e));
"

echo ""
echo "==================================="
