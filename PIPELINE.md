# VibelyTube CI/CD Pipeline Documentation

## Overview
This document describes the complete CI/CD pipeline setup for the VibelyTube project, including build, test, security scanning, and deployment workflows.

## Pipeline Architecture

### 1. Continuous Integration (CI)
Located in `.github/workflows/ci-cd.yml`

#### Triggers
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

#### Jobs

##### Frontend Testing (`frontend-test`)
- **Purpose**: Test and build the React frontend
- **Steps**:
  - Checkout code
  - Setup Node.js 18.x
  - Install dependencies with npm ci
  - Run ESLint for code quality
  - Execute tests with coverage
  - Upload coverage to Codecov
  - Build production bundle
  - Upload build artifacts

##### Backend Testing (`backend-test`)
- **Purpose**: Test and build the Express.js backend
- **Dependencies**: PostgreSQL service container
- **Steps**:
  - Checkout code
  - Setup Node.js 18.x
  - Start PostgreSQL test database
  - Install dependencies
  - Setup database with Prisma
  - Run ESLint for code quality
  - Execute tests with coverage
  - Upload coverage to Codecov
  - Build production bundle
  - Upload build artifacts

##### Security Scanning (`security-scan`)
- **Purpose**: Vulnerability scanning and security analysis
- **Dependencies**: Frontend and backend tests must pass
- **Tools**:
  - **Trivy**: Filesystem vulnerability scanner
  - **Snyk**: Dependency vulnerability scanner
- **Outputs**: Security reports uploaded to GitHub Security tab

##### Docker Build (`docker-build`)
- **Purpose**: Build and push containerized application
- **Triggers**: Only on push to `main` branch
- **Features**:
  - Multi-platform builds (linux/amd64, linux/arm64)
  - GitHub Container Registry integration
  - Build cache optimization
  - Automatic tagging strategy

##### Deployment Jobs
- **Staging**: Deploys on push to `develop` branch
- **Production**: Deploys on push to `main` branch
- **Features**: Environment-specific configurations

##### Performance Testing (`performance-test`)
- **Purpose**: Automated performance validation
- **Tools**:
  - **Lighthouse CI**: Frontend performance metrics
  - **Artillery**: Load testing (configurable)

##### Notifications (`notify`)
- **Purpose**: Slack notifications for deployment status
- **Triggers**: Always runs after deployment jobs
- **Channels**: `#deployments`

### 2. Continuous Deployment (CD)
Located in `.github/workflows/deploy.yml`

#### Deployment Targets
- **Staging Environment**: `develop` branch
- **Production Environment**: `main` branch or manual trigger

#### Deployment Process
1. **Authentication**: AWS credentials and Kubernetes config
2. **Image Retrieval**: Pull pre-built Docker images
3. **Manifest Generation**: Environment-specific Kubernetes manifests
4. **Kubernetes Deployment**: Apply manifests and wait for rollout
5. **Health Verification**: Automated health checks
6. **Status Updates**: GitHub deployment status tracking
7. **Notifications**: Slack alerts for success/failure

## Infrastructure Components

### 1. Docker Configuration

#### Multi-stage Dockerfile
```dockerfile
# Frontend Builder Stage
FROM node:18-alpine AS frontend-builder
# ... frontend build steps

# Backend Builder Stage  
FROM node:18-alpine AS backend-builder
# ... backend build steps

# Production Stage
FROM node:18-alpine AS production
# ... optimized production image
```

#### Docker Compose Services
- **Application**: Main VibelyTube app (ports 3000, 5173)
- **PostgreSQL**: Database with health checks
- **Redis**: Caching layer
- **Nginx**: Reverse proxy with SSL termination
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

### 2. Monitoring Stack

#### Prometheus Configuration
- **Targets**: Application, database, Redis, system metrics
- **Scrape Intervals**: 15-30 seconds
- **Alert Rules**: Comprehensive alerting for:
  - Application health
  - Resource utilization
  - Error rates
  - Business metrics

#### Grafana Dashboards
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk, network
- **Business Metrics**: User activity, feature usage

#### Alert Rules (`monitoring/alert_rules.yml`)
- **Critical Alerts**: Application down, database connection failure
- **Warning Alerts**: High CPU/memory, slow response times
- **Business Alerts**: Low user activity, rate limiting

### 3. Security Features

#### Container Security
- **Non-root user**: Application runs as `nextjs:nodejs` (UID 1001)
- **Minimal base image**: Alpine Linux with security updates
- **Health checks**: Automated container health monitoring
- **Signal handling**: Graceful shutdown with dumb-init

#### Network Security
- **Nginx Proxy**: Rate limiting, SSL termination
- **CORS Configuration**: Restricted origin policies
- **Security Headers**: XSS protection, content security policy

#### Secrets Management
- **Environment Variables**: Secure configuration via `.env`
- **Kubernetes Secrets**: Production credential management
- **GitHub Secrets**: CI/CD pipeline secrets

## Environment Setup

### 1. Development Environment

#### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git
- OpenSSL (for SSL certificates)

#### Setup Script (`setup-dev.sh`)
Automated development environment setup:
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

#### Manual Setup Steps
1. **Clone Repository**
2. **Install Dependencies**: `npm install` in both frontend and backend
3. **Environment Configuration**: Copy `.env.example` to `.env`
4. **Database Setup**: `docker-compose up -d postgres`
5. **Run Migrations**: `npx prisma migrate dev`
6. **Start Services**: `npm run dev` in both directories

### 2. Production Environment

#### Required Secrets
```yaml
# GitHub Repository Secrets
AWS_ACCESS_KEY_ID: "AKIA..."
AWS_SECRET_ACCESS_KEY: "..."
KUBE_CONFIG: "base64-encoded-kubeconfig"
SLACK_WEBHOOK: "https://hooks.slack.com/..."
SNYK_TOKEN: "..."
```

#### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=3000
FRONTEND_PORT=5173

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# APIs
OPENAI_API_KEY=sk-...
YOUTUBE_API_KEY=...

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
```

## Deployment Strategies

### 1. Rolling Deployment
- **Zero-downtime deployments**
- **Gradual pod replacement**
- **Automated rollback on failure**

### 2. Blue-Green Deployment (Future)
- **Complete environment switch**
- **Instant rollback capability**
- **Database migration strategy**

### 3. Canary Deployment (Future)
- **Gradual traffic shifting**
- **A/B testing capability**
- **Automated promotion/rollback**

## Monitoring and Alerting

### 1. Application Metrics
- **Response Time**: 95th percentile < 2 seconds
- **Error Rate**: < 5% for 5 minutes
- **Throughput**: Requests per second
- **Active Users**: Session tracking

### 2. Infrastructure Metrics
- **CPU Usage**: > 80% for 5 minutes
- **Memory Usage**: > 80% for 5 minutes
- **Disk Space**: < 20% available
- **Network I/O**: Bandwidth utilization

### 3. Business Metrics
- **User Sessions**: Active user tracking
- **Feature Usage**: Component interaction rates
- **API Rate Limiting**: Threshold monitoring

## Troubleshooting

### 1. Common Issues

#### Build Failures
- **Dependency conflicts**: Clear npm cache, delete node_modules
- **TypeScript errors**: Check tsconfig.json configurations
- **Docker build issues**: Verify Dockerfile syntax and dependencies

#### Deployment Failures
- **Kubernetes connectivity**: Verify KUBE_CONFIG secret
- **Resource limits**: Check cluster resource availability
- **Image pull errors**: Verify container registry permissions

#### Runtime Issues
- **Database connections**: Check DATABASE_URL and network connectivity
- **Authentication errors**: Verify OAuth client configurations
- **SSL certificates**: Ensure valid certificates in production

### 2. Debugging Commands

#### Local Development
```bash
# Check application logs
docker-compose logs -f app

# Database connection test
npm run db:test

# Health check
curl http://localhost:3000/health
```

#### Production
```bash
# Kubernetes pod logs
kubectl logs -f deployment/vibelytube-app -n vibelytube

# Check pod status
kubectl get pods -n vibelytube

# Describe deployment
kubectl describe deployment vibelytube-app -n vibelytube
```

## Performance Optimization

### 1. Frontend Optimizations
- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: webpack-bundle-analyzer
- **CDN Integration**: Static asset delivery
- **Service Workers**: Offline capability

### 2. Backend Optimizations
- **Database Indexing**: Query performance optimization
- **Caching Strategy**: Redis implementation
- **Connection Pooling**: Database connection management
- **API Rate Limiting**: Request throttling

### 3. Infrastructure Optimizations
- **Container Resource Limits**: CPU and memory optimization
- **Horizontal Pod Autoscaling**: Traffic-based scaling
- **Load Balancing**: Traffic distribution
- **CDN Configuration**: Global content delivery

## Security Considerations

### 1. Application Security
- **Input Validation**: Request sanitization
- **Authentication**: JWT token management
- **Authorization**: Role-based access control
- **HTTPS Enforcement**: SSL/TLS encryption

### 2. Infrastructure Security
- **Network Policies**: Kubernetes network isolation
- **Secret Management**: Encrypted credential storage
- **Container Scanning**: Vulnerability assessment
- **Access Control**: IAM and RBAC policies

### 3. Compliance
- **Data Protection**: GDPR compliance
- **Audit Logging**: Security event tracking
- **Backup Strategy**: Data recovery procedures
- **Incident Response**: Security breach protocols

## Future Enhancements

### 1. Advanced Deployment
- **GitOps**: ArgoCD integration
- **Progressive Delivery**: Flagger canary deployments
- **Multi-region**: Global deployment strategy

### 2. Enhanced Monitoring
- **Distributed Tracing**: Jaeger implementation
- **APM Integration**: Application performance monitoring
- **Log Aggregation**: ELK stack deployment

### 3. Automation
- **Dependency Updates**: Renovate bot integration
- **Security Scanning**: Automated vulnerability patching
- **Performance Testing**: Continuous load testing

This pipeline provides a robust, scalable, and secure deployment strategy for the VibelyTube application with comprehensive monitoring, alerting, and troubleshooting capabilities.