import React, { useState, useEffect } from 'react';
import { 
  Activity, TrendingUp, AlertCircle, CheckCircle,
  Server, Database, Cloud, LogOut, Menu, X,
  Clock, Users, Cpu, HardDrive
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, 
         XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

function Dashboard({ api, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [metrics, setMetrics] = useState({
    requestRate: [],
    errorRate: [],
    latency: [],
    resources: {}
  });

  // Generate mock data (replace with real API calls)
  useEffect(() => {
    const generateMockData = () => {
      const now = Date.now();
      const data = [];
      for (let i = 11; i >= 0; i--) {
        data.push({
          time: new Date(now - i * 5 * 60000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          requests: Math.floor(Math.random() * 500) + 200,
          errors: Math.floor(Math.random() * 10),
          latency: Math.floor(Math.random() * 100) + 50,
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 30) + 50
        });
      }
      return data;
    };

    setMetrics({
      requestRate: generateMockData(),
      errorRate: generateMockData(),
      latency: generateMockData(),
      resources: {
        cpu: 65,
        memory: 72,
        pods: 12,
        nodes: 3
      }
    });

    // Update every 30 seconds
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        requestRate: generateMockData()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Activity className="brand-icon" />
            {sidebarOpen && <span>SentinelStack</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item active">
            <TrendingUp size={20} />
            {sidebarOpen && <span>Overview</span>}
          </a>
          <a href="#services" className="nav-item">
            <Server size={20} />
            {sidebarOpen && <span>Services</span>}
          </a>
          <a href="#database" className="nav-item">
            <Database size={20} />
            {sidebarOpen && <span>Database</span>}
          </a>
          <a href="#infrastructure" className="nav-item">
            <Cloud size={20} />
            {sidebarOpen && <span>Infrastructure</span>}
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <h1>Dashboard</h1>
          
          <div className="header-user">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.username || 'User'}</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
            icon={<Activity />}
            title="Request Rate"
            value="1,247/min"
            change="+12.5%"
            positive={true}
            color="blue"
          />
          <StatCard
            icon={<AlertCircle />}
            title="Error Rate"
            value="0.34%"
            change="-2.1%"
            positive={true}
            color="red"
          />
          <StatCard
            icon={<Clock />}
            title="Avg Latency"
            value="124ms"
            change="-8.3%"
            positive={true}
            color="green"
          />
          <StatCard
            icon={<CheckCircle />}
            title="Uptime"
            value="99.98%"
            change="+0.02%"
            positive={true}
            color="purple"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Request Rate</h3>
              <span className="chart-subtitle">Last 1 hour</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={metrics.requestRate}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#718096" fontSize={12} />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    fill="url(#colorRequests)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Response Time (p95)</h3>
              <span className="chart-subtitle">Milliseconds</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics.latency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#718096" fontSize={12} />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#48bb78" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-header">
              <h3>Resource Usage</h3>
              <span className="chart-subtitle">Current utilization</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.requestRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#718096" fontSize={12} />
                  <YAxis stroke="#718096" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="cpu" fill="#667eea" />
                  <Bar dataKey="memory" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Infrastructure Health</h3>
              <span className="chart-subtitle">Real-time status</span>
            </div>
            <div className="infrastructure-grid">
              <InfraCard
                icon={<Cpu />}
                label="CPU Usage"
                value={`${metrics.resources.cpu}%`}
                status="healthy"
              />
              <InfraCard
                icon={<HardDrive />}
                label="Memory"
                value={`${metrics.resources.memory}%`}
                status="warning"
              />
              <InfraCard
                icon={<Server />}
                label="Active Pods"
                value={metrics.resources.pods}
                status="healthy"
              />
              <InfraCard
                icon={<Cloud />}
                label="Cluster Nodes"
                value={metrics.resources.nodes}
                status="healthy"
              />
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="services-card">
          <h3>Active Services</h3>
          <div className="services-list">
            <ServiceRow name="Frontend" status="healthy" requests="1.2k/min" latency="45ms" />
            <ServiceRow name="Backend API" status="healthy" requests="980/min" latency="67ms" />
            <ServiceRow name="PostgreSQL" status="healthy" requests="450/min" latency="12ms" />
            <ServiceRow name="Redis Cache" status="healthy" requests="2.1k/min" latency="3ms" />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, change, positive, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${positive ? 'positive' : 'negative'}`}>
          {change}
        </div>
      </div>
    </div>
  );
}

function InfraCard({ icon, label, value, status }) {
  return (
    <div className="infra-card">
      <div className="infra-icon">{icon}</div>
      <div className="infra-label">{label}</div>
      <div className="infra-value">{value}</div>
      <div className={`infra-status status-${status}`}>
        {status === 'healthy' ? '●' : '⚠'}
      </div>
    </div>
  );
}

function ServiceRow({ name, status, requests, latency }) {
  return (
    <div className="service-row">
      <div className="service-info">
        <div className={`service-status status-${status}`}>●</div>
        <span className="service-name">{name}</span>
      </div>
      <div className="service-metrics">
        <span>{requests}</span>
        <span className="metric-label">requests</span>
      </div>
      <div className="service-metrics">
        <span>{latency}</span>
        <span className="metric-label">latency</span>
      </div>
    </div>
  );
}

export default Dashboard;
