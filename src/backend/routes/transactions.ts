import express from 'express';
import db from '../database/init';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create new transaction
router.post('/', authenticate, (req: AuthRequest, res) => {
  const { items, payment_method, payment_details, section, customer_name, lodge_booking } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Transaction must contain at least one item' });
  }

  if (!payment_method || !section) {
    return res.status(400).json({ error: 'Payment method and section are required' });
  }

  // Calculate total
  const total_amount = items.reduce((sum: number, item: any) => {
    return sum + (item.unit_price * item.quantity);
  }, 0);

  const transaction_number = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const cashier_id = req.user?.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert transaction
    db.run(
      `INSERT INTO transactions (transaction_number, total_amount, payment_method, payment_details, section, cashier_id, customer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transaction_number, total_amount, payment_method, JSON.stringify(payment_details), section, cashier_id, customer_name],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to create transaction' });
        }

        const transaction_id = this.lastID;

        // Insert transaction items
        const itemStmt = db.prepare(`
          INSERT INTO transaction_items (transaction_id, item_id, item_name, quantity, unit_price, subtotal)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const stockStmt = db.prepare(`
          INSERT INTO stock_movements (item_id, type, quantity, reference, user_id)
          VALUES (?, 'out', ?, ?, ?)
        `);

        const updateStockStmt = db.prepare(`
          UPDATE items SET stock = stock - ? WHERE id = ?
        `);

        let hasError = false;

        items.forEach((item: any) => {
          const subtotal = item.unit_price * item.quantity;

          itemStmt.run([transaction_id, item.item_id, item.item_name, item.quantity, item.unit_price, subtotal], (err) => {
            if (err) hasError = true;
          });

          // Update stock if item has stock tracking
          if (item.track_stock) {
            stockStmt.run([item.item_id, item.quantity, transaction_number, cashier_id]);
            updateStockStmt.run([item.quantity, item.item_id]);
          }
        });

        itemStmt.finalize();
        stockStmt.finalize();
        updateStockStmt.finalize();

        if (hasError) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to add transaction items' });
        }

        // If lodge booking, create booking record
        if (section === 'lodge' && lodge_booking) {
          db.run(
            `INSERT INTO lodge_bookings (transaction_id, room_type, duration_type, customer_name, customer_phone, check_in, total_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              transaction_id,
              lodge_booking.room_type,
              lodge_booking.duration_type,
              customer_name,
              lodge_booking.customer_phone,
              new Date().toISOString(),
              total_amount
            ]
          );
        }

        db.run('COMMIT');

        res.status(201).json({
          transaction_id,
          transaction_number,
          total_amount,
          message: 'Transaction completed successfully'
        });
      }
    );
  });
});

// Get all transactions (with filters)
router.get('/', authenticate, (req: AuthRequest, res) => {
  const { section, cashier_id, from_date, to_date, payment_method, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT t.*, u.username as cashier_name, u.full_name as cashier_full_name
    FROM transactions t
    LEFT JOIN users u ON t.cashier_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (section) {
    query += ' AND t.section = ?';
    params.push(section);
  }

  if (cashier_id) {
    query += ' AND t.cashier_id = ?';
    params.push(cashier_id);
  }

  if (from_date) {
    query += ' AND DATE(t.created_at) >= DATE(?)';
    params.push(from_date);
  }

  if (to_date) {
    query += ' AND DATE(t.created_at) <= DATE(?)';
    params.push(to_date);
  }

  if (payment_method) {
    query += ' AND t.payment_method = ?';
    params.push(payment_method);
  }

  query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(transactions);
  });
});

// Get single transaction with items
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  db.get(
    `SELECT t.*, u.username as cashier_name, u.full_name as cashier_full_name
     FROM transactions t
     LEFT JOIN users u ON t.cashier_id = u.id
     WHERE t.id = ?`,
    [req.params.id],
    (err, transaction) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Get transaction items
      db.all(
        'SELECT * FROM transaction_items WHERE transaction_id = ?',
        [req.params.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            ...transaction,
            items
          });
        }
      );
    }
  );
});

// Get transaction receipt data
router.get('/:id/receipt', authenticate, (req: AuthRequest, res) => {
  db.get(
    `SELECT t.*, u.username as cashier_name, u.full_name as cashier_full_name
     FROM transactions t
     LEFT JOIN users u ON t.cashier_id = u.id
     WHERE t.id = ?`,
    [req.params.id],
    (err, transaction: any) => {
      if (err || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      db.all(
        'SELECT * FROM transaction_items WHERE transaction_id = ?',
        [req.params.id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const receiptData = {
            business: {
              name: process.env.BUSINESS_NAME,
              address: process.env.BUSINESS_ADDRESS,
              phone: process.env.BUSINESS_PHONE,
              email: process.env.BUSINESS_EMAIL
            },
            transaction: {
              number: transaction.transaction_number,
              date: transaction.created_at,
              section: transaction.section,
              payment_method: transaction.payment_method,
              cashier: transaction.cashier_full_name || transaction.cashier_name,
              customer_name: transaction.customer_name
            },
            items: items,
            total: transaction.total_amount
          };

          res.json(receiptData);
        }
      );
    }
  );
});

export default router;