

# 🛡️ SentinelStack - Enterprise DevSecOps Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/rupesh109/SentinelStack)](https://github.com/rupesh109/SentinelStack/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/rupesh109/SentinelStack)](https://github.com/rupesh109/SentinelStack/issues)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/rupesh-kumar-jha-b04b2119b/)
> Production-grade microservices platform demonstrating enterprise DevSecOps practices with Zero Trust architecture, automated security scanning, and comprehensive observability on Azure Kubernetes Service.


## 🎯 Project Overview

SentinelStack is a cloud-native application platform showcasing industry-standard DevSecOps practices including:

- **Zero Trust Security**: Network segmentation with Kubernetes NetworkPolicies
- **Automated CI/CD**: Multi-stage pipelines with security gates and canary deployments
- **Container Security**: Image scanning, runtime threat detection, and least-privilege execution
- **Infrastructure as Code**: Fully automated Azure infrastructure provisioning
- **Observability**: Comprehensive monitoring, logging, and alerting with Prometheus/Grafana

### Business Context
This platform enables organizations to:
- Deploy microservices with enterprise-grade security controls
- Automate security scanning throughout the SDLC
- Implement zero-trust networking in Kubernetes
- Achieve compliance requirements (SOC2, ISO 27001)
- Reduce deployment time from hours to minutes

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Material-UI components
- JWT authentication
- NGINX reverse proxy

**Backend**
- FastAPI (Python 3.11)
- PostgreSQL 15
- Redis for caching
- Prometheus metrics

**Infrastructure**
- Azure Kubernetes Service (AKS)
- Azure Container Registry
- Terraform for IaC
- Helm for package management

**Security & DevOps**
- GitHub Actions CI/CD
- Trivy container scanning
- Falco runtime security
- Prometheus + Grafana monitoring
- Snyk/Bandit SAST scanning

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Actions                      │
│  (CI/CD: Build → Test → Scan → Deploy → Verify)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Azure Container Registry                   │
│         (Scanned images with Trivy)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Azure Kubernetes Service (AKS)              │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Zero Trust Network (NetworkPolicies)    │    │
│  │  ┌──────────────┐         ┌──────────────┐      │    │
│  │  │   Frontend   │◄────────┤   Ingress    │      │    │
│  │  │   (React)    │         │   (NGINX)    │      │    │
│  │  └──────┬───────┘         └──────────────┘      │    │
│  │         │                                       │    │
│  │         ▼                                       │    │
│  │  ┌──────────────┐                               │    │
│  │  │   Backend    │                               │    │
│  │  │  (FastAPI)   │                               │    │
│  │  └──────┬───────┘                               │    │
│  │         │                                       │    │
│  │         ▼                                       │    │
│  │  ┌──────────────┐    ┌──────────────┐           │    │
│  │  │  PostgreSQL  │    │    Redis     │           │    │
│  │  └──────────────┘    └──────────────┘           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │      Monitoring & Security Layer                │    │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐   │    │
│  │  │ Prometheus │  │  Grafana   │  │  Falco   │   │    │
│  │  └────────────┘  └────────────┘  └──────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Azure subscription with contributor access
- kubectl, Helm, Terraform installed
- Docker for local development
- GitHub account

### 1. Clone Repository
```bash
git clone https://github.com/rupesh109/sentinelstack.git
cd sentinelstack
```

### 2. Configure Azure Credentials
```bash
az login
az ad sp create-for-rbac --name sentinelstack-sp --role Contributor
```

### 3. Set GitHub Secrets
Add these secrets to your repository:
- `AZURE_CREDENTIALS`, `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`
- `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`
- `ACR_USERNAME`, `ACR_PASSWORD`

### 4. Deploy Infrastructure
```bash
cd terraform/
terraform init
terraform apply
```

### 5. Deploy Applications
```bash
# Get AKS credentials
az aks get-credentials --resource-group sentinelstack-rg --name sentinelstack-aks

# Deploy with Helm
helm install backend ./helm/backend --namespace sentinelstack
helm install frontend ./helm/frontend --namespace sentinelstack
```

### 6. Access Application
```bash
kubectl get svc -n sentinelstack
# Navigate to frontend LoadBalancer IP
```

## 🔒 Security Features

### 1. **Zero Trust Network Architecture**
- NetworkPolicies enforce least-privilege communication
- Pods can only communicate with explicitly allowed services
- Ingress traffic filtered through NGINX with rate limiting

### 2. **Container Security**
- Multi-stage Docker builds minimize attack surface
- Non-root user execution (UID 1000)
- Read-only root filesystem where possible
- Security context constraints enforced

### 3. **Runtime Security**
- Falco monitors for suspicious activity
- Alerts on privilege escalation, file modifications
- Integration with SIEM systems

### 4. **CI/CD Security Gates**
- SAST scanning (Snyk, Bandit)
- Container image scanning (Trivy)
- Dependency vulnerability checks
- Failed scans block deployment

### 5. **Secrets Management**
- Kubernetes Secrets for sensitive data
- Azure Key Vault integration (optional)
- No hardcoded credentials

## 📊 Monitoring & Observability

### Metrics Collection
- **Application metrics**: Custom Prometheus metrics from FastAPI
- **Infrastructure metrics**: Node, pod, container resource usage
- **Business metrics**: Request latency, error rates, throughput

### Alerting Rules
```yaml
- High CPU usage (>80% for 5 minutes)
- High memory usage (>90%)
- Pod restart frequency
- HTTP error rate >5%
- Database connection failures
```

### Dashboards
- **Application Performance**: Request rates, latencies, error rates
- **Infrastructure Health**: Node metrics, pod status, resource utilization
- **Security Overview**: Falco alerts, failed authentication attempts

## 🔄 CI/CD Pipeline

### Pipeline Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Code    │──▶│  Test &  │──▶│ Security │──▶│  Build   │
│  Quality │   │ Coverage │   │  Scan    │   │  Image   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                    │
                                                    ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Verify  │◀──│  Deploy  │◀──│  Canary  │◀──│  Image   │
│  & Alert │   │Production│   │  Deploy  │   │  Scan    │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Deployment Strategy
1. **Canary Deployment**: 10% traffic to new version
2. **Health Checks**: Automated smoke tests
3. **Progressive Rollout**: Gradual increase to 100%
4. **Automatic Rollback**: On failure detection

### Security Gates
- ❌ Critical/High vulnerabilities → Deployment blocked
- ⚠️  Medium vulnerabilities → Warning, deployment continues
- ✅ Low vulnerabilities → Tracked, deployment continues

## 📁 Project Structure

```
sentinelstack/
├── frontend/                 # React application
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                  # FastAPI application
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
├── terraform/                # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── kubernetes/               # K8s manifests
│   ├── namespaces/
│   ├── network-policies/
│   ├── configmaps/
│   └── database/
├── helm/                     # Helm charts
│   ├── frontend/
│   └── backend/
├── .github/workflows/        # CI/CD pipelines
│   ├── frontend-ci-cd.yml
│   ├── backend-ci-cd.yml
│   └── terraform-apply.yml
├── monitoring/               # Observability configs
│   ├── prometheus/
│   └── grafana/
├── security/                 # Security configs
│   ├── falco-rules/
│   └── trivy/
└── docs/                     # Documentation
    ├── DEPLOYMENT.md
    ├── ARCHITECTURE.md
    └── SECURITY.md
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend/
npm test -- --coverage
```

### Backend Tests
```bash
cd backend/
pytest --cov=app --cov-report=html
```

### Integration Tests
```bash
# Deploy to test environment
helm test backend -n sentinelstack
helm test frontend -n sentinelstack
```

## 📈 Performance Metrics

### Application Performance
- **Average Response Time**: <100ms (p95)
- **Throughput**: 1000 req/sec
- **Availability**: 99.9% uptime

### Resource Utilization
- **Frontend**: 100m CPU, 128Mi RAM per pod
- **Backend**: 200m CPU, 256Mi RAM per pod
- **Auto-scaling**: 2-10 replicas based on CPU/memory


## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 📧 Contact

**Rupesh Kumar Jha**  
- LinkedIn: [Rupesh Kumar Jha](https://www.linkedin.com/in/rupesh-kumar-jha-b04b2119b/)
- Discord: rupesh0380  
- GitHub: [@rupesh109](https://github.com/rupesh109)

Project Link: [https://github.com/rupesh109/SentinelStack](https://github.com/rupesh109/SentinelStack)

---

## 🎓 Learning Resources

- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [OWASP Container Security](https://owasp.org/www-project-docker-top-10/)
- [Azure AKS Documentation](https://learn.microsoft.com/azure/aks/)
- [GitOps with Helm](https://helm.sh/docs/)

