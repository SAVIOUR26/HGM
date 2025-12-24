import React from 'react';

interface DashboardProps {
  user: {
    id: number;
    username: string;
    role: string;
    full_name?: string;
  };
  onSectionSelect: (section: 'bar' | 'restaurant' | 'lodge') => void;
  onNavigateToAdmin: () => void;
  onNavigateToReports: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

function Dashboard({ user, onSectionSelect, onNavigateToAdmin, onNavigateToReports, onNavigateToProfile, onLogout }: DashboardProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>
            HGM POS System
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Welcome back, <strong>{user.full_name || user.username}</strong> ({user.role})
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user.role === 'admin' && (
            <>
              <button 
                className="btn btn-secondary"
                onClick={onNavigateToAdmin}
                style={{ fontSize: '14px', padding: '10px 20px' }}
              >
                ⚙️ Admin Panel
              </button>
              <button 
                className="btn btn-secondary"
                onClick={onNavigateToReports}
                style={{ fontSize: '14px', padding: '10px 20px' }}
              >
                📊 Reports
              </button>
            </>
          )}
          {user.role === 'cashier' && (
            <button
              className="btn btn-secondary"
              onClick={onNavigateToReports}
              style={{ fontSize: '14px', padding: '10px 20px' }}
            >
              📊 My Reports
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={onNavigateToProfile}
            style={{ fontSize: '14px', padding: '10px 20px' }}
          >
            👤 My Profile
          </button>
          <button
            className="btn btn-danger"
            onClick={onLogout}
            style={{ fontSize: '14px', padding: '10px 20px' }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Section Selection */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Select a Section to Start
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Bar Section */}
          <div 
            className="card fade-in"
            onClick={() => onSectionSelect('bar')}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '16px'
            }}>
              🍺
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              Bar
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Drinks, beers, wines, and spirits
            </p>
          </div>

          {/* Restaurant Section */}
          <div 
            className="card fade-in"
            onClick={() => onSectionSelect('restaurant')}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '3px solid transparent',
              animationDelay: '0.1s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '16px'
            }}>
              🍽️
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              Restaurant
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Meals, breakfast, lunch, and snacks
            </p>
          </div>

          {/* Lodge Section */}
          <div 
            className="card fade-in"
            onClick={() => onSectionSelect('lodge')}
            style={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '3px solid transparent',
              animationDelay: '0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#f59e0b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '16px'
            }}>
              🏨
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
              Lodge
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Room bookings and lodge services
            </p>
          </div>
        </div>

        {/* Quick Stats (Optional) */}
        <div style={{ marginTop: '40px' }}>
          <div className="card fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>
              Quick Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#667eea', marginBottom: '4px' }}>
                  {new Date().toLocaleDateString()}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Today's Date</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '4px' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Current Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;