import React, { useState } from 'react';

interface ChangePasswordProps {
  token: string;
  onClose?: () => void;
}

export default function ChangePassword({ token, onClose }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Auto close after 2 seconds if onClose provided
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🔐 Change Password
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Current Password
          </label>
          <input
            type="password"
            className="input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            required
            autoComplete="current-password"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            New Password
          </label>
          <input
            type="password"
            className="input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            fontSize: '14px'
          }}>
            Confirm New Password
          </label>
          <input
            type="password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px',
            background: '#dcfce7',
            color: '#16a34a',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: '1', minWidth: '120px' }}
          >
            {loading ? 'Changing...' : '🔒 Change Password'}
          </button>

          {onClose && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: '1', minWidth: '120px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#1e40af'
      }}>
        💡 <strong>Password Requirements:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '8px', lineHeight: '1.6' }}>
          <li>Minimum 6 characters</li>
          <li>Use a strong, unique password</li>
          <li>Don't share your password with anyone</li>
        </ul>
      </div>
    </div>
  );
}
