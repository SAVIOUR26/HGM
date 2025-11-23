import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/init';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, (req: AuthRequest, res) => {
  db.all(
    'SELECT id, username, role, full_name, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Get single user
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  // Users can only view their own profile unless they're admin
  if (req.user?.role !== 'admin' && req.user?.id !== parseInt(req.params.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.get(
    'SELECT id, username, role, full_name, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Create new user (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { username, password, role, full_name } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  if (!['admin', 'cashier'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be admin or cashier' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role, full_name],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          id: this.lastID,
          username,
          role,
          full_name,
          message: 'User created successfully'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only, or user updating themselves)
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const userId = parseInt(req.params.id);

  // Check permissions
  if (req.user?.role !== 'admin' && req.user?.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { username, password, full_name, role } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (username) {
    updates.push('username = ?');
    params.push(username);
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push('password = ?');
    params.push(hashedPassword);
  }

  if (full_name) {
    updates.push('full_name = ?');
    params.push(full_name);
  }

  // Only admin can change roles
  if (role && req.user?.role === 'admin') {
    updates.push('role = ?');
    params.push(role);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(userId);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  });
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const userId = parseInt(req.params.id);

  // Prevent deleting yourself
  if (req.user?.id === userId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

export default router;