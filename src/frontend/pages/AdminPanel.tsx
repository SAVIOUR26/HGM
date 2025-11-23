import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  user: any;
  token: string;
  onBack: () => void;
}

function AdminPanel({ user, token, onBack }: AdminPanelProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (itemId: number, newPrice: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price: newPrice })
      });

      if (response.ok) {
        alert('Price updated successfully!');
        fetchItems();
        setEditingItem(null);
      }
    } catch (error) {
      alert('Failed to update price');
    }
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Admin Panel</h1>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
            Manage Items & Prices
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Section</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Price (UGX)</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                        {item.section}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {editingItem?.id === item.id ? (
                          <input
                            type="number"
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                            style={{ width: '120px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                          />
                        ) : (
                          `${item.price.toLocaleString()}`
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {item.stock}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {editingItem?.id === item.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleUpdatePrice(item.id, editingItem.price)}
                              style={{
                                padding: '6px 12px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              style={{
                                padding: '6px 12px',
                                background: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingItem(item)}
                            style={{
                              padding: '6px 12px',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Edit Price
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;