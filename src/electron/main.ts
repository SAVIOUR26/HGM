import { app, BrowserWindow, dialog, Menu, shell, ipcMain } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let backendStarted = false;
let isQuitting = false;
let logStream: fs.WriteStream | null = null;

const BACKEND_PORT = process.env.PORT || 3000;
const BACKEND_STARTUP_TIMEOUT = 60000; // Increased to 60 seconds for slow systems
const BACKEND_HEALTH_CHECK_INTERVAL = 2000; // 2 seconds

// Initialize logging
function initializeLogging(): void {
  const isDev = !app.isPackaged;
  const logDir = isDev
    ? path.join(app.getAppPath(), 'logs')
    : path.join(app.getPath('userData'), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `hgm-pos-${Date.now()}.log`);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Keep only last 5 log files
  try {
    const files = fs.readdirSync(logDir)
      .filter(f => f.startsWith('hgm-pos-') && f.endsWith('.log'))
      .sort()
      .reverse();

    files.slice(5).forEach(f => {
      fs.unlinkSync(path.join(logDir, f));
    });
  } catch (err) {
    console.error('Error cleaning old logs:', err);
  }

  log('info', `HGM POS System Starting - Version ${app.getVersion()}`);
  log('info', `Platform: ${process.platform} ${process.arch}`);
  log('info', `Node Version: ${process.versions.node}`);
  log('info', `Electron Version: ${process.versions.electron}`);
  log('info', `App Path: ${app.getAppPath()}`);
  log('info', `User Data: ${app.getPath('userData')}`);
  log('info', `Is Packaged: ${app.isPackaged}`);
  log('info', `Log File: ${logFile}`);
}

function log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  console.log(logMessage);
  if (data) {
    console.log(data);
  }

  if (logStream) {
    logStream.write(logMessage + '\n');
    if (data) {
      logStream.write(JSON.stringify(data, null, 2) + '\n');
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    frame: true,
    backgroundColor: '#667eea',
    show: false,
    title: 'HGM POS System',
    icon: getIconPath()
  });

  // Create application menu
  createMenu();

  // Start backend server
  startBackend()
    .then(() => {
      log('info', '✓ Backend started successfully');
      loadFrontend();
    })
    .catch((err) => {
      log('error', '✗ Backend startup failed:', err);

      const logDir = app.isPackaged
        ? path.join(app.getPath('userData'), 'logs')
        : path.join(app.getAppPath(), 'logs');

      dialog.showErrorBox(
        'Backend Startup Failed',
        `Could not start the POS backend server.\n\n` +
        `Error: ${err.message}\n\n` +
        `Troubleshooting:\n` +
        `• Check if port ${BACKEND_PORT} is already in use\n` +
        `• Ensure you have write permissions\n` +
        `• Check antivirus/firewall settings\n` +
        `• View logs at: ${logDir}\n\n` +
        `The application will now close.`
      );
      app.quit();
    });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.maximize();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      const response = dialog.showMessageBoxSync(mainWindow!, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm Exit',
        message: 'Are you sure you want to close HGM POS System?',
        detail: 'All unsaved work will be lost.'
      });

      if (response === 0) {
        isQuitting = true;
        stopBackend();
        mainWindow?.close();
      }
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function getIconPath(): string {
  if (app.isPackaged) {
    const iconPath = path.join(process.resourcesPath, 'public', 'icon.png');
    log('info', `Icon path (packaged): ${iconPath}`);
    return iconPath;
  }
  const iconPath = path.join(__dirname, '../../public/icon.png');
  log('info', `Icon path (dev): ${iconPath}`);
  return iconPath;
}

async function startBackend(): Promise<void> {
  const isDev = !app.isPackaged;
  log('info', `Starting backend (${isDev ? 'development' : 'production'} mode)...`);

  return new Promise((resolve, reject) => {
    // Setup directories
    const userDataPath = app.getPath('userData');
    const dataDir = path.join(userDataPath, 'data');
    const tempDir = path.join(userDataPath, 'temp');

    log('info', `User Data Path: ${userDataPath}`);
    log('info', `Data Directory: ${dataDir}`);

    // Create necessary directories
    [dataDir, tempDir, path.join(tempDir, 'receipts')].forEach(dir => {
      if (!fs.existsSync(dir)) {
        log('info', `Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Load or create .env file
    const envPath = path.join(userDataPath, '.env');
    if (!fs.existsSync(envPath)) {
      log('info', 'Creating default .env file');
      const defaultEnv = `PORT=${BACKEND_PORT}
DATABASE_PATH=${path.join(dataDir, 'hgm-pos.db').replace(/\\/g, '/')}
JWT_SECRET=${generateSecret()}
NODE_ENV=${isDev ? 'development' : 'production'}
BUSINESS_NAME=HGM Properties Ltd
BUSINESS_ADDRESS=Kampala, Uganda
BUSINESS_PHONE=+256-XXX-XXXXXX
BUSINESS_EMAIL=info@hgmproperties.com
`;
      fs.writeFileSync(envPath, defaultEnv);
    }

    // Load environment variables from .env
    const envVars = loadEnvFile(envPath);

    // Set environment variables
    const env = {
      ...process.env,
      ...envVars,
      PORT: BACKEND_PORT.toString(),
      DATABASE_PATH: path.join(dataDir, 'hgm-pos.db'),
      NODE_ENV: isDev ? 'development' : 'production',
      USER_DATA_PATH: userDataPath
    };

    let command: string;
    let args: string[];
    let options: any;

    if (isDev) {
      // Development: Use node with tsx loader
      command = 'node';
      args = ['--import', 'tsx', 'src/backend/server.ts'];
      options = {
        cwd: app.getAppPath(),
        env,
        shell: process.platform === 'win32'
      };
    } else {
      // Production: Run compiled JavaScript with Node.js
      const backendPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'backend', 'server.js');
      const backendPathAlt = path.join(process.resourcesPath, 'dist', 'backend', 'server.js');

      log('info', `Checking backend paths:`);
      log('info', `  Primary: ${backendPath} - Exists: ${fs.existsSync(backendPath)}`);
      log('info', `  Alt: ${backendPathAlt} - Exists: ${fs.existsSync(backendPathAlt)}`);

      let finalBackendPath = backendPath;
      if (!fs.existsSync(backendPath) && fs.existsSync(backendPathAlt)) {
        finalBackendPath = backendPathAlt;
      }

      if (!fs.existsSync(finalBackendPath)) {
        const error = `Backend server files not found!\nSearched: ${backendPath}\nAnd: ${backendPathAlt}`;
        log('error', error);
        reject(new Error(error));
        return;
      }

      // Use Electron's built-in Node.js runtime
      // Electron executable itself can run Node.js code
      command = process.execPath;
      args = [finalBackendPath];
      options = {
        cwd: userDataPath,
        env: {
          ...env,
          ELECTRON_RUN_AS_NODE: '1' // This makes Electron behave as Node.js
        },
        shell: false
      };

      log('info', `Using Electron as Node.js: ${command}`);
      log('info', `Backend script: ${finalBackendPath}`);
    }

    log('info', `Spawning backend: ${command} ${args.join(' ')}`);
    log('info', `Working directory: ${options.cwd}`);

    try {
      backendProcess = spawn(command, args, options);
    } catch (err: any) {
      log('error', 'Failed to spawn backend process:', err);
      reject(new Error(`Failed to start backend: ${err.message}`));
      return;
    }

    let startupTimeout: NodeJS.Timeout;
    let healthCheckInterval: NodeJS.Timeout;
    let backendOutput: string[] = [];

    // Capture backend output
    backendProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      backendOutput.push(output);
      log('info', `[Backend] ${output.trim()}`);

      // Check if backend is ready
      if (output.includes('Backend Running') ||
          output.includes('Status: Ready') ||
          output.includes(`listening on port ${BACKEND_PORT}`)) {
        log('info', 'Backend startup message detected');
        backendStarted = true;
        clearTimeout(startupTimeout);
        clearInterval(healthCheckInterval);
        resolve();
      }
    });

    backendProcess.stderr?.on('data', (data) => {
      const output = data.toString();
      backendOutput.push(`[ERR] ${output}`);
      log('error', `[Backend Error] ${output.trim()}`);
    });

    backendProcess.on('error', (err) => {
      log('error', 'Backend process error:', err);
      clearTimeout(startupTimeout);
      clearInterval(healthCheckInterval);
      reject(new Error(`Backend process error: ${err.message}\n\nOutput:\n${backendOutput.join('\n')}`));
    });

    backendProcess.on('exit', (code, signal) => {
      log('warn', `Backend process exited with code ${code}, signal ${signal}`);
      backendStarted = false;

      if (!isQuitting && code !== 0) {
        const logDir = app.isPackaged
          ? path.join(app.getPath('userData'), 'logs')
          : path.join(app.getAppPath(), 'logs');

        dialog.showErrorBox(
          'Backend Crashed',
          `The POS backend server has stopped unexpectedly.\n\n` +
          `Exit code: ${code}\n` +
          `Signal: ${signal}\n\n` +
          `Last output:\n${backendOutput.slice(-10).join('\n')}\n\n` +
          `Check logs at: ${logDir}\n\n` +
          `The application will now close.`
        );
        app.quit();
      }
    });

    // Timeout if backend doesn't start
    startupTimeout = setTimeout(() => {
      clearInterval(healthCheckInterval);
      if (!backendStarted && backendProcess) {
        log('error', 'Backend startup timeout');
        log('error', 'Backend output:', backendOutput.join('\n'));
        backendProcess.kill();

        const logDir = app.isPackaged
          ? path.join(app.getPath('userData'), 'logs')
          : path.join(app.getAppPath(), 'logs');

        reject(new Error(
          `Backend startup timeout - server did not start within ${BACKEND_STARTUP_TIMEOUT / 1000} seconds\n\n` +
          `Possible causes:\n` +
          `• Port ${BACKEND_PORT} is already in use\n` +
          `• Database initialization failed\n` +
          `• Insufficient permissions\n` +
          `• Antivirus blocking execution\n\n` +
          `Last output:\n${backendOutput.slice(-10).join('\n')}\n\n` +
          `Check full logs at: ${logDir}`
        ));
      }
    }, BACKEND_STARTUP_TIMEOUT);

    // Periodic health check
    let healthCheckAttempts = 0;
    healthCheckInterval = setInterval(async () => {
      healthCheckAttempts++;
      log('info', `Health check attempt ${healthCheckAttempts}...`);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:${BACKEND_PORT}/api/health`, {
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          log('info', `Backend health check successful:`, data);
          backendStarted = true;
          clearTimeout(startupTimeout);
          clearInterval(healthCheckInterval);
          resolve();
        }
      } catch (err: any) {
        log('warn', `Health check failed (attempt ${healthCheckAttempts}): ${err.message}`);
        // Backend not ready yet, continue checking
      }
    }, BACKEND_HEALTH_CHECK_INTERVAL);
  });
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let secret = '';
  for (let i = 0; i < 64; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function loadEnvFile(envPath: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } catch (err) {
    log('warn', 'Could not load .env file:', err);
  }
  return env;
}

function stopBackend(): void {
  if (backendProcess && !backendProcess.killed) {
    log('info', 'Stopping backend server...');

    // Try graceful shutdown first
    backendProcess.kill('SIGTERM');

    // Force kill after 5 seconds if still running
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        log('warn', 'Force killing backend...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);

    backendProcess = null;
    backendStarted = false;
  }

  if (logStream) {
    logStream.end();
    logStream = null;
  }
}

function loadFrontend(): void {
  if (!mainWindow) return;

  const isDev = !app.isPackaged;

  if (isDev) {
    // Development: Load from vite dev server
    log('info', 'Loading frontend from http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173')
      .catch((err) => {
        log('error', 'Failed to load frontend:', err);
        dialog.showErrorBox(
          'Frontend Load Failed',
          'Could not connect to Vite dev server at http://localhost:5173\n\nMake sure the frontend dev server is running with: npm run dev:frontend'
        );
      });
  } else {
    // Production: Load from built files (inside app.asar)
    const indexPath = path.join(app.getAppPath(), 'dist', 'frontend', 'index.html');
    log('info', `Loading frontend from: ${indexPath}`);
    log('info', `App path: ${app.getAppPath()}`);
    log('info', `Frontend exists: ${fs.existsSync(indexPath)}`);

    mainWindow.loadFile(indexPath)
      .catch((err) => {
        log('error', 'Failed to load frontend:', err);
        dialog.showErrorBox(
          'Frontend Load Failed',
          `Could not load the application interface.\n\nPath: ${indexPath}\n\nError: ${err.message}`
        );
      });
  }
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow?.reload()
        },
        { type: 'separator' },
        {
          label: 'Open Logs Folder',
          click: () => {
            const logDir = app.isPackaged
              ? path.join(app.getPath('userData'), 'logs')
              : path.join(app.getAppPath(), 'logs');
            shell.openPath(logDir);
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About HGM POS',
          click: showAboutDialog
        },
        { type: 'separator' },
        {
          label: 'Open DevTools',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.openDevTools()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAboutDialog(): void {
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'About HGM POS System',
    message: 'HGM POS System',
    detail: `Version: ${app.getVersion()}\n\nA complete Point of Sale system for HGM Properties Ltd\n\nSections: Bar, Restaurant, Lodge\nLocation: Kampala, Uganda\n\n© 2024 HGM Properties Ltd. All rights reserved.`,
    buttons: ['OK']
  });
}

// IPC Handlers for printer, cash drawer, and file operations
ipcMain.handle('print-receipt', async (_event, receiptData) => {
  try {
    log('info', 'Print receipt requested:', receiptData);

    const response = await fetch(`http://localhost:${BACKEND_PORT}/api/receipt/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, message: 'Receipt sent to printer', data: result };
    } else {
      return { success: false, message: 'Failed to print receipt', error: await response.text() };
    }
  } catch (error: any) {
    log('error', 'Print receipt error:', error);
    return { success: false, message: 'Failed to print receipt', error: error.message };
  }
});

ipcMain.handle('print-html', async (_event, html: string, options?: any) => {
  try {
    log('info', 'Print HTML requested');

    if (!mainWindow) {
      return { success: false, message: 'Main window not available' };
    }

    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    return new Promise((resolve) => {
      printWindow.webContents.print(options || { silent: false }, (success, errorType) => {
        printWindow.close();

        if (success) {
          resolve({ success: true, message: 'Print job sent successfully' });
        } else {
          resolve({ success: false, message: 'Print job failed', error: errorType });
        }
      });
    });
  } catch (error: any) {
    log('error', 'Print HTML error:', error);
    return { success: false, message: 'Failed to print HTML', error: error.message };
  }
});

ipcMain.handle('open-cash-drawer', async () => {
  try {
    log('info', 'Cash drawer open requested');

    const response = await fetch(`http://localhost:${BACKEND_PORT}/api/receipt/cash-drawer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      return { success: true, message: 'Cash drawer opened' };
    } else {
      return { success: false, message: 'Failed to open cash drawer', error: await response.text() };
    }
  } catch (error: any) {
    log('error', 'Cash drawer error:', error);
    return { success: false, message: 'Failed to open cash drawer', error: error.message };
  }
});

ipcMain.handle('get-printers', async () => {
  try {
    const printers = (mainWindow?.webContents as any).getPrinters?.() || [];
    log('info', `Available printers: ${printers.length}`);
    return printers;
  } catch (error) {
    log('error', 'Get printers error:', error);
    return [];
  }
});

// File system handlers
ipcMain.handle('select-file', async (_event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }],
      ...options
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    log('error', 'Select file error:', error);
    return null;
  }
});

ipcMain.handle('save-file', async (_event, data: string, defaultPath?: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: defaultPath || 'file.txt',
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    fs.writeFileSync(result.filePath, data, 'utf-8');
    return result.filePath;
  } catch (error) {
    log('error', 'Save file error:', error);
    return null;
  }
});

ipcMain.handle('read-file', async (_event, filePath: string) => {
  try {
    const contents = fs.readFileSync(filePath, 'utf-8');
    return contents;
  } catch (error) {
    log('error', 'Read file error:', error);
    return null;
  }
});

// App lifecycle
app.whenReady().then(() => {
  initializeLogging();
  createWindow();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopBackend();
});
