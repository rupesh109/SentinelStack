#!/bin/bash

echo "==================================="
echo "SentinelStack Diagnostics"
echo "==================================="

echo ""
echo "1. Checking all pods in sentinelstack namespace:"
kubectl get pods -n sentinelstack -o wide

echo ""
echo "2. Checking all services:"
kubectl get svc -n sentinelstack

echo ""
echo "3. Checking ingress configuration:"
kubectl get ingress -n sentinelstack -o yaml

echo ""
echo "4. Checking backend deployment details:"
kubectl describe deployment sentinelstack-backend -n sentinelstack | grep -A 10 "Image:"

echo ""
echo "5. Checking if backend-service exists and its endpoints:"
kubectl get endpoints backend-service -n sentinelstack

echo ""
echo "6. Checking recent backend pod logs (if any running):"
BACKEND_POD=$(kubectl get pods -n sentinelstack -l app=backend --field-selector=status.phase=Running -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ ! -z "$BACKEND_POD" ]; then
    echo "Found running pod: $BACKEND_POD"
    kubectl logs $BACKEND_POD -n sentinelstack --tail=30
else
    echo "No running backend pods found"
    echo "Checking most recent pod logs:"
    kubectl logs -l app=backend -n sentinelstack --tail=30 2>&1 | head -50
fi

echo ""
echo "7. Testing internal DNS resolution:"
kubectl run test-dns --image=busybox:1.28 --rm -i --restart=Never -n sentinelstack -- nslookup backend-service

echo ""
echo "8. Checking ConfigMaps and Secrets:"
kubectl get configmap -n sentinelstack
kubectl get secrets -n sentinelstack

echo ""
echo "==================================="
echo "Diagnostic Complete"
echo "==================================="
