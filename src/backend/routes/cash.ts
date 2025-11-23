import express from 'express';
import db from '../database/init';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Record opening balance
router.post('/opening', authenticate, (req: AuthRequest, res) => {
  const { amount, notes } = req.body;
  const cashier_id = req.user?.id;

  if (amount === undefined || amount < 0) {
    return res.status(400).json({ error: 'Valid opening amount is required' });
  }

  // Check if there's already an opening for today
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT * FROM cash_movements 
     WHERE type = 'opening' 
     AND cashier_id = ?
     AND DATE(created_at) = DATE(?)`,
    [cashier_id, today],
    (err, existing) => {
      if (existing) {
        return res.status(400).json({ error: 'Opening balance already recorded for today' });
      }

      db.run(
        'INSERT INTO cash_movements (type, amount, cashier_id, notes) VALUES (?, ?, ?, ?)',
        ['opening', amount, cashier_id, notes],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.status(201).json({
            id: this.lastID,
            type: 'opening',
            amount,
            message: 'Opening balance recorded successfully'
          });
        }
      );
    }
  );
});

// Record closing balance
router.post('/closing', authenticate, (req: AuthRequest, res) => {
  const { amount, notes } = req.body;
  const cashier_id = req.user?.id;

  if (amount === undefined || amount < 0) {
    return res.status(400).json({ error: 'Valid closing amount is required' });
  }

  const today = new Date().toISOString().split('T')[0];

  // Get opening balance
  db.get(
    `SELECT amount FROM cash_movements 
     WHERE type = 'opening' 
     AND cashier_id = ?
     AND DATE(created_at) = DATE(?)`,
    [cashier_id, today],
    (err, opening: any) => {
      if (!opening) {
        return res.status(400).json({ error: 'No opening balance found for today' });
      }

      // Calculate expected amount (opening + cash sales)
      db.get(
        `SELECT COALESCE(SUM(total_amount), 0) as cash_sales
         FROM transactions
         WHERE cashier_id = ?
         AND payment_method = 'cash'
         AND DATE(created_at) = DATE(?)
         AND status = 'completed'`,
        [cashier_id, today],
        (err, sales: any) => {
          const expected_amount = opening.amount + (sales?.cash_sales || 0);
          const difference = amount - expected_amount;

          db.run(
            `INSERT INTO cash_movements (type, amount, expected_amount, difference, cashier_id, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ['closing', amount, expected_amount, difference, cashier_id, notes],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              res.status(201).json({
                id: this.lastID,
                type: 'closing',
                amount,
                expected_amount,
                difference,
                message: 'Closing balance recorded successfully',
                status: difference === 0 ? 'balanced' : (difference > 0 ? 'over' : 'short')
              });
            }
          );
        }
      );
    }
  );
});

// Get today's cash summary
router.get('/today-summary', authenticate, (req: AuthRequest, res) => {
  const cashier_id = req.user?.id;
  const today = new Date().toISOString().split('T')[0];

  db.get(
    `SELECT amount as opening_balance FROM cash_movements 
     WHERE type = 'opening' 
     AND cashier_id = ?
     AND DATE(created_at) = DATE(?)`,
    [cashier_id, today],
    (err, opening: any) => {
      db.get(
        `SELECT COALESCE(SUM(total_amount), 0) as cash_sales
         FROM transactions
         WHERE cashier_id = ?
         AND payment_method = 'cash'
         AND DATE(created_at) = DATE(?)
         AND status = 'completed'`,
        [cashier_id, today],
        (err, sales: any) => {
          db.get(
            `SELECT amount as closing_balance, difference FROM cash_movements 
             WHERE type = 'closing' 
             AND cashier_id = ?
             AND DATE(created_at) = DATE(?)`,
            [cashier_id, today],
            (err, closing: any) => {
              const openingBalance = opening?.opening_balance || 0;
              const cashSales = sales?.cash_sales || 0;
              const expectedClosing = openingBalance + cashSales;

              res.json({
                opening_balance: openingBalance,
                cash_sales: cashSales,
                expected_closing: expectedClosing,
                actual_closing: closing?.closing_balance || null,
                difference: closing?.difference || null,
                has_opening: !!opening,
                has_closing: !!closing
              });
            }
          );
        }
      );
    }
  );
});

// Get cash movements history
router.get('/movements', authenticate, (req: AuthRequest, res) => {
  const { from_date, to_date, type, cashier_id } = req.query;

  let query = `
    SELECT cm.*, u.username, u.full_name
    FROM cash_movements cm
    JOIN users u ON cm.cashier_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (from_date) {
    query += ' AND DATE(cm.created_at) >= DATE(?)';
    params.push(from_date);
  }

  if (to_date) {
    query += ' AND DATE(cm.created_at) <= DATE(?)';
    params.push(to_date);
  }

  if (type) {
    query += ' AND cm.type = ?';
    params.push(type);
  }

  if (cashier_id) {
    query += ' AND cm.cashier_id = ?';
    params.push(cashier_id);
  }

  query += ' ORDER BY cm.created_at DESC';

  db.all(query, params, (err, movements) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(movements);
  });
});

export default router;