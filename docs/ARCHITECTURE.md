# SentinelStack Architecture Documentation

## System Architecture Overview

SentinelStack follows a **microservices architecture** pattern deployed on Azure Kubernetes Service (AKS) with a focus on security, scalability, and observability.

### Design Principles

1. **Security by Default**: Zero-trust networking, least-privilege access
2. **Infrastructure as Code**: All infrastructure versioned and automated
3. **Immutable Infrastructure**: Container-based deployments, no SSH access
4. **Observability First**: Comprehensive monitoring and logging
5. **Fail-Safe Deployments**: Canary releases with automatic rollback

---

## Component Architecture

### 1. Frontend Layer

**Technology**: React 18 + TypeScript + Material-UI

**Responsibilities**:
- User interface rendering
- Client-side routing
- JWT token management
- API communication

**Security Controls**:
- Content Security Policy headers
- XSS protection
- CSRF token validation
- Secure cookie handling

**Deployment**:
- NGINX reverse proxy
- Multi-stage Docker build
- Non-root user (nginx:nginx)
- Read-only root filesystem

---

### 2. Backend Layer

**Technology**: FastAPI (Python 3.11) + SQLAlchemy + Alembic

**Responsibilities**:
- Business logic execution
- API endpoint exposure
- Database operations
- Authentication/authorization

**Security Controls**:
- JWT token validation
- Password hashing (bcrypt)
- Rate limiting
- Input validation (Pydantic)
- SQL injection prevention (ORM)

**API Design**:
```python
# Health & Metrics
GET  /health          # Health check
GET  /metrics         # Prometheus metrics

# Authentication
POST /auth/register   # User registration
POST /auth/login      # User login

# Protected Resources
GET  /api/resources   # List resources (requires auth)
```

---

### 3. Data Layer

**PostgreSQL**:
- Primary relational database
- Stores user data, application state
- Automated backups
- High availability configuration

**Redis**:
- Session cache
- Rate limiting counters
- Temporary data storage

---

### 4. Infrastructure Layer

**Azure Kubernetes Service (AKS)**:
- Managed Kubernetes cluster
- Auto-scaling node pools
- Azure CNI networking
- Integration with Azure services

**Azure Container Registry (ACR)**:
- Private container image registry
- Vulnerability scanning
- Geo-replication

**Networking**:

Virtual Network: 10.0.0.0/16
├── AKS Subnet: 10.0.1.0/24
├── Database Subnet: 10.0.2.0/24
└── Management Subnet: 10.0.3.0/24

---

## Security Architecture

### Zero Trust Network Model
┌─────────────────────────────────────────┐
│        Internet (Untrusted)             │
└─────────────────┬───────────────────────┘
│
▼
┌─────────────────────┐
│  NGINX Ingress      │
│  (TLS Termination)  │
└──────────┬──────────┘
│
▼
┌──────────────────────────────┐
│   NetworkPolicy: Allow       │
│   Ingress → Frontend         │
└──────────────┬───────────────┘
│
▼
┌─────────────────┐
│    Frontend     │
│   (React App)   │
└────────┬────────┘
│
┌─────────────┴────────────────┐
│  NetworkPolicy: Allow        │
│  Frontend → Backend          │
└─────────────┬────────────────┘
│
▼
┌─────────────────┐
│     Backend     │
│    (FastAPI)    │
└────────┬────────┘
│
┌─────────────┴────────────────┐
│  NetworkPolicy: Allow        │
│  Backend → PostgreSQL/Redis  │
└──────────────────────────────┘

### Defense in Depth Layers

**Layer 1: Network Security**
- NetworkPolicies for microsegmentation
- Azure NSG for subnet-level filtering
- DDoS protection

**Layer 2: Container Security**
- Non-root execution
- Read-only filesystems
- No privileged containers
- Security context constraints

**Layer 3: Application Security**
- JWT authentication
- Input validation
- Output encoding
- Secure session management

**Layer 4: Runtime Security**
- Falco monitoring
- Anomaly detection
- Real-time alerts

**Layer 5: Data Security**
- Encryption at rest
- Encryption in transit (TLS)
- Secrets management
- Database access controls

---

## Deployment Architecture

### CI/CD Pipeline Flow

Developer Push
│
▼
┌─────────────────────┐
│  GitHub Actions     │
│  Triggered          │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Run Tests          │
│  - Unit tests       │
│  - Integration      │
│  - Coverage >80%    │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Security Scans     │
│  - SAST (Snyk)      │
│  - Dependencies     │
│  - Code quality     │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Build Image        │
│  - Multi-stage      │
│  - Layer caching    │
│  - Push to ACR      │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Image Scan         │
│  - Trivy scan       │
│  - Block on CRITICAL│
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Canary Deploy      │
│  - 10% traffic      │
│  - Health checks    │
└──────────┬──────────┘
│
▼
┌─────────────────────┐
│  Full Rollout       │
│  - Progressive      │
│  - Auto-rollback    │
└─────────────────────┘

### Deployment Strategy

**Canary Deployment**:
1. Deploy canary version (1 pod)
2. Route 10% traffic to canary
3. Monitor metrics for 5 minutes
4. If healthy: scale to 50%, then 100%
5. If unhealthy: automatic rollback

**Health Check Gates**:
- Liveness probe: `/health` every 10s
- Readiness probe: `/health` every 5s
- Startup probe: `/health` 30s delay

---

## Scalability Architecture

### Horizontal Pod Autoscaling
```yaml
Frontend HPA:
  Min Replicas: 2
  Max Replicas: 10
  Target CPU: 70%
  Target Memory: 80%

Backend HPA:
  Min Replicas: 2
  Max Replicas: 10
  Target CPU: 70%
  Target Memory: 80%
```

### Cluster Autoscaling
```yaml
Node Pool:
  Min Nodes: 2
  Max Nodes: 10
  VM Size: Standard_D2s_v3
  Auto-scale: Enabled
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time (p95) | <100ms | Prometheus |
| Throughput | 1000 req/s | Load testing |
| Availability | 99.9% | Uptime monitoring |
| Error Rate | <0.1% | Application logs |

---

## Monitoring Architecture

### Metrics Collection

Application Pods
│
▼
Prometheus Scrape (every 15s)
│
▼
Time-Series Database
│
▼
Grafana Dashboards
│
▼
AlertManager → PagerDuty/Slack

### Key Metrics

**Infrastructure**:
- Node CPU/Memory/Disk usage
- Pod resource consumption
- Network I/O

**Application**:
- HTTP request rate
- Response latency (p50, p95, p99)
- Error rate
- Active connections

**Business**:
- User registrations
- API usage per endpoint
- Failed authentication attempts

---

## Disaster Recovery

### Backup Strategy

**Database Backups**:
- Automated daily backups (Azure Backup)
- 30-day retention
- Point-in-time recovery

**Configuration Backups**:
- All configs in Git (GitOps)
- Helm chart versioning
- Infrastructure state in Terraform

### Recovery Time Objectives

| Component | RTO | RPO |
|-----------|-----|-----|
| Application | 5 min | 0 min |
| Database | 1 hour | 24 hours |
| Full System | 2 hours | 24 hours |

### Failover Procedures

1. **Application Failure**: Automatic pod restart, health checks
2. **Database Failure**: Failover to standby replica
3. **Cluster Failure**: Redeploy via Terraform + Helm
4. **Region Failure**: Multi-region setup (future enhancement)

---

## Cost Optimization

### Resource Allocation

**Development Environment**:
- 2 nodes (Standard_B2s)
- 1 replica per service
- Estimated: $100/month

**Production Environment**:
- 3-5 nodes (Standard_D2s_v3)
- 2-10 replicas (auto-scaled)
- Estimated: $400-800/month

### Cost-Saving Measures

1. **Auto-scaling**: Scale down during low traffic
2. **Spot Instances**: Use for non-critical workloads
3. **Resource Limits**: Prevent over-provisioning
4. **Reserved Instances**: 1-year commitment for 40% savings

---

## Future Enhancements

1. **Multi-region deployment** for global availability
2. **Service mesh (Istio)** for advanced traffic management
3. **GraphQL API** for flexible data querying
4. **Machine learning** for predictive auto-scaling
5. **Chaos engineering** for resilience testing
