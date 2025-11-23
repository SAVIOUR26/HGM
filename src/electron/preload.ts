import { contextBridge, ipcRenderer } from 'electron';

// Define types for the exposed APIs
export interface ElectronAPI {
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  printer: {
    printReceipt: (receiptData: any) => Promise<{ success: boolean; message: string; error?: string }>;
    getPrinters: () => Promise<any[]>;
    printHtml: (html: string, options?: any) => Promise<{ success: boolean; message: string; error?: string }>;
  };
  cashDrawer: {
    open: () => Promise<{ success: boolean; message: string; error?: string }>;
  };
  file: {
    selectFile: (options?: any) => Promise<string | null>;
    saveFile: (data: string, defaultPath?: string) => Promise<string | null>;
    readFile: (filePath: string) => Promise<string | null>;
  };
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform information
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // Printer APIs
  printer: {
    /**
     * Print a receipt to the thermal printer
     * @param receiptData - Receipt data object containing transaction details
     * @returns Promise with success status and message
     */
    printReceipt: async (receiptData: any) => {
      try {
        const result = await ipcRenderer.invoke('print-receipt', receiptData);
        return result;
      } catch (error: any) {
        return {
          success: false,
          message: 'Failed to print receipt',
          error: error.message
        };
      }
    },

    /**
     * Get list of available printers
     * @returns Promise with array of printer objects
     */
    getPrinters: async () => {
      try {
        const printers = await ipcRenderer.invoke('get-printers');
        return printers;
      } catch (error) {
        console.error('Failed to get printers:', error);
        return [];
      }
    },

    /**
     * Print HTML content (fallback for non-thermal printers)
     * @param html - HTML string to print
     * @param options - Print options (optional)
     * @returns Promise with success status
     */
    printHtml: async (html: string, options?: any) => {
      try {
        const result = await ipcRenderer.invoke('print-html', html, options);
        return result;
      } catch (error: any) {
        return {
          success: false,
          message: 'Failed to print HTML',
          error: error.message
        };
      }
    }
  },

  // Cash Drawer APIs
  cashDrawer: {
    /**
     * Open the cash drawer
     * @returns Promise with success status and message
     */
    open: async () => {
      try {
        const result = await ipcRenderer.invoke('open-cash-drawer');
        return result;
      } catch (error: any) {
        return {
          success: false,
          message: 'Failed to open cash drawer',
          error: error.message
        };
      }
    }
  },

  // File System APIs
  file: {
    /**
     * Open file dialog to select a file
     * @param options - File dialog options (filters, multiple, etc.)
     * @returns Promise with selected file path or null
     */
    selectFile: async (options?: any) => {
      try {
        const filePath = await ipcRenderer.invoke('select-file', options);
        return filePath;
      } catch (error) {
        console.error('Failed to select file:', error);
        return null;
      }
    },

    /**
     * Open save dialog and save data to file
     * @param data - Data to save
     * @param defaultPath - Default file path
     * @returns Promise with saved file path or null
     */
    saveFile: async (data: string, defaultPath?: string) => {
      try {
        const filePath = await ipcRenderer.invoke('save-file', data, defaultPath);
        return filePath;
      } catch (error) {
        console.error('Failed to save file:', error);
        return null;
      }
    },

    /**
     * Read file contents
     * @param filePath - Path to file to read
     * @returns Promise with file contents or null
     */
    readFile: async (filePath: string) => {
      try {
        const contents = await ipcRenderer.invoke('read-file', filePath);
        return contents;
      } catch (error) {
        console.error('Failed to read file:', error);
        return null;
      }
    }
  }
} as ElectronAPI);

// Declare global window interface for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}