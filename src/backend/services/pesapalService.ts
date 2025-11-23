import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

// Pesapal API configuration
const PESAPAL_ENV = process.env.PESAPAL_ENVIRONMENT || 'sandbox';
const PESAPAL_BASE_URL = PESAPAL_ENV === 'production'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || '';
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || '';
const PESAPAL_IPN_URL = process.env.PESAPAL_IPN_URL || 'http://localhost:3000/api/payment/callback';

// Token cache
let accessToken: string | null = null;
let tokenExpiry: number | null = null;
let ipnId: string | null = null;

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error?: any;
  message?: string;
}

interface PesapalIPNResponse {
  url: string;
  created_date: string;
  ipn_id: string;
  error?: any;
  message?: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address?: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error?: any;
  message?: string;
}

interface PesapalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error?: any;
}

/**
 * Make HTTP/HTTPS request to Pesapal API
 */
function makeRequest<T>(
  method: string,
  path: string,
  data?: any,
  token?: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PESAPAL_BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const postData = data ? JSON.stringify(data) : null;

    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const options = {
      method,
      headers,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      timeout: 30000
    };

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject({
              statusCode: res.statusCode,
              error: parsed,
              message: parsed.message || 'Pesapal API request failed'
            });
          }
        } catch (e) {
          reject({
            statusCode: res.statusCode,
            error: e,
            message: 'Failed to parse Pesapal response',
            rawResponse: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error,
        message: 'Network error connecting to Pesapal'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'TIMEOUT',
        message: 'Pesapal request timed out'
      });
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

/**
 * Get OAuth2 access token from Pesapal
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  console.log('Fetching new Pesapal access token...');

  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    throw new Error('Pesapal credentials not configured. Please set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in .env');
  }

  try {
    const response = await makeRequest<PesapalAuthResponse>('POST', '/api/Auth/RequestToken', {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    });

    if (response.error) {
      throw new Error(response.message || 'Failed to get access token');
    }

    accessToken = response.token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = new Date(response.expiryDate).getTime() - (5 * 60 * 1000);

    console.log('✓ Pesapal access token obtained');
    return accessToken;
  } catch (error: any) {
    console.error('✗ Failed to get Pesapal access token:', error);
    throw error;
  }
}

/**
 * Register IPN (Instant Payment Notification) URL
 */
export async function registerIPN(): Promise<string> {
  // Return cached IPN ID if available
  if (ipnId) {
    return ipnId;
  }

  console.log('Registering Pesapal IPN...');

  try {
    const token = await getAccessToken();

    const response = await makeRequest<PesapalIPNResponse>(
      'POST',
      '/api/URLSetup/RegisterIPN',
      {
        url: PESAPAL_IPN_URL,
        ipn_notification_type: 'GET'
      },
      token
    );

    if (response.error) {
      throw new Error(response.message || 'Failed to register IPN');
    }

    ipnId = response.ipn_id;
    console.log('✓ Pesapal IPN registered:', ipnId);
    return ipnId;
  } catch (error: any) {
    console.error('✗ Failed to register Pesapal IPN:', error);
    throw error;
  }
}

/**
 * Submit order to Pesapal and get payment redirect URL
 */
export async function submitOrder(orderData: {
  transactionId: string;
  amount: number;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}): Promise<PesapalOrderResponse> {
  console.log(`Submitting order to Pesapal: ${orderData.transactionId}`);

  try {
    const token = await getAccessToken();
    const notificationId = await registerIPN();

    const names = (orderData.customerName || 'Guest Customer').split(' ');
    const firstName = names[0] || 'Guest';
    const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Customer';

    const orderRequest: PesapalOrderRequest = {
      id: orderData.transactionId,
      currency: 'UGX', // Ugandan Shillings
      amount: Math.round(orderData.amount), // Must be integer
      description: orderData.description,
      callback_url: `${PESAPAL_IPN_URL}?transaction_id=${orderData.transactionId}`,
      notification_id: notificationId,
      billing_address: {
        email_address: orderData.customerEmail || 'customer@hgm.com',
        phone_number: orderData.customerPhone || '',
        country_code: 'UG',
        first_name: firstName,
        last_name: lastName,
        line_1: '',
        line_2: '',
        city: 'Kampala',
        state: 'Central',
        postal_code: '',
        zip_code: ''
      }
    };

    const response = await makeRequest<PesapalOrderResponse>(
      'POST',
      '/api/Transactions/SubmitOrderRequest',
      orderRequest,
      token
    );

    if (response.error) {
      throw new Error(response.message || 'Failed to submit order');
    }

    console.log('✓ Pesapal order submitted:', response.order_tracking_id);
    return response;
  } catch (error: any) {
    console.error('✗ Failed to submit Pesapal order:', error);
    throw error;
  }
}

/**
 * Get transaction status from Pesapal
 */
export async function getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
  console.log(`Checking Pesapal transaction status: ${orderTrackingId}`);

  try {
    const token = await getAccessToken();

    const response = await makeRequest<PesapalTransactionStatus>(
      'GET',
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      null,
      token
    );

    if (response.error) {
      throw new Error(response.message || 'Failed to get transaction status');
    }

    console.log(`✓ Transaction status: ${response.payment_status_description} (${response.status_code})`);
    return response;
  } catch (error: any) {
    console.error('✗ Failed to get transaction status:', error);
    throw error;
  }
}

/**
 * Handle IPN callback from Pesapal
 */
export async function handleCallback(orderTrackingId: string, merchantReference: string): Promise<{
  success: boolean;
  status: string;
  transactionDetails?: PesapalTransactionStatus;
  error?: string;
}> {
  console.log(`Processing Pesapal callback: ${orderTrackingId}`);

  try {
    const status = await getTransactionStatus(orderTrackingId);

    // Pesapal status codes:
    // 0 = Invalid
    // 1 = Completed (Success)
    // 2 = Failed
    // 3 = Reversed

    const isSuccess = status.status_code === 1;

    return {
      success: isSuccess,
      status: status.payment_status_description,
      transactionDetails: status
    };
  } catch (error: any) {
    console.error('✗ Failed to process callback:', error);
    return {
      success: false,
      status: 'ERROR',
      error: error.message || 'Failed to process payment callback'
    };
  }
}

/**
 * Validate Pesapal configuration
 */
export function validatePesapalConfig(): {
  isConfigured: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!PESAPAL_CONSUMER_KEY) {
    errors.push('PESAPAL_CONSUMER_KEY is not set');
  }

  if (!PESAPAL_CONSUMER_SECRET) {
    errors.push('PESAPAL_CONSUMER_SECRET is not set');
  }

  if (!PESAPAL_IPN_URL) {
    errors.push('PESAPAL_IPN_URL is not set');
  }

  return {
    isConfigured: errors.length === 0,
    errors
  };
}

// Export configuration info
export const pesapalConfig = {
  environment: PESAPAL_ENV,
  baseUrl: PESAPAL_BASE_URL,
  ipnUrl: PESAPAL_IPN_URL,
  isConfigured: !!PESAPAL_CONSUMER_KEY && !!PESAPAL_CONSUMER_SECRET
};
