import React, { useState, useEffect } from 'react';

interface ReportsProps {
  user: any;
  token: string;
  onBack: () => void;
}

function Reports({ user, token, onBack }: ReportsProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDailySummary();
  }, [selectedDate]);

  const fetchDailySummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/reports/daily-summary?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ 
        background: 'white',
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} className="btn btn-secondary">
            ← Back
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Reports Dashboard</h1>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input"
          style={{ width: 'auto' }}
        />
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Sales</div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>
              UGX {(summary?.total_sales || 0).toLocaleString()}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Transactions</div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>
              {summary?.transaction_count || 0}
            </div>
          </div>
        </div>

        {/* Sales by Section */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Sales by Section</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {summary?.by_section?.map((section: any) => (
              <div key={section.section} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', textTransform: 'capitalize', marginBottom: '4px' }}>
                    {section.section === 'bar' ? '🍺' : section.section === 'restaurant' ? '🍽️' : '🏨'} {section.section}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {section.transaction_count} transactions
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
                  UGX {section.total_amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Payment Methods</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {summary?.by_payment_method?.map((payment: any) => (
              <div key={payment.payment_method} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', textTransform: 'capitalize', marginBottom: '4px' }}>
                    {payment.payment_method === 'cash' ? '💵' : payment.payment_method === 'card' ? '💳' : '📱'} {payment.payment_method.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {payment.transaction_count} transactions
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                  UGX {payment.total_amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Top Selling Items</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Item</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Quantity Sold</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Revenue (UGX)</th>
                </tr>
              </thead>
              <tbody>
                {summary?.top_items?.map((item: any, index: number) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{item.item_name}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity_sold}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#667eea', fontWeight: '700' }}>
                      {item.total_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;