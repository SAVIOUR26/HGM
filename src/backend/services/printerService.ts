import { ReceiptService, ReceiptData } from './receiptService';
import fs from 'fs';
import path from 'path';

// Thermal printer support using ESC/POS
let escpos: any;
let USB: any;

// Try to load escpos libraries (they may not be available in all environments)
try {
  escpos = require('escpos');
  USB = require('escpos-usb');
  escpos.USB = USB;
} catch (error) {
  console.warn('ESC/POS USB libraries not available. Printing will use fallback methods.');
}

export interface PrinterOptions {
  printerName?: string;
  encoding?: string;
  width?: number;
}

export class PrinterService {
  private static printerCache: any = null;

  /**
   * Get the default thermal printer
   */
  private static async getThermalPrinter(): Promise<any> {
    if (!escpos || !USB) {
      throw new Error('Thermal printer libraries not available');
    }

    // Try to get USB printer
    try {
      const device = new USB();
      const printer = new escpos.Printer(device, {
        encoding: 'GB18030' // Default encoding for international characters
      });

      return { device, printer };
    } catch (error) {
      throw new Error('No thermal printer found. Please connect a USB thermal printer.');
    }
  }

  /**
   * Print receipt to thermal printer via USB
   */
  static async printThermal(receiptData: ReceiptData, options: PrinterOptions = {}): Promise<void> {
    try {
      // Try thermal printer first
      if (escpos && USB) {
        await this.printToThermalPrinter(receiptData, options);
      } else {
        // Fallback: Save to file for manual printing
        await this.printToFile(receiptData, 'thermal');
      }
    } catch (error: any) {
      console.error('Thermal print failed:', error);
      // Fallback to file if thermal printer fails
      await this.printToFile(receiptData, 'thermal');
      throw error;
    }
  }

  /**
   * Print to actual thermal printer using ESC/POS
   */
  private static async printToThermalPrinter(receiptData: ReceiptData, options: PrinterOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { device, printer } = await this.getThermalPrinter();

        device.open((err: any) => {
          if (err) {
            reject(new Error('Failed to open printer: ' + err.message));
            return;
          }

          try {
            // Initialize printer
            printer
              .font('a')
              .align('ct')
              .style('bu')
              .size(1, 1);

            // Business name (large and bold)
            printer
              .size(2, 2)
              .text(receiptData.business.name)
              .size(1, 1)
              .text(receiptData.business.address)
              .text(`Tel: ${receiptData.business.phone}`)
              .text(receiptData.business.email)
              .drawLine();

            // Section header
            printer
              .align('ct')
              .style('b')
              .text(`${receiptData.transaction.section.toUpperCase()} RECEIPT`)
              .style('normal')
              .drawLine();

            // Transaction details
            printer
              .align('lt')
              .text(`Receipt No: ${receiptData.transaction.number}`)
              .text(`Date: ${new Date(receiptData.transaction.date).toLocaleString()}`)
              .text(`Cashier: ${receiptData.transaction.cashier}`);

            if (receiptData.transaction.customer_name) {
              printer.text(`Customer: ${receiptData.transaction.customer_name}`);
            }

            printer.drawLine();

            // Items header
            printer
              .style('b')
              .text('Item                Qty    Price')
              .style('normal')
              .drawLine();

            // Items
            receiptData.items.forEach(item => {
              const itemName = this.truncateString(item.item_name, 20);
              const qty = item.quantity.toString().padStart(3);
              const price = this.formatCurrency(item.subtotal).padStart(9);

              printer.text(`${itemName.padEnd(20)}${qty} ${price}`);

              if (item.quantity > 1) {
                const unitPrice = this.formatCurrency(item.unit_price);
                printer.text(`  @ ${unitPrice} each`);
              }
            });

            printer.drawLine();

            // Payment method
            printer.text(`Payment: ${receiptData.transaction.payment_method.replace('_', ' ').toUpperCase()}`);
            printer.drawLine();

            // Total
            printer
              .align('ct')
              .style('b')
              .size(2, 2)
              .text(`TOTAL: ${this.formatCurrency(receiptData.total)}`)
              .size(1, 1)
              .style('normal')
              .drawLine();

            // Footer
            printer
              .align('ct')
              .text('Thank you for your business!')
              .text('Please come again')
              .newLine()
              .text('Powered by HGM POS')
              .newLine()
              .newLine()
              .newLine();

            // Cut paper
            printer.cut();

            // Close the printer
            printer.close(() => {
              console.log('✓ Receipt printed successfully');
              resolve();
            });

          } catch (printError: any) {
            device.close();
            reject(new Error('Print error: ' + printError.message));
          }
        });

      } catch (error: any) {
        reject(error);
      }
    });
  }

  /**
   * Fallback: Save receipt to file
   */
  private static async printToFile(receiptData: ReceiptData, type: 'thermal' | 'a4'): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp', 'receipts');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    let filePath: string;
    let content: string;

    if (type === 'thermal') {
      content = ReceiptService.formatThermalReceipt(receiptData);
      filePath = path.join(tempDir, `receipt-${timestamp}.txt`);
      fs.writeFileSync(filePath, content, 'utf-8');
    } else {
      content = ReceiptService.formatA4Receipt(receiptData);
      filePath = path.join(tempDir, `receipt-${timestamp}.html`);
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    console.log(`✓ Receipt saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Print to A4/Letter printer (HTML to PDF)
   */
  static async printA4(receiptData: ReceiptData): Promise<string> {
    return await this.printToFile(receiptData, 'a4');
  }

  /**
   * Open cash drawer via ESC/POS command
   */
  static async openCashDrawer(): Promise<void> {
    try {
      // Try to open via thermal printer first
      if (escpos && USB) {
        await this.openDrawerViaThermalPrinter();
      } else {
        // Fallback: Just log the action
        console.log('Cash drawer open command sent (simulated)');
      }
    } catch (error: any) {
      console.error('Cash drawer open failed:', error);
      // Don't throw error - cash drawer failure shouldn't stop transaction
    }
  }

  /**
   * Open cash drawer via thermal printer
   */
  private static async openDrawerViaThermalPrinter(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { device, printer } = await this.getThermalPrinter();

        device.open((err: any) => {
          if (err) {
            reject(new Error('Failed to open printer for drawer command'));
            return;
          }

          try {
            // Send ESC/POS cash drawer open command
            // ESC p m t1 t2 (0x1B 0x70 0x00 0x19 0xFA)
            printer.cashdraw(2); // or printer.cashdraw(5) depending on drawer pin

            printer.close(() => {
              console.log('✓ Cash drawer opened');
              resolve();
            });
          } catch (error: any) {
            device.close();
            reject(error);
          }
        });
      } catch (error: any) {
        console.warn('Cash drawer open failed (no printer found)');
        resolve(); // Don't fail the transaction
      }
    });
  }

  /**
   * Get available printers (for Electron integration)
   */
  static async getAvailablePrinters(): Promise<Array<{ name: string; type: string }>> {
    const printers: Array<{ name: string; type: string }> = [];

    // Check for USB thermal printers
    if (escpos && USB) {
      try {
        const devices = USB.findPrinter();
        if (devices && devices.length > 0) {
          devices.forEach((device: any, index: number) => {
            printers.push({
              name: `USB Thermal Printer ${index + 1}`,
              type: 'thermal-usb'
            });
          });
        }
      } catch (error) {
        console.warn('No USB thermal printers found');
      }
    }

    // Note: System printers (Windows/macOS) will be detected by Electron
    // and can be accessed via the Electron printing API

    return printers;
  }

  /**
   * Test print function
   */
  static async testPrint(printerName?: string): Promise<void> {
    const testData: ReceiptData = {
      business: {
        name: 'HGM Properties Ltd',
        address: 'Kampala, Uganda',
        phone: '+256-XXX-XXXXXX',
        email: 'info@hgm.com'
      },
      transaction: {
        number: 'TEST-001',
        date: new Date().toISOString(),
        section: 'test',
        payment_method: 'cash',
        cashier: 'Test User'
      },
      items: [
        {
          item_name: 'Test Item 1',
          quantity: 2,
          unit_price: 5000,
          subtotal: 10000
        },
        {
          item_name: 'Test Item 2',
          quantity: 1,
          unit_price: 3000,
          subtotal: 3000
        }
      ],
      total: 13000
    };

    await this.printThermal(testData, { printerName });
  }

  /**
   * Helper: Truncate string to specified length
   */
  private static truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Helper: Format currency (UGX)
   */
  private static formatCurrency(amount: number): string {
    return amount.toLocaleString('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}

export default PrinterService;
