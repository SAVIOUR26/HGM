import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import './database/init';

// Import routes (we'll create these next)
import authRoutes from './routes/auth';
import itemRoutes from './routes/items';
import transactionRoutes from './routes/transactions';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import cashRoutes from './routes/cash';
import receiptRoutes from './routes/receipt';
import paymentRoutes from './routes/payment';
import settingsRoutes from './routes/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'HGM POS API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   HGM POS System - Backend Running    ║
╚═══════════════════════════════════════╝

✓ Server: http://localhost:${PORT}
✓ API: http://localhost:${PORT}/api
✓ Database: Connected
✓ Status: Ready

Press Ctrl+C to stop
  `);
});