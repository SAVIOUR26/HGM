/**
 * Thermal Printer Utility
 * HGM POS System - Browser-based 80mm Thermal Receipt Printing
 */

export interface ReceiptData {
  business: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  transaction: {
    id: number;
    date: string;
    cashier: string;
    payment_method: string;
    customer_name?: string;
  };
  items: Array<{
    item_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  footer: string;
}

/**
 * Generate HTML for 80mm thermal receipt
 */
export function generateThermalReceiptHTML(data: ReceiptData): string {
  const items = data.items.map(item => `
    <tr>
      <td>${item.item_name}</td>
      <td style="text-align: right;">${item.quantity}x</td>
      <td style="text-align: right;">${item.price.toLocaleString()}</td>
      <td style="text-align: right;"><strong>${item.total.toLocaleString()}</strong></td>
    </tr>
  `).join('');

  const customerInfo = data.transaction.customer_name
    ? `<div style="text-align: center; margin: 5px 0;">Customer: ${data.transaction.customer_name}</div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt #${data.transaction.id}</title>
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            margin: 0;
            padding: 0;
          }
        }

        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          max-width: 80mm;
          margin: 0 auto;
          padding: 5mm;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
          background: white;
        }

        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 2px dashed #000;
          padding-bottom: 8px;
        }

        .business-name {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 2px;
        }

        .business-info {
          font-size: 9pt;
          line-height: 1.2;
        }

        .transaction-info {
          margin: 10px 0;
          font-size: 10pt;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 10pt;
        }

        th {
          border-bottom: 1px solid #000;
          padding: 4px 2px;
          text-align: left;
          font-weight: bold;
        }

        td {
          padding: 4px 2px;
          vertical-align: top;
        }

        .totals {
          border-top: 2px solid #000;
          margin-top: 10px;
          padding-top: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
          font-weight: bold;
          font-size: 12pt;
        }

        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px dashed #000;
          font-size: 9pt;
          white-space: pre-line;
        }

        .print-hidden {
          display: none;
        }

        @media screen {
          body {
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            margin: 20px auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="business-name">${data.business.name}</div>
        <div class="business-info">
          ${data.business.address}<br>
          Tel: ${data.business.phone}<br>
          ${data.business.email}
        </div>
      </div>

      <div class="transaction-info">
        <div class="info-row">
          <span>Receipt #:</span>
          <span><strong>${data.transaction.id}</strong></span>
        </div>
        <div class="info-row">
          <span>Date:</span>
          <span>${new Date(data.transaction.date).toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span>Cashier:</span>
          <span>${data.transaction.cashier}</span>
        </div>
        <div class="info-row">
          <span>Payment:</span>
          <span>${data.transaction.payment_method.toUpperCase()}</span>
        </div>
      </div>

      ${customerInfo}

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: right;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>TOTAL:</span>
          <span>UGX ${data.total.toLocaleString()}</span>
        </div>
      </div>

      <div class="footer">
        ${data.footer}
      </div>

      <script class="print-hidden">
        // Auto-print on load
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}

/**
 * Print thermal receipt using browser print dialog
 */
export async function printThermalReceipt(transactionId: number): Promise<boolean> {
  try {
    // Fetch receipt data from API
    const response = await fetch(`/api/receipt?id=${transactionId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch receipt data');
    }

    const receiptData: ReceiptData = await response.json();

    // Generate HTML
    const html = generateThermalReceiptHTML(receiptData);

    // Open in new window and print
    const printWindow = window.open('', '_blank', 'width=300,height=600');

    if (!printWindow) {
      throw new Error('Failed to open print window. Please allow popups for this site.');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then focus and print
    printWindow.onload = () => {
      printWindow.focus();
      // Window will auto-print via the script in HTML
    };

    return true;
  } catch (error) {
    console.error('Print error:', error);
    alert(`Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Show print preview (for testing)
 */
export async function previewReceipt(transactionId: number): Promise<void> {
  try {
    const response = await fetch(`/api/receipt?id=${transactionId}`);
    const receiptData: ReceiptData = await response.json();
    const html = generateThermalReceiptHTML(receiptData);

    const previewWindow = window.open('', '_blank', 'width=400,height=800');
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  } catch (error) {
    console.error('Preview error:', error);
    alert('Failed to preview receipt');
  }
}
