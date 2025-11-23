import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  submitOrder,
  getTransactionStatus,
  handleCallback,
  validatePesapalConfig,
  pesapalConfig
} from '../services/pesapalService';
import { openDb } from '../database/init';

const router = Router();

/**
 * GET /api/payment/config
 * Get Pesapal configuration status
 */
router.get('/config', authenticate, async (req: Request, res: Response) => {
  try {
    const validation = validatePesapalConfig();

    res.json({
      environment: pesapalConfig.environment,
      isConfigured: validation.isConfigured,
      errors: validation.errors,
      ipnUrl: pesapalConfig.ipnUrl
    });
  } catch (error: any) {
    console.error('Error getting Pesapal config:', error);
    res.status(500).json({
      error: 'Failed to get payment configuration',
      message: error.message
    });
  }
});

/**
 * POST /api/payment/initiate
 * Initiate a Pesapal payment
 */
router.post('/initiate', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      transactionId,
      amount,
      description,
      customerEmail,
      customerPhone,
      customerName
    } = req.body;

    // Validate required fields
    if (!transactionId || !amount) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'transactionId and amount are required'
      });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    // Check Pesapal configuration
    const validation = validatePesapalConfig();
    if (!validation.isConfigured) {
      return res.status(500).json({
        error: 'Pesapal not configured',
        message: 'Payment system is not configured. Please contact administrator.',
        details: validation.errors
      });
    }

    // Verify transaction exists in database
    const db = await openDb();
    const transaction = await db.get(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    );

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: `Transaction ${transactionId} does not exist`
      });
    }

    // Check if transaction is already paid
    if (transaction.payment_status === 'completed') {
      return res.status(400).json({
        error: 'Transaction already paid',
        message: 'This transaction has already been completed'
      });
    }

    console.log(`Initiating Pesapal payment for transaction ${transactionId}`);

    // Submit order to Pesapal
    const pesapalResponse = await submitOrder({
      transactionId,
      amount,
      description: description || `HGM POS - Transaction ${transactionId}`,
      customerEmail,
      customerPhone,
      customerName
    });

    // Update transaction with Pesapal tracking ID
    await db.run(
      `UPDATE transactions
       SET pesapal_tracking_id = ?, payment_status = ?
       WHERE id = ?`,
      [pesapalResponse.order_tracking_id, 'pending', transactionId]
    );

    console.log(`✓ Payment initiated: ${pesapalResponse.order_tracking_id}`);

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      orderTrackingId: pesapalResponse.order_tracking_id,
      merchantReference: pesapalResponse.merchant_reference,
      redirectUrl: pesapalResponse.redirect_url,
      transactionId
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      error: 'Failed to initiate payment',
      message: error.message || 'An error occurred while processing your request'
    });
  }
});

/**
 * GET/POST /api/payment/callback
 * Handle Pesapal IPN callback
 */
const handleIPNCallback = async (req: Request, res: Response) => {
  try {
    const { OrderTrackingId, OrderMerchantReference } = req.method === 'GET' ? req.query : req.body;

    if (!OrderTrackingId) {
      console.warn('IPN callback missing OrderTrackingId');
      return res.status(400).json({
        error: 'Missing OrderTrackingId',
        message: 'OrderTrackingId is required'
      });
    }

    console.log(`Processing IPN callback: ${OrderTrackingId}`);

    // Process the callback
    const result = await handleCallback(
      OrderTrackingId as string,
      OrderMerchantReference as string || ''
    );

    if (!result.success) {
      console.error(`Payment failed for ${OrderTrackingId}:`, result.error);
    }

    // Update transaction status in database
    const db = await openDb();

    if (result.transactionDetails) {
      const status = result.success ? 'completed' : 'failed';
      const paymentMethod = result.transactionDetails.payment_method || 'pesapal';

      await db.run(
        `UPDATE transactions
         SET payment_status = ?,
             payment_method = ?,
             payment_reference = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE pesapal_tracking_id = ?`,
        [
          status,
          paymentMethod,
          result.transactionDetails.confirmation_code || OrderTrackingId,
          OrderTrackingId
        ]
      );

      console.log(`✓ Transaction updated: ${status}`);
    }

    // Respond to Pesapal (they expect HTTP 200)
    res.status(200).json({
      success: true,
      message: 'Callback processed',
      status: result.status
    });
  } catch (error: any) {
    console.error('Error processing IPN callback:', error);
    // Still return 200 to Pesapal to prevent retries
    res.status(200).json({
      success: false,
      error: error.message
    });
  }
};

router.get('/callback', handleIPNCallback);
router.post('/callback', handleIPNCallback);

/**
 * GET /api/payment/status/:orderTrackingId
 * Check payment status
 */
router.get('/status/:orderTrackingId', authenticate, async (req: Request, res: Response) => {
  try {
    const { orderTrackingId } = req.params;

    if (!orderTrackingId) {
      return res.status(400).json({
        error: 'Missing orderTrackingId',
        message: 'Order tracking ID is required'
      });
    }

    console.log(`Checking status for: ${orderTrackingId}`);

    // Get status from Pesapal
    const status = await getTransactionStatus(orderTrackingId);

    // Update local database
    const db = await openDb();
    const paymentStatus = status.status_code === 1 ? 'completed' :
                         status.status_code === 2 ? 'failed' :
                         status.status_code === 3 ? 'reversed' : 'pending';

    await db.run(
      `UPDATE transactions
       SET payment_status = ?,
           payment_method = ?,
           payment_reference = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE pesapal_tracking_id = ?`,
      [
        paymentStatus,
        status.payment_method || 'pesapal',
        status.confirmation_code || orderTrackingId,
        orderTrackingId
      ]
    );

    res.json({
      success: true,
      orderTrackingId,
      status: status.payment_status_description,
      statusCode: status.status_code,
      paymentMethod: status.payment_method,
      amount: status.amount,
      currency: status.currency,
      confirmationCode: status.confirmation_code,
      paymentAccount: status.payment_account,
      createdDate: status.created_date
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      error: 'Failed to check payment status',
      message: error.message || 'An error occurred while checking payment status'
    });
  }
});

/**
 * POST /api/payment/cancel
 * Cancel a pending payment
 */
router.post('/cancel/:transactionId', authenticate, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        error: 'Missing transactionId',
        message: 'Transaction ID is required'
      });
    }

    const db = await openDb();

    // Update transaction status to cancelled
    await db.run(
      `UPDATE transactions
       SET payment_status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND payment_status = 'pending'`,
      [transactionId]
    );

    console.log(`✓ Payment cancelled for transaction: ${transactionId}`);

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      transactionId
    });
  } catch (error: any) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({
      error: 'Failed to cancel payment',
      message: error.message
    });
  }
});

export default router;
