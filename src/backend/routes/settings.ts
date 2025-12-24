import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { openDb } from '../database/init';

const router = express.Router();

/**
 * GET /api/settings/business
 * Get business settings
 */
router.get('/business', authenticate, async (req: AuthRequest, res) => {
  try {
    const db = await openDb();
    let settings = await db.get('SELECT * FROM business_settings WHERE id = 1');

    // If no settings exist, create default
    if (!settings) {
      await db.run(
        `INSERT INTO business_settings (business_name, phone, email, address, footer_message)
         VALUES (?, ?, ?, ?, ?)`,
        ['HGM Properties Ltd', '+256-XXX-XXXXXX', 'info@hgmproperties.com', 'Kampala, Uganda',
         'Thank you for your business!\nPlease visit us again']
      );
      settings = await db.get('SELECT * FROM business_settings WHERE id = 1');
    }

    res.json(settings);
  } catch (error: any) {
    console.error('Error fetching business settings:', error);
    res.status(500).json({ error: 'Failed to fetch business settings', message: error.message });
  }
});

/**
 * PUT /api/settings/business
 * Update business settings
 */
router.put('/business', authenticate, async (req: AuthRequest, res) => {
  try {
    // Only admins can update settings
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update business settings' });
    }

    const { business_name, phone, email, address, footer_message } = req.body;

    if (!business_name || !phone || !email || !address) {
      return res.status(400).json({ error: 'Business name, phone, email, and address are required' });
    }

    const db = await openDb();

    // Check if settings exist
    const existing = await db.get('SELECT * FROM business_settings WHERE id = 1');

    if (existing) {
      // Update existing settings
      await db.run(
        `UPDATE business_settings
         SET business_name = ?, phone = ?, email = ?, address = ?, footer_message = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [business_name, phone, email, address, footer_message || 'Thank you for your business!\nPlease visit us again']
      );
    } else {
      // Insert new settings
      await db.run(
        `INSERT INTO business_settings (business_name, phone, email, address, footer_message)
         VALUES (?, ?, ?, ?, ?)`,
        [business_name, phone, email, address, footer_message || 'Thank you for your business!\nPlease visit us again']
      );
    }

    const updated = await db.get('SELECT * FROM business_settings WHERE id = 1');

    console.log('✓ Business settings updated');
    res.json({
      success: true,
      message: 'Business settings updated successfully',
      settings: updated
    });
  } catch (error: any) {
    console.error('Error updating business settings:', error);
    res.status(500).json({ error: 'Failed to update business settings', message: error.message });
  }
});

export default router;
