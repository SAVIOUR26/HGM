import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ReceiptService } from '../services/receiptService';
import { PrinterService } from '../services/printerService';

const router = express.Router();

// Get receipt data (for preview)
router.get('/:transactionId', authenticate, async (req: AuthRequest, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    const receiptData = await ReceiptService.getReceiptData(transactionId);
    
    if (!receiptData) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(receiptData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get receipt data' });
  }
});

// Get receipt as HTML (for browser printing)
router.get('/:transactionId/html', authenticate, async (req: AuthRequest, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    const receiptData = await ReceiptService.getReceiptData(transactionId);
    
    if (!receiptData) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const html = ReceiptService.formatA4Receipt(receiptData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Get receipt as thermal format (ESC/POS)
router.get('/:transactionId/thermal', authenticate, async (req: AuthRequest, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    const receiptData = await ReceiptService.getReceiptData(transactionId);
    
    if (!receiptData) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const thermalReceipt = ReceiptService.formatThermalReceipt(receiptData);
    res.setHeader('Content-Type', 'text/plain');
    res.send(thermalReceipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Print receipt to thermal printer
router.post('/:transactionId/print', authenticate, async (req: AuthRequest, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    const { printerName } = req.body;

    const receiptData = await ReceiptService.getReceiptData(transactionId);

    if (!receiptData) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await PrinterService.printThermal(receiptData, { printerName });

    res.json({
      success: true,
      message: 'Receipt printed successfully',
      transactionId
    });
  } catch (error: any) {
    console.error('Print error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to print receipt',
      message: error.message
    });
  }
});

// Alternative route for printing from payment callback
router.post('/print', authenticate, async (req: AuthRequest, res) => {
  try {
    const { transactionId, printerName } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    const receiptData = await ReceiptService.getReceiptData(transactionId);

    if (!receiptData) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await PrinterService.printThermal(receiptData, { printerName });

    res.json({
      success: true,
      message: 'Receipt printed successfully',
      transactionId
    });
  } catch (error: any) {
    console.error('Print error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to print receipt',
      message: error.message
    });
  }
});

// Open cash drawer
router.post('/cash-drawer', authenticate, async (req: AuthRequest, res) => {
  try {
    await PrinterService.openCashDrawer();
    res.json({
      success: true,
      message: 'Cash drawer opened'
    });
  } catch (error: any) {
    console.error('Cash drawer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to open cash drawer',
      message: error.message
    });
  }
});

// Test print
router.post('/test-print', authenticate, async (req: AuthRequest, res) => {
  try {
    const { printerName } = req.body;
    await PrinterService.testPrint(printerName);
    res.json({
      success: true,
      message: 'Test print sent successfully'
    });
  } catch (error: any) {
    console.error('Test print error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test print',
      message: error.message
    });
  }
});

// Get available printers
router.get('/printers', authenticate, async (req: AuthRequest, res) => {
  try {
    const printers = await PrinterService.getAvailablePrinters();
    res.json({
      success: true,
      printers
    });
  } catch (error: any) {
    console.error('Get printers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get printers',
      message: error.message,
      printers: []
    });
  }
});

export default router;