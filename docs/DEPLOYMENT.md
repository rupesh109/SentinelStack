# SentinelStack Deployment Guide

## Prerequisites

- Azure CLI installed and configured
- kubectl installed
- Helm 3.x installed
- Terraform 1.6+ installed
- Docker installed (for local testing)
- GitHub account with secrets configured

## Step 1: Configure Azure Credentials
```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Create service principal for Terraform
az ad sp create-for-rbac \
  --name "sentinelstack-terraform" \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

Save the output - you'll need these values for GitHub secrets.

## Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `AZURE_CREDENTIALS` - Full JSON output from service principal creation
- `ARM_CLIENT_ID` - Application (client) ID
- `ARM_CLIENT_SECRET` - Client secret
- `ARM_SUBSCRIPTION_ID` - Your Azure subscription ID
- `ARM_TENANT_ID` - Directory (tenant) ID
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password

## Step 3: Deploy Infrastructure with Terraform
```bash
# Navigate to terraform directory
cd terraform/

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- Resource Group
- Virtual Network
- AKS Cluster
- Azure Container Registry
- Log Analytics Workspace
- Network Security Group

## Step 4: Configure kubectl
```bash
# Get AKS credentials
az aks get-credentials \
  --resource-group sentinelstack-rg \
  --name sentinelstack-aks

# Verify connection
kubectl get nodes
```

## Step 5: Deploy Kubernetes Resources
```bash
# Create namespace
kubectl apply -f kubernetes/namespaces/sentinelstack.yaml

# Apply network policies (Zero Trust)
kubectl apply -f kubernetes/network-policies/

# Create ConfigMaps and Secrets
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/secrets/

# Deploy databases
kubectl apply -f kubernetes/database/postgresql-deployment.yaml
kubectl apply -f kubernetes/database/redis-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgresql -n sentinelstack --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n sentinelstack --timeout=300s
```

## Step 6: Deploy Applications with Helm
```bash
# Deploy backend
helm install backend ./helm/backend \
  --namespace sentinelstack \
  --set image.repository=sentinelstackacr.azurecr.io/backend \
  --set image.tag=latest

# Deploy frontend
helm install frontend ./helm/frontend \
  --namespace sentinelstack \
  --set image.repository=sentinelstackacr.azurecr.io/frontend \
  --set image.tag=latest

# Verify deployments
kubectl get pods -n sentinelstack
kubectl get svc -n sentinelstack
```

## Step 7: Deploy Monitoring Stack
```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus/values.yaml

# Install Grafana (included in kube-prometheus-stack)
# Access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

## Step 8: Deploy Security Tools
```bash
# Install Falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update

helm install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace \
  --set falco.rules_file[0]=/etc/falco/rules.d/custom-rules.yaml \
  --set-file customRules.custom-rules\\.yaml=security/falco-rules/custom-rules.yaml
```

## Step 9: Configure Ingress & DNS
```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Get external IP
kubectl get svc -n ingress-nginx

# Update DNS records to point to this IP
```

## Step 10: Enable CI/CD

Push code to GitHub - CI/CD pipelines will automatically:
1. Run tests
2. Security scans
3. Build Docker images
4. Scan images with Trivy
5. Deploy to AKS with canary strategy
6. Rollback on failure

## Verification
```bash
# Check all pods are running
kubectl get pods -n sentinelstack

# Check services
kubectl get svc -n sentinelstack

# Check ingress
kubectl get ingress -n sentinelstack

# View logs
kubectl logs -f -l app=backend -n sentinelstack
kubectl logs -f -l app=frontend -n sentinelstack

# Check metrics
kubectl port-forward -n sentinelstack svc/backend-service 8000:8000
curl http://localhost:8000/metrics
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n sentinelstack
kubectl logs <pod-name> -n sentinelstack
```

### Network policy issues
```bash
kubectl get networkpolicies -n sentinelstack
kubectl describe networkpolicy <policy-name> -n sentinelstack
```

### Image pull errors
```bash
# Verify ACR access
az acr login --name sentinelstackacr

# Check image exists
az acr repository list --name sentinelstackacr
```

## Cleanup
```bash
# Delete Helm releases
helm uninstall frontend -n sentinelstack
helm uninstall backend -n sentinelstack

# Delete Kubernetes resources
kubectl delete namespace sentinelstack

# Destroy infrastructure
cd terraform/
terraform destroy
```
