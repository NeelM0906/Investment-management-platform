import React from 'react';
import { TrendingUp, Users, Target, Calendar } from 'lucide-react';

interface ProjectKPIs {
  totalCommitments: number;
  totalCommittedAmount: number;
  fundingPercentage: number;
  daysRemaining: number;
  currency: string;
}

interface ProjectKPIPanelProps {
  kpis: ProjectKPIs;
  loading?: boolean;
}

const ProjectKPIPanel: React.FC<ProjectKPIPanelProps> = ({ kpis, loading = false }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const kpiCards = [
    {
      title: 'Total Commitments',
      value: loading ? '...' : kpis.totalCommitments.toString(),
      icon: Users,
      color: '#3b82f6',
      description: 'Number of committed investors'
    },
    {
      title: 'Committed Amount',
      value: loading ? '...' : formatCurrency(kpis.totalCommittedAmount, kpis.currency),
      icon: TrendingUp,
      color: '#10b981',
      description: 'Total amount committed'
    },
    {
      title: 'Funding Progress',
      value: loading ? '...' : `${kpis.fundingPercentage}%`,
      icon: Target,
      color: getProgressColor(kpis.fundingPercentage),
      description: 'Percentage of goal achieved'
    },
    {
      title: 'Days Remaining',
      value: loading ? '...' : kpis.daysRemaining.toString(),
      icon: Calendar,
      color: kpis.daysRemaining > 30 ? '#10b981' : kpis.daysRemaining > 7 ? '#f59e0b' : '#ef4444',
      description: 'Days until project end'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
          Key Performance Indicators
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Real-time project funding metrics and progress tracking
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="card" style={{ border: `2px solid ${kpi.color}20` }}>
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.875rem', 
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      {kpi.title}
                    </p>
                    <p style={{ 
                      fontSize: '2.25rem', 
                      fontWeight: '700', 
                      color: kpi.color, 
                      marginBottom: '0.25rem',
                      lineHeight: '1'
                    }}>
                      {kpi.value}
                    </p>
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.75rem',
                      lineHeight: '1.2'
                    }}>
                      {kpi.description}
                    </p>
                  </div>
                  <div 
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      backgroundColor: `${kpi.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '1rem'
                    }}
                  >
                    <Icon size={28} color={kpi.color} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="card-content">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>Funding Progress</span>
              <span style={{ fontWeight: '600', color: getProgressColor(kpis.fundingPercentage) }}>
                {kpis.fundingPercentage}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: '#e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  width: `${Math.min(100, kpis.fundingPercentage)}%`,
                  height: '100%',
                  backgroundColor: getProgressColor(kpis.fundingPercentage),
                  borderRadius: '6px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
            <span>{formatCurrency(kpis.totalCommittedAmount, kpis.currency)} committed</span>
            <span>Goal: {formatCurrency(kpis.totalCommittedAmount / (kpis.fundingPercentage / 100), kpis.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKPIPanel;