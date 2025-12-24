import React from 'react';
import ChangePassword from '../components/ChangePassword';

interface ProfileProps {
  user: any;
  token: string;
  onBack: () => void;
}

export default function Profile({ user, token, onBack }: ProfileProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                👤 My Profile
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                Manage your account settings and password
              </p>
            </div>
            <button
              onClick={onBack}
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        {/* User Info Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ℹ️ Account Information
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Username
              </label>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {user.username}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                Role
              </label>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {user.role === 'admin' ? '👑 Administrator' : '💼 Cashier'}
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                User ID
              </label>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: 'monospace'
              }}>
                #{user.id}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <ChangePassword token={token} />
        </div>

        {/* Security Tips */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#92400e'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Security Tips
          </div>
          <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
            <li>Change your password regularly (every 3-6 months)</li>
            <li>Use a strong password with at least 8 characters</li>
            <li>Never share your password with anyone</li>
            <li>Log out when you're done using the system</li>
            {user.role === 'admin' && (
              <li>As an admin, you have full access - keep your credentials secure!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
