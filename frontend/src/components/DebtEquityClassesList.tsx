import React, { useState, useEffect, useCallback } from 'react';
import './DebtEquityClassesList.css';

interface DebtEquityClass {
  id: string;
  projectId: string;
  unitClass: string;
  unitPrice: number;
  isOpenToInvestments: boolean;
  investmentIncrementAmount: number;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DebtEquityClassesListProps {
  projectId: string;
  onAddNew: () => void;
  onEdit: (classData: DebtEquityClass) => void;
  onDelete: (classId: string) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const DebtEquityClassesList: React.FC<DebtEquityClassesListProps> = ({
  projectId,
  onAddNew,
  onEdit,
  onDelete,
  refreshTrigger
}) => {
  const [classes, setClasses] = useState<DebtEquityClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/debt-equity-classes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch debt & equity classes');
      }
      
      const data = await response.json();
      if (data.success) {
        setClasses(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch debt & equity classes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses, refreshTrigger]);

  const handleDelete = (classId: string) => {
    // Just call the parent's onDelete handler - the parent will handle the confirmation dialog
    onDelete(classId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="debt-equity-classes-list">
        <div className="classes-header">
          <h3>Debt & Equity Classes</h3>
        </div>
        <div className="loading-state">Loading classes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="debt-equity-classes-list">
        <div className="classes-header">
          <h3>Debt & Equity Classes</h3>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchClasses} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="debt-equity-classes-list">
      <div className="classes-header">
        <h3>Debt & Equity Classes</h3>
        <button onClick={onAddNew} className="add-class-button">
          Add New Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h4>No debt or equity classes available</h4>
          <p>Create your first class to define investment structures and terms for potential investors.</p>
          <button onClick={onAddNew} className="add-first-class-button">
            Add Your First Class
          </button>
        </div>
      ) : (
        <div className="classes-table-container">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Unit Class</th>
                <th>Unit Price</th>
                <th>Investment Status</th>
                <th>Min Investment</th>
                <th>Max Investment</th>
                <th>Increment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td className="unit-class-cell">
                    <span className="unit-class-name">{classItem.unitClass}</span>
                  </td>
                  <td className="price-cell">
                    {formatCurrency(classItem.unitPrice)}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${classItem.isOpenToInvestments ? 'open' : 'closed'}`}>
                      {classItem.isOpenToInvestments ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(classItem.minInvestmentAmount)}
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(classItem.maxInvestmentAmount)}
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(classItem.investmentIncrementAmount)}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => onEdit(classItem)}
                      className="edit-button"
                      title="Edit class"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
                      className="delete-button"
                      title="Delete class"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtEquityClassesList;