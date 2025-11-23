import express from 'express';
import db from '../database/init';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all items (optionally filter by section)
router.get('/', authenticate, (req: AuthRequest, res) => {
  const { section, category, active } = req.query;
  
  let query = 'SELECT * FROM items WHERE 1=1';
  const params: any[] = [];

  if (section) {
    query += ' AND section = ?';
    params.push(section);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (active !== undefined) {
    query += ' AND is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }

  query += ' ORDER BY section, category, name';

  db.all(query, params, (err, items) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(items);
  });
});

// Get single item
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  db.get('SELECT * FROM items WHERE id = ?', [req.params.id], (err, item) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  });
});

// Create new item (admin only)
router.post('/', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const { name, category, section, price, stock, low_stock_alert, image_path, color, description } = req.body;

  if (!name || !category || !section || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO items (name, category, section, price, stock, low_stock_alert, image_path, color, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, category, section, price, stock || 0, low_stock_alert || 10, image_path, color || '#3b82f6', description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ id: this.lastID, message: 'Item created successfully' });
    }
  );
});

// Update item (admin only)
router.put('/:id', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const { name, category, section, price, stock, low_stock_alert, image_path, color, description, is_active } = req.body;

  const query = `
    UPDATE items 
    SET name = COALESCE(?, name),
        category = COALESCE(?, category),
        section = COALESCE(?, section),
        price = COALESCE(?, price),
        stock = COALESCE(?, stock),
        low_stock_alert = COALESCE(?, low_stock_alert),
        image_path = COALESCE(?, image_path),
        color = COALESCE(?, color),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    query,
    [name, category, section, price, stock, low_stock_alert, image_path, color, description, is_active, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item updated successfully' });
    }
  );
});

// Delete item (admin only - soft delete)
router.delete('/:id', authenticate, requireAdmin, (req: AuthRequest, res) => {
  db.run(
    'UPDATE items SET is_active = 0 WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item deleted successfully' });
    }
  );
});

// Get low stock items
router.get('/alerts/low-stock', authenticate, (req: AuthRequest, res) => {
  db.all(
    'SELECT * FROM items WHERE stock <= low_stock_alert AND is_active = 1 ORDER BY stock ASC',
    [],
    (err, items) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(items);
    }
  );
});

export default router;