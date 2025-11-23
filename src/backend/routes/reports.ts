import express from 'express';
import db from '../database/init';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Daily summary report
router.get('/daily-summary', authenticate, (req: AuthRequest, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const queries = {
    totalSales: `
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM transactions
      WHERE DATE(created_at) = DATE(?)
      AND status = 'completed'
    `,
    transactionCount: `
      SELECT COUNT(*) as count
      FROM transactions
      WHERE DATE(created_at) = DATE(?)
      AND status = 'completed'
    `,
    bySection: `
      SELECT section, 
             COUNT(*) as transaction_count,
             COALESCE(SUM(total_amount), 0) as total_amount
      FROM transactions
      WHERE DATE(created_at) = DATE(?)
      AND status = 'completed'
      GROUP BY section
    `,
    byPaymentMethod: `
      SELECT payment_method,
             COUNT(*) as transaction_count,
             COALESCE(SUM(total_amount), 0) as total_amount
      FROM transactions
      WHERE DATE(created_at) = DATE(?)
      AND status = 'completed'
      GROUP BY payment_method
    `,
    byCashier: `
      SELECT u.full_name, u.username,
             COUNT(t.id) as transaction_count,
             COALESCE(SUM(t.total_amount), 0) as total_amount
      FROM transactions t
      JOIN users u ON t.cashier_id = u.id
      WHERE DATE(t.created_at) = DATE(?)
      AND t.status = 'completed'
      GROUP BY u.id, u.full_name, u.username
      ORDER BY total_amount DESC
    `,
    topItems: `
      SELECT ti.item_name,
             SUM(ti.quantity) as quantity_sold,
             COALESCE(SUM(ti.subtotal), 0) as total_revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE DATE(t.created_at) = DATE(?)
      AND t.status = 'completed'
      GROUP BY ti.item_name
      ORDER BY quantity_sold DESC
      LIMIT 10
    `
  };

  const results: any = {};

  db.get(queries.totalSales, [targetDate], (err, row: any) => {
    results.total_sales = row?.total || 0;

    db.get(queries.transactionCount, [targetDate], (err, row: any) => {
      results.transaction_count = row?.count || 0;

      db.all(queries.bySection, [targetDate], (err, rows) => {
        results.by_section = rows || [];

        db.all(queries.byPaymentMethod, [targetDate], (err, rows) => {
          results.by_payment_method = rows || [];

          db.all(queries.byCashier, [targetDate], (err, rows) => {
            results.by_cashier = rows || [];

            db.all(queries.topItems, [targetDate], (err, rows) => {
              results.top_items = rows || [];

              res.json({
                date: targetDate,
                summary: results
              });
            });
          });
        });
      });
    });
  });
});

// Sales by date range
router.get('/sales-range', authenticate, (req: AuthRequest, res) => {
  const { from_date, to_date, group_by = 'day' } = req.query;

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'from_date and to_date are required' });
  }

  let dateFormat = '%Y-%m-%d';
  if (group_by === 'month') {
    dateFormat = '%Y-%m';
  } else if (group_by === 'week') {
    dateFormat = '%Y-W%W';
  }

  const query = `
    SELECT strftime('${dateFormat}', created_at) as period,
           COUNT(*) as transaction_count,
           COALESCE(SUM(total_amount), 0) as total_amount
    FROM transactions
    WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    AND status = 'completed'
    GROUP BY period
    ORDER BY period
  `;

  db.all(query, [from_date, to_date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Cashier performance report
router.get('/cashier-performance', authenticate, (req: AuthRequest, res) => {
  const { from_date, to_date } = req.query;

  let query = `
    SELECT u.id, u.username, u.full_name,
           COUNT(t.id) as total_transactions,
           COALESCE(SUM(t.total_amount), 0) as total_sales,
           COALESCE(AVG(t.total_amount), 0) as avg_transaction_value,
           MIN(t.created_at) as first_transaction,
           MAX(t.created_at) as last_transaction
    FROM users u
    LEFT JOIN transactions t ON u.id = t.cashier_id AND t.status = 'completed'
    WHERE u.role = 'cashier'
  `;

  const params: any[] = [];

  if (from_date) {
    query += ' AND DATE(t.created_at) >= DATE(?)';
    params.push(from_date);
  }

  if (to_date) {
    query += ' AND DATE(t.created_at) <= DATE(?)';
    params.push(to_date);
  }

  query += ' GROUP BY u.id, u.username, u.full_name ORDER BY total_sales DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Section performance (Bar, Restaurant, Lodge)
router.get('/section-performance', authenticate, (req: AuthRequest, res) => {
  const { from_date, to_date } = req.query;

  let query = `
    SELECT section,
           COUNT(*) as transaction_count,
           COALESCE(SUM(total_amount), 0) as total_sales,
           COALESCE(AVG(total_amount), 0) as avg_transaction_value
    FROM transactions
    WHERE status = 'completed'
  `;

  const params: any[] = [];

  if (from_date) {
    query += ' AND DATE(created_at) >= DATE(?)';
    params.push(from_date);
  }

  if (to_date) {
    query += ' AND DATE(created_at) <= DATE(?)';
    params.push(to_date);
  }

  query += ' GROUP BY section ORDER BY total_sales DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Hourly sales pattern
router.get('/hourly-pattern', authenticate, (req: AuthRequest, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const query = `
    SELECT strftime('%H', created_at) as hour,
           COUNT(*) as transaction_count,
           COALESCE(SUM(total_amount), 0) as total_amount
    FROM transactions
    WHERE DATE(created_at) = DATE(?)
    AND status = 'completed'
    GROUP BY hour
    ORDER BY hour
  `;

  db.all(query, [targetDate], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Stock report
router.get('/stock-status', authenticate, (req: AuthRequest, res) => {
  const query = `
    SELECT section, category, name, stock, low_stock_alert, price,
           (stock * price) as stock_value,
           CASE 
             WHEN stock <= 0 THEN 'out_of_stock'
             WHEN stock <= low_stock_alert THEN 'low_stock'
             ELSE 'in_stock'
           END as status
    FROM items
    WHERE is_active = 1
    ORDER BY status DESC, section, category, name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

export default router;