import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  user: any;
  token: string;
  onBack: () => void;
}

type Tab = 'items' | 'users';

interface Item {
  id: number;
  name: string;
  category: string;
  section: 'bar' | 'restaurant' | 'lodge';
  price: number;
  stock: number;
  low_stock_alert: number;
  color?: string;
  description?: string;
  is_active: number;
}

interface User {
  id: number;
  username: string;
  role: string;
  full_name: string;
  created_at: string;
}

function AdminPanel({ user, token, onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSection, setFilterSection] = useState<string>('all');

  // Item Management States
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    section: 'bar' as 'bar' | 'restaurant' | 'lodge',
    price: 0,
    stock: 0,
    low_stock_alert: 10,
    description: ''
  });

  // User Management States
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'cashier'
  });

  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, filterSection]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = filterSection === 'all'
        ? 'http://localhost:3000/api/items'
        : `http://localhost:3000/api/items?section=${filterSection}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      alert('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Item Management Functions
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemForm)
      });

      if (response.ok) {
        alert('Item added successfully!');
        setShowAddItemForm(false);
        setItemForm({ name: '', category: '', section: 'bar', price: 0, stock: 0, low_stock_alert: 10, description: '' });
        fetchItems();
      } else {
        const error = await response.json();
        alert(`Failed to add item: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to add item');
    }
  };

  const handleUpdateItem = async (itemId: number, updates: Partial<Item>) => {
    try {
      const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        alert('Item updated successfully!');
        setEditingItem(null);
        fetchItems();
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      alert('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId: number, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This will mark it as inactive.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Item deleted successfully!');
        fetchItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  // User Management Functions
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        alert('Cashier account created successfully!');
        setShowAddUserForm(false);
        setUserForm({ username: '', password: '', full_name: '', role: 'cashier' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to create user: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const getSectionColor = (section: string) => {
    switch(section) {
      case 'bar': return '#3b82f6';
      case 'restaurant': return '#10b981';
      case 'lodge': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
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
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Logged in as: <strong>{user.full_name || user.username}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '32px' }}>
          <button
            onClick={() => setActiveTab('items')}
            style={{
              padding: '16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: activeTab === 'items' ? '#667eea' : '#6b7280',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'items' ? '3px solid #667eea' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📦 Item Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: activeTab === 'users' ? '#667eea' : '#6b7280',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #667eea' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👥 User Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'items' && (
          <div>
            {/* Items Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '14px' }}>Filter by Section:</label>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="input"
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Sections</option>
                  <option value="bar">Bar</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="lodge">Lodge</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddItemForm(true)}
                className="btn btn-primary"
              >
                ➕ Add New Item
              </button>
            </div>

            {/* Add Item Form Modal */}
            {showAddItemForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Add New Item</h2>
                  <form onSubmit={handleAddItem}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Item Name *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Category *
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={itemForm.category}
                          onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                          placeholder="e.g., Beer, Meal, Service"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Section *
                        </label>
                        <select
                          className="input"
                          value={itemForm.section}
                          onChange={(e) => setItemForm({ ...itemForm, section: e.target.value as any })}
                          required
                        >
                          <option value="bar">Bar</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="lodge">Lodge</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Price (UGX) *
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) })}
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Stock
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={itemForm.stock}
                          onChange={(e) => setItemForm({ ...itemForm, stock: parseInt(e.target.value) })}
                          min="0"
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                          Low Stock Alert
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={itemForm.low_stock_alert}
                          onChange={(e) => setItemForm({ ...itemForm, low_stock_alert: parseInt(e.target.value) })}
                          min="0"
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Description
                      </label>
                      <textarea
                        className="input"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        rows={3}
                        placeholder="Optional item description"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddItemForm(false);
                          setItemForm({ name: '', category: '', section: 'bar', price: 0, stock: 0, low_stock_alert: 10, description: '' });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Add Item
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                Items List ({items.length} items)
              </h2>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                </div>
              ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No items found. Add your first item to get started.
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
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: `${getSectionColor(item.section)}20`,
                              color: getSectionColor(item.section),
                              textTransform: 'capitalize'
                            }}>
                              {item.section}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '12px', color: '#6b7280' }}>
                            {item.category}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {editingItem?.id === item.id ? (
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                style={{ width: '100px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                              />
                            ) : (
                              item.price.toLocaleString()
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {editingItem?.id === item.id ? (
                              <input
                                type="number"
                                value={editingItem.stock}
                                onChange={(e) => setEditingItem({ ...editingItem, stock: parseInt(e.target.value) })}
                                style={{ width: '80px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px' }}
                              />
                            ) : (
                              <span style={{ color: item.stock <= item.low_stock_alert ? '#ef4444' : '#6b7280' }}>
                                {item.stock}
                                {item.stock <= item.low_stock_alert && ' ⚠️'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: item.is_active ? '#dcfce7' : '#fee2e2',
                              color: item.is_active ? '#16a34a' : '#dc2626'
                            }}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {editingItem?.id === item.id ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleUpdateItem(item.id, { price: editingItem.price, stock: editingItem.stock })}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
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
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => setEditingItem(item)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
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
        )}

        {activeTab === 'users' && (
          <div>
            {/* Users Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Cashier Accounts</h2>
              <button
                onClick={() => setShowAddUserForm(true)}
                className="btn btn-primary"
              >
                ➕ Create Cashier Account
              </button>
            </div>

            {/* Add User Form Modal */}
            {showAddUserForm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Create Cashier Account</h2>
                  <form onSubmit={handleAddUser}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={userForm.full_name}
                        onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                        placeholder="e.g., John Doe"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Username *
                      </label>
                      <input
                        type="text"
                        className="input"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        placeholder="e.g., john.doe"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                        Password *
                      </label>
                      <input
                        type="password"
                        className="input"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        placeholder="Create a secure password"
                        required
                        minLength={6}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Minimum 6 characters
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddUserForm(false);
                          setUserForm({ username: '', password: '', full_name: '', role: 'cashier' });
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Create Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="card">
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                All Users ({users.length})
              </h3>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div className="spinner"></div>
                </div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No users found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Full Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Username</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Role</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Created</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(usr => (
                        <tr key={usr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>
                            {usr.full_name || '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {usr.username}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: usr.role === 'admin' ? '#dbeafe' : '#fef3c7',
                              color: usr.role === 'admin' ? '#1e40af' : '#92400e',
                              textTransform: 'capitalize'
                            }}>
                              {usr.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#6b7280', fontSize: '14px' }}>
                            {new Date(usr.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {usr.id === user.id ? (
                              <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                                (You)
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(usr.id, usr.username)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}
                              >
                                Delete
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
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
