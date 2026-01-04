import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Cloud, Activity, Lock, 
  TrendingUp, Database, Zap, CheckCircle,
  Menu, X, Github, Linkedin
} from 'lucide-react';
import './LandingPage.css';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <Shield className="logo-icon" />
            <span>SentinelStack</span>
          </div>
          
          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features">Features</a>
            <a href="#architecture">Architecture</a>
            <a href="#security">Security</a>
            <Link to="/login" className="nav-cta">Dashboard</Link>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={16} />
              <span>Production-Grade DevSecOps Platform</span>
            </div>
            <h1 className="hero-title">
              Enterprise Security<br />
              <span className="gradient-text">Meets Cloud Native</span>
            </h1>
            <p className="hero-description">
              A secure, scalable, and observable cloud platform built on Azure AKS 
              with Zero Trust architecture, automated CI/CD, and comprehensive monitoring.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">
                View Dashboard
              </Link>
              <a href="#features" className="btn btn-secondary">
                Explore Features
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat">
                <div className="stat-number">&lt;100ms</div>
                <div className="stat-label">Latency</div>
              </div>
              <div className="stat">
                <div className="stat-number">Auto</div>
                <div className="stat-label">Scaling</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <Cloud size={32} />
              <span>Azure AKS</span>
            </div>
            <div className="floating-card card-2">
              <Shield size={32} />
              <span>Zero Trust</span>
            </div>
            <div className="floating-card card-3">
              <Activity size={32} />
              <span>Observability</span>
            </div>
            <div className="floating-card card-4">
              <Activity size={32} />
              <span>Auto Scaling</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Built for Production</h2>
            <p>Enterprise-grade features from day one</p>
          </div>
          
          <div className="features-grid">
            <FeatureCard 
              icon={<Shield />}
              title="Zero Trust Security"
              description="NetworkPolicies, mTLS, WAF protection, and runtime threat detection with Falco"
              color="purple"
            />
            <FeatureCard 
              icon={<Zap />}
              title="Automated CI/CD"
              description="GitHub Actions pipelines with security gates, canary deployments, and automatic rollbacks"
              color="blue"
            />
            <FeatureCard 
              icon={<Activity />}
              title="Full Observability"
              description="Prometheus metrics, Grafana dashboards, ELK logging, and intelligent alerting"
              color="green"
            />
            <FeatureCard 
              icon={<TrendingUp />}
              title="Auto Scaling"
              description="HPA for pods, cluster autoscaling, and intelligent resource management"
              color="orange"
            />
            <FeatureCard 
              icon={<Lock />}
              title="Secrets Management"
              description="Azure Key Vault integration, encrypted secrets, and zero credentials in code"
              color="red"
            />
            <FeatureCard 
              icon={<Database />}
              title="Stateful Services"
              description="PostgreSQL for persistence, Redis for caching, with automated backups"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="architecture">
        <div className="container">
          <div className="section-header">
            <h2>System Architecture</h2>
            <p>Layered, cloud-native design</p>
          </div>
          
          <div className="arch-diagram">
            <div className="arch-layer">
              <div className="arch-box box-users">
                <div className="arch-icon">👥</div>
                <div className="arch-title">Users</div>
                <div className="arch-desc">Web / Mobile</div>
              </div>
            </div>

            <div className="arch-arrow">↓</div>

            <div className="arch-layer">
              <div className="arch-box box-edge">
                <div className="arch-icon"><Shield size={24} /></div>
                <div className="arch-title">Edge Security</div>
                <div className="arch-desc">WAF + Load Balancer</div>
              </div>
            </div>

            <div className="arch-arrow">↓</div>

            <div className="arch-cluster">
              <div className="cluster-header">
                <Cloud size={24} />
                <span>Azure Kubernetes Service (AKS)</span>
              </div>
              <div className="cluster-grid">
                <div className="cluster-service">
                  <div className="service-title">Frontend</div>
                  <div className="service-tech">React + NGINX</div>
                </div>
                <div className="cluster-service">
                  <div className="service-title">Backend</div>
                  <div className="service-tech">FastAPI</div>
                </div>
                <div className="cluster-service">
                  <div className="service-title">Database</div>
                  <div className="service-tech">PostgreSQL</div>
                </div>
                <div className="cluster-service">
                  <div className="service-title">Cache</div>
                  <div className="service-tech">Redis</div>
                </div>
              </div>
            </div>

            <div className="arch-arrow">↓</div>

            <div className="arch-layer">
              <div className="arch-box box-obs">
                <div className="arch-icon"><Activity size={24} /></div>
                <div className="arch-title">Observability</div>
                <div className="arch-desc">Prometheus + Grafana + ELK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security">
        <div className="container">
          <div className="security-content">
            <div className="security-text">
              <h2>Security by Design</h2>
              <p className="section-subtitle">
                Zero Trust architecture protecting every layer
              </p>
              
              <div className="security-features">
                <SecurityFeature 
                  title="Network Isolation"
                  description="Default deny NetworkPolicies with explicit allow rules"
                />
                <SecurityFeature 
                  title="Runtime Protection"
                  description="Falco detects suspicious behavior in real-time"
                />
                <SecurityFeature 
                  title="Image Scanning"
                  description="Trivy scans every image before deployment"
                />
                <SecurityFeature 
                  title="Encrypted Communication"
                  description="mTLS between all services, TLS at edge"
                />
              </div>
            </div>
            
            <div className="security-visual">
              <div className="security-shield">
                <Shield size={120} strokeWidth={1.5} />
                <div className="shield-layers">
                  <div className="shield-layer" style={{animationDelay: '0s'}}>WAF</div>
                  <div className="shield-layer" style={{animationDelay: '0.2s'}}>mTLS</div>
                  <div className="shield-layer" style={{animationDelay: '0.4s'}}>NetworkPolicy</div>
                  <div className="shield-layer" style={{animationDelay: '0.6s'}}>Falco</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack">
        <div className="container">
          <div className="section-header">
            <h2>Technology Stack</h2>
            <p>Industry-standard tools and platforms</p>
          </div>
          
          <div className="tech-grid">
            <TechBadge name="Azure AKS" category="Cloud" />
            <TechBadge name="Kubernetes" category="Orchestration" />
            <TechBadge name="Terraform" category="IaC" />
            <TechBadge name="React" category="Frontend" />
            <TechBadge name="FastAPI" category="Backend" />
            <TechBadge name="PostgreSQL" category="Database" />
            <TechBadge name="Redis" category="Cache" />
            <TechBadge name="Prometheus" category="Metrics" />
            <TechBadge name="Grafana" category="Dashboards" />
            <TechBadge name="ELK" category="Logging" />
            <TechBadge name="GitHub Actions" category="CI/CD" />
            <TechBadge name="Helm" category="Deployment" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to See It in Action?</h2>
            <p>Explore the live dashboard with real metrics and monitoring</p>
            <Link to="/dashboard" className="btn btn-primary btn-large">
              View Live Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Shield className="logo-icon" />
              <span>SentinelStack</span>
            </div>
            <div className="footer-links">
              <a href="https://github.com/rupesh109" target="_blank" rel="noopener noreferrer">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/rupesh-kumar-jha-b04b2119b/" target="_blank" rel="noopener noreferrer">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 SentinelStack. Built for production.@Rupesh-Void</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className={`feature-card feature-${color}`}>
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function SecurityFeature({ title, description }) {
  return (
    <div className="security-feature">
      <CheckCircle className="check-icon" />
      <div>
        <div className="feature-title">{title}</div>
        <div className="feature-desc">{description}</div>
      </div>
    </div>
  );
}

function TechBadge({ name, category }) {
  return (
    <div className="tech-badge">
      <div className="tech-name">{name}</div>
      <div className="tech-category">{category}</div>
    </div>
  );
}

export default LandingPage;
