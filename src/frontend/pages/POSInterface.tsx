import React, { useState, useEffect } from 'react';

interface POSInterfaceProps {
  section: 'bar' | 'restaurant' | 'lodge';
  user: any;
  token: string;
  onBack: () => void;
}

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_path?: string;
  color?: string;
}

interface CartItem extends Item {
  quantity: number;
}

interface PaymentModalData {
  transactionId: number;
  transactionNumber: string;
  orderTrackingId?: string;
  redirectUrl?: string;
  paymentMethod: string;
  amount: number;
  status: 'initiating' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message?: string;
}

function POSInterface({ section, user, token, onBack }: POSInterfaceProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymentModalData | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const sectionColors = {
    bar: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', icon: '🍺' },
    restaurant: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '🍽️' },
    lodge: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🏨' }
  };

  useEffect(() => {
    fetchItems();
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [section]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/items?section=${section}&active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: Item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity } : c));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Auto-print receipt after successful payment
  const printReceipt = async (transactionId: number, transactionNumber: string) => {
    try {
      console.log(`Auto-printing receipt for transaction ${transactionId}...`);

      const response = await fetch('http://localhost:3000/api/receipt/print', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId
        })
      });

      if (!response.ok) {
        throw new Error('Print request failed');
      }

      console.log(`✓ Receipt printed successfully for #${transactionNumber}`);
    } catch (error) {
      console.error('Auto-print failed:', error);
      // Don't block transaction completion if printing fails
      // User can manually reprint later if needed
    }
  };

  // Open cash drawer manually
  const openCashDrawer = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/receipt/cash-drawer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to open cash drawer');
      }

      alert('Cash drawer opened');
    } catch (error: any) {
      console.error('Cash drawer error:', error);
      alert(error.message || 'Failed to open cash drawer');
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const transactionData = {
        items: cart.map(item => ({
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          track_stock: item.stock > 0
        })),
        payment_method: paymentMethod,
        section: section,
        total_amount: total
      };

      // Step 1: Create transaction
      const response = await fetch('http://localhost:3000/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const result = await response.json();

      // Handle cash payment (direct completion)
      if (paymentMethod === 'cash') {
        // Auto-print receipt
        await printReceipt(result.id, result.transaction_number);

        alert(`Transaction completed! Receipt #${result.transaction_number}`);
        setCart([]);
        setProcessing(false);
        return;
      }

      // Handle card/mobile_money payment (Pesapal integration)
      setPaymentModal({
        transactionId: result.id,
        transactionNumber: result.transaction_number,
        paymentMethod,
        amount: total,
        status: 'initiating',
        message: 'Initiating payment...'
      });

      // Step 2: Initiate Pesapal payment
      const paymentResponse = await fetch('http://localhost:3000/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: result.id,
          amount: total,
          description: `${section.toUpperCase()} - Order #${result.transaction_number}`,
          customerEmail: user.email || 'customer@hgm.com',
          customerPhone: '',
          customerName: user.full_name || user.username
        })
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.message || 'Failed to initiate payment');
      }

      const paymentData = await paymentResponse.json();

      setPaymentModal(prev => prev ? {
        ...prev,
        orderTrackingId: paymentData.orderTrackingId,
        redirectUrl: paymentData.redirectUrl,
        status: 'pending',
        message: paymentMethod === 'card'
          ? 'Click the button below to complete payment'
          : 'Scan QR code or follow instructions to complete payment'
      } : null);

      // Start polling for payment status
      startStatusPolling(paymentData.orderTrackingId);

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Transaction failed. Please try again.');
      setPaymentModal(null);
      setProcessing(false);
    }
  };

  const startStatusPolling = (orderTrackingId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for 5 minutes (60 * 5 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`http://localhost:3000/api/payment/status/${orderTrackingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const statusData = await response.json();

          // Status codes: 0=Invalid, 1=Completed, 2=Failed, 3=Reversed
          if (statusData.statusCode === 1) {
            // Payment successful
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentModal(prev => prev ? {
              ...prev,
              status: 'completed',
              message: 'Payment completed successfully!'
            } : null);

            // Auto-print receipt
            if (paymentModal?.transactionId && paymentModal?.transactionNumber) {
              await printReceipt(paymentModal.transactionId, paymentModal.transactionNumber);
            }

            setTimeout(() => {
              setPaymentModal(null);
              setCart([]);
              setProcessing(false);
              alert(`Payment successful! Receipt #${paymentModal?.transactionNumber}`);
            }, 2000);

          } else if (statusData.statusCode === 2 || statusData.statusCode === 3) {
            // Payment failed or reversed
            clearInterval(interval);
            setStatusCheckInterval(null);
            setPaymentModal(prev => prev ? {
              ...prev,
              status: 'failed',
              message: `Payment ${statusData.statusCode === 3 ? 'reversed' : 'failed'}. Please try again.`
            } : null);

          } else {
            // Still pending
            setPaymentModal(prev => prev ? {
              ...prev,
              status: 'processing',
              message: 'Waiting for payment confirmation...'
            } : null);
          }
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPaymentModal(prev => prev ? {
            ...prev,
            status: 'failed',
            message: 'Payment timeout. Please check transaction status later.'
          } : null);
        }

      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 5000); // Check every 5 seconds

    setStatusCheckInterval(interval);
  };

  const cancelPayment = async () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }

    if (paymentModal?.transactionId) {
      try {
        await fetch(`http://localhost:3000/api/payment/cancel/${paymentModal.transactionId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Cancel payment error:', error);
      }
    }

    setPaymentModal(null);
    setProcessing(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6' }}>
      {/* Left Panel - Products */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: sectionColors[section].bg,
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Back
            </button>
            <span style={{ fontSize: '32px' }}>{sectionColors[section].icon}</span>
            <h1 style={{ fontSize: '24px', fontWeight: '700', textTransform: 'capitalize' }}>
              {section}
            </h1>
          </div>
          <div style={{ fontSize: '14px' }}>
            Cashier: <strong>{user.full_name || user.username}</strong>
          </div>
        </div>

        {/* Search and Categories */}
        <div style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            className="input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedCategory === cat ? sectionColors[section].bg : '#f3f4f6',
                  color: selectedCategory === cat ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="product-tile"
                  onClick={() => addToCart(item)}
                  style={{ borderColor: item.color || '#667eea' }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: item.color || sectionColors[section].bg,
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px'
                  }}>
                    {item.image_path ? '📦' : sectionColors[section].icon}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#1f2937' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#667eea' }}>
                    UGX {item.price.toLocaleString()}
                  </p>
                  {item.stock > 0 && item.stock <= 10 && (
                    <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                      Stock: {item.stock}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div style={{ width: '400px', background: 'white', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e5e7eb' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
            Current Order
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <p>Cart is empty</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Add items to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{
                background: '#f9fafb',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      −
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontWeight: '700', color: '#667eea' }}>
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total and Checkout */}
        {cart.length > 0 && (
          <div style={{ borderTop: '2px solid #e5e7eb', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '800', color: '#1f2937' }}>
                <span>Total:</span>
                <span>UGX {total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                className="btn btn-success"
                onClick={() => handleCheckout('cash')}
                disabled={processing}
                style={{ width: '100%' }}
              >
                💵 Pay Cash
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleCheckout('card')}
                disabled={processing}
                style={{ width: '100%' }}
              >
                💳 Pay Card (Pesapal)
              </button>
              <button
                className="btn"
                onClick={() => handleCheckout('mobile_money')}
                disabled={processing}
                style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}
              >
                📱 Mobile Money (Pesapal)
              </button>
            </div>
          </div>
        )}

        {/* Cash Drawer Control (always visible) */}
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={openCashDrawer}
            disabled={processing}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            💰 Open Cash Drawer
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            {/* Status Icon */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {paymentModal.status === 'initiating' && <div className="spinner" style={{ margin: '0 auto' }}></div>}
              {paymentModal.status === 'pending' && <div style={{ fontSize: '64px' }}>⏳</div>}
              {paymentModal.status === 'processing' && <div className="spinner" style={{ margin: '0 auto' }}></div>}
              {paymentModal.status === 'completed' && <div style={{ fontSize: '64px' }}>✅</div>}
              {paymentModal.status === 'failed' && <div style={{ fontSize: '64px' }}>❌</div>}
            </div>

            {/* Payment Details */}
            <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '16px' }}>
              {paymentModal.status === 'initiating' && 'Initiating Payment'}
              {paymentModal.status === 'pending' && 'Complete Payment'}
              {paymentModal.status === 'processing' && 'Processing Payment'}
              {paymentModal.status === 'completed' && 'Payment Successful!'}
              {paymentModal.status === 'failed' && 'Payment Failed'}
            </h2>

            <div style={{ marginBottom: '24px', color: '#6b7280', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                Order #{paymentModal.transactionNumber}
              </p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                UGX {paymentModal.amount.toLocaleString()}
              </p>
              {paymentModal.message && (
                <p style={{ fontSize: '14px', marginTop: '12px', color: '#667eea' }}>
                  {paymentModal.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentModal.status === 'pending' && paymentModal.redirectUrl && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (paymentModal.paymentMethod === 'card') {
                      window.open(paymentModal.redirectUrl, '_blank');
                    } else {
                      window.location.href = paymentModal.redirectUrl;
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {paymentModal.paymentMethod === 'card' ? 'Open Pesapal Payment Page' : 'Complete Mobile Money Payment'}
                </button>
              )}

              {(paymentModal.status === 'failed' || paymentModal.status === 'completed') && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPaymentModal(null);
                    if (paymentModal.status === 'completed') {
                      setCart([]);
                    }
                    setProcessing(false);
                  }}
                  style={{ width: '100%' }}
                >
                  Close
                </button>
              )}

              {(paymentModal.status === 'pending' || paymentModal.status === 'processing') && (
                <button
                  className="btn"
                  onClick={cancelPayment}
                  style={{ width: '100%', background: '#ef4444', color: 'white' }}
                >
                  Cancel Payment
                </button>
              )}
            </div>

            {/* Payment Instructions */}
            {paymentModal.status === 'pending' && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f3f4f6', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Instructions:</p>
                {paymentModal.paymentMethod === 'card' && (
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Click the button above to open Pesapal payment page</li>
                    <li>Enter your card details on the Pesapal page</li>
                    <li>Complete the payment</li>
                    <li>This window will automatically update once payment is confirmed</li>
                  </ul>
                )}
                {paymentModal.paymentMethod === 'mobile_money' && (
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Click the button above to proceed to payment</li>
                    <li>Select your mobile money provider (MTN/Airtel)</li>
                    <li>Enter your phone number</li>
                    <li>Approve the payment on your phone</li>
                    <li>This window will update automatically</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default POSInterface;
