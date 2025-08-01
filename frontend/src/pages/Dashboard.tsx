import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, TrendingUp, Users } from 'lucide-react';

interface ServerStatus {
  status: string;
  message: string;
}

interface ProjectStats {
  totalProjects: number;
  totalTargetAmount: number;
  currency: string;
}

const Dashboard: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 0,
    totalTargetAmount: 0,
    currency: 'USD'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check server status
        const healthResponse = await fetch('http://localhost:3001/health');
        const healthData = await healthResponse.json();
        setServerStatus(healthData);

        // Fetch project statistics
        const projectsResponse = await fetch('http://localhost:3001/api/projects');
        const projectsData = await projectsResponse.json();
        
        if (projectsData.success) {
          const projects = projectsData.data;
          const totalTargetAmount = projects.reduce((sum: number, project: any) => sum + project.targetAmount, 0);
          
          setProjectStats({
            totalProjects: projects.length,
            totalTargetAmount,
            currency: projects.length > 0 ? projects[0].currency : 'USD'
          });
        }
      } catch (error) {
        setServerStatus({ status: 'ERROR', message: 'Server is not running' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Projects',
      value: loading ? '...' : projectStats.totalProjects.toString(),
      icon: FolderOpen,
      color: 'bg-blue-500',
      description: 'Active investment projects'
    },
    {
      title: 'Total Contacts',
      value: '0',
      icon: Users,
      color: 'bg-green-500',
      description: 'Manage investor and business contacts'
    },
    {
      title: 'Fundraising Goals',
      value: loading ? '...' : formatCurrency(projectStats.totalTargetAmount, projectStats.currency),
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Combined target amounts'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome to your Investment Management Portal</p>
      </div>

      {/* Server Status */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Checking server status...</span>
              </>
            ) : (
              <>
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: serverStatus?.status === 'OK' ? '#10b981' : '#ef4444'
                  }}
                ></div>
                <span>
                  <strong>Server Status:</strong> {serverStatus?.message || 'Unknown'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/projects/new" className="btn btn-primary">
              <Plus size={16} />
              Create New Project
            </Link>
            <Link to="/projects" className="btn btn-secondary">
              <FolderOpen size={16} />
              View All Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {stat.title}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                      {stat.value}
                    </p>
                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {stat.description}
                    </p>
                  </div>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={24} color="white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Feature Development Status</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                <span style={{ fontWeight: '500' }}>Projects Management</span>
              </div>
              <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>✓ In Development</span>
            </div>
            
            {/* Completed Features */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                <span style={{ fontWeight: '500' }}>Contacts</span>
              </div>
              <span style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '500' }}>✓ Complete</span>
            </div>
            
            {['Accounts', 'Fundraising', 'Tasks', 'Documents', 'Reports'].map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                  <span style={{ fontWeight: '500' }}>{feature}</span>
                </div>
                <span style={{ color: '#d97706', fontSize: '0.875rem', fontWeight: '500' }}>⏳ Coming Soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;