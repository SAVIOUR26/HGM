import db from '../database/init';

export interface ReceiptData {
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  transaction: {
    number: string;
    date: string;
    section: string;
    payment_method: string;
    cashier: string;
    customer_name?: string;
  };
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  total: number;
}

export class ReceiptService {
  // Format receipt for thermal printer (ESC/POS commands)
  static formatThermalReceipt(data: ReceiptData): string {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    // ESC/POS commands
    const INIT = ESC + '@'; // Initialize printer
    const CENTER = ESC + 'a' + '1'; // Center align
    const LEFT = ESC + 'a' + '0'; // Left align
    const BOLD_ON = ESC + 'E' + '1'; // Bold on
    const BOLD_OFF = ESC + 'E' + '0'; // Bold off
    const DOUBLE_HEIGHT = GS + '!' + '\x11'; // Double height
    const NORMAL = GS + '!' + '\x00'; // Normal size
    const CUT = GS + 'V' + '\x41' + '\x00'; // Cut paper
    const DRAWER = ESC + 'p' + '\x00' + '\x19' + '\xFA'; // Open cash drawer
    
    let receipt = INIT;
    
    // Header - Business Info
    receipt += CENTER + DOUBLE_HEIGHT + BOLD_ON;
    receipt += `${data.business.name}\n`;
    receipt += NORMAL + BOLD_OFF;
    receipt += `${data.business.address}\n`;
    receipt += `Tel: ${data.business.phone}\n`;
    receipt += `Email: ${data.business.email}\n`;
    receipt += LEFT;
    receipt += '--------------------------------\n';
    
    // Section header (Bar/Restaurant/Lodge)
    receipt += CENTER + BOLD_ON;
    receipt += `${data.transaction.section.toUpperCase()} RECEIPT\n`;
    receipt += BOLD_OFF + LEFT;
    receipt += '--------------------------------\n';
    
    // Transaction details
    receipt += `Receipt No: ${data.transaction.number}\n`;
    receipt += `Date: ${new Date(data.transaction.date).toLocaleString()}\n`;
    receipt += `Cashier: ${data.transaction.cashier}\n`;
    
    if (data.transaction.customer_name) {
      receipt += `Customer: ${data.transaction.customer_name}\n`;
    }
    
    receipt += '--------------------------------\n';
    
    // Items
    receipt += BOLD_ON;
    receipt += 'Item                Qty    Price\n';
    receipt += BOLD_OFF;
    receipt += '--------------------------------\n';
    
    data.items.forEach(item => {
      const itemName = this.truncate(item.item_name, 20);
      const qty = item.quantity.toString();
      const price = this.formatCurrency(item.subtotal);
      
      receipt += `${this.padRight(itemName, 20)}`;
      receipt += `${this.padLeft(qty, 3)} `;
      receipt += `${this.padLeft(price, 9)}\n`;
      
      // Show unit price if quantity > 1
      if (item.quantity > 1) {
        const unitPrice = this.formatCurrency(item.unit_price);
        receipt += `  @ ${unitPrice} each\n`;
      }
    });
    
    receipt += '--------------------------------\n';
    
    // Total
    receipt += BOLD_ON + DOUBLE_HEIGHT;
    receipt += `TOTAL: ${this.formatCurrency(data.total)}\n`;
    receipt += NORMAL + BOLD_OFF;
    receipt += '--------------------------------\n';
    
    // Payment method
    receipt += `Payment: ${this.formatPaymentMethod(data.transaction.payment_method)}\n`;
    receipt += '--------------------------------\n';
    
    // Footer
    receipt += CENTER;
    receipt += 'Thank you for your business!\n';
    receipt += 'Please visit us again\n\n';
    
    receipt += LEFT;
    receipt += '\n\n\n'; // Extra lines before cut
    receipt += CUT; // Cut paper
    
    return receipt;
  }

  // Format receipt for A4/Letter paper (HTML for browser print)
  static formatA4Receipt(data: ReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt - ${data.transaction.number}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 10mm;
            width: 60mm;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .large { font-size: 16px; }
          .divider { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .right { text-align: right; }
          .header { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header center">
          <div class="bold large">${data.business.name}</div>
          <div>${data.business.address}</div>
          <div>Tel: ${data.business.phone}</div>
          <div>${data.business.email}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="center bold">${data.transaction.section.toUpperCase()} RECEIPT</div>
        
        <div class="divider"></div>
        
        <table>
          <tr><td>Receipt No:</td><td class="right">${data.transaction.number}</td></tr>
          <tr><td>Date:</td><td class="right">${new Date(data.transaction.date).toLocaleString()}</td></tr>
          <tr><td>Cashier:</td><td class="right">${data.transaction.cashier}</td></tr>
          ${data.transaction.customer_name ? `<tr><td>Customer:</td><td class="right">${data.transaction.customer_name}</td></tr>` : ''}
        </table>
        
        <div class="divider"></div>
        
        <table>
          <thead>
            <tr class="bold">
              <td>Item</td>
              <td class="center">Qty</td>
              <td class="right">Price</td>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.item_name}</td>
                <td class="center">${item.quantity}</td>
                <td class="right">${this.formatCurrency(item.subtotal)}</td>
              </tr>
              ${item.quantity > 1 ? `<tr><td colspan="3" style="font-size: 10px;">  @ ${this.formatCurrency(item.unit_price)} each</td></tr>` : ''}
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <table>
          <tr class="bold large">
            <td>TOTAL:</td>
            <td class="right">${this.formatCurrency(data.total)}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <div>Payment: ${this.formatPaymentMethod(data.transaction.payment_method)}</div>
        
        <div class="divider"></div>
        
        <div class="center" style="margin-top: 10px;">
          <div>Thank you for your business!</div>
          <div>Please visit us again</div>
        </div>
      </body>
      </html>
    `;
  }

  // Helper methods
  private static formatCurrency(amount: number): string {
    return `UGX ${amount.toLocaleString('en-UG', { minimumFractionDigits: 0 })}`;
  }

  private static formatPaymentMethod(method: string): string {
    const methods: { [key: string]: string } = {
      'cash': 'Cash',
      'card': 'Card',
      'mobile_money': 'Mobile Money',
      'split': 'Split Payment'
    };
    return methods[method] || method;
  }

  private static truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length - 3) + '...' : str;
  }

  private static padRight(str: string, length: number): string {
    return str.padEnd(length, ' ');
  }

  private static padLeft(str: string, length: number): string {
    return str.padStart(length, ' ');
  }

  // Get receipt data from database
  static async getReceiptData(transactionId: number): Promise<ReceiptData | null> {
    return new Promise((resolve, reject) => {
      // First get business settings
      db.get('SELECT * FROM business_settings WHERE id = 1', [], (err, businessSettings: any) => {
        // Use defaults if no settings found
        const business = businessSettings ? {
          name: businessSettings.business_name,
          address: businessSettings.address,
          phone: businessSettings.phone,
          email: businessSettings.email
        } : {
          name: process.env.BUSINESS_NAME || 'HGM Properties Ltd',
          address: process.env.BUSINESS_ADDRESS || 'Kampala, Uganda',
          phone: process.env.BUSINESS_PHONE || '+256-XXX-XXXXXX',
          email: process.env.BUSINESS_EMAIL || 'info@hgmproperties.com'
        };

        // Get transaction data
        db.get(
          `SELECT t.*, u.username, u.full_name
           FROM transactions t
           LEFT JOIN users u ON t.cashier_id = u.id
           WHERE t.id = ?`,
          [transactionId],
          (err, transaction: any) => {
            if (err || !transaction) {
              return resolve(null);
            }

            db.all(
              'SELECT * FROM transaction_items WHERE transaction_id = ?',
              [transactionId],
              (err, items: any) => {
                if (err) {
                  return reject(err);
                }

                const receiptData: ReceiptData = {
                  business,
                  transaction: {
                    number: transaction.transaction_number,
                    date: transaction.created_at,
                    section: transaction.section,
                    payment_method: transaction.payment_method,
                    cashier: transaction.full_name || transaction.username,
                    customer_name: transaction.customer_name
                  },
                  items: items,
                  total: transaction.total_amount
                };

                resolve(receiptData);
              }
            );
          }
        );
      });
    });
  }
}

export default ReceiptService;