import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { Database } from 'sqlite3';

const dbPath = process.env.DATABASE_PATH || './data/hgm-pos.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'cashier')),
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Items table
    db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        section TEXT NOT NULL CHECK(section IN ('bar', 'restaurant', 'lodge')),
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        low_stock_alert INTEGER DEFAULT 10,
        image_path TEXT,
        color TEXT DEFAULT '#3b82f6',
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_number TEXT UNIQUE NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'mobile_money', 'split')),
        payment_details TEXT,
        section TEXT NOT NULL CHECK(section IN ('bar', 'restaurant', 'lodge')),
        cashier_id INTEGER NOT NULL,
        customer_name TEXT,
        status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      )
    `);

    // Transaction items table
    db.run(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id)
      )
    `);

    // Lodge bookings table
    db.run(`
      CREATE TABLE IF NOT EXISTS lodge_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER,
        room_type TEXT NOT NULL,
        duration_type TEXT NOT NULL CHECK(duration_type IN ('short', 'full', '1day', '1week', '2weeks', '3weeks', '4weeks')),
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        check_in DATETIME NOT NULL,
        check_out DATETIME,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
      )
    `);

    // Cash movements table
    db.run(`
      CREATE TABLE IF NOT EXISTS cash_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('opening', 'closing', 'deposit', 'withdrawal', 'adjustment')),
        amount REAL NOT NULL,
        expected_amount REAL,
        difference REAL,
        cashier_id INTEGER NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cashier_id) REFERENCES users(id)
      )
    `);

    // Stock movements table
    db.run(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('in', 'out', 'adjustment')),
        quantity INTEGER NOT NULL,
        reference TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Receipt settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS receipt_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL UNIQUE CHECK(section IN ('bar', 'restaurant', 'lodge', 'general')),
        header_text TEXT,
        footer_text TEXT,
        show_logo INTEGER DEFAULT 1,
        logo_path TEXT,
        paper_width INTEGER DEFAULT 80,
        font_size INTEGER DEFAULT 12,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');

    // Run migrations
    runMigrations();

    seedInitialData();
  });
}

function runMigrations() {
  // Migration 1: Add Pesapal fields to transactions table
  db.all("PRAGMA table_info(transactions)", (err, columns) => {
    if (err) {
      console.error('Error checking transactions table schema:', err);
      return;
    }

    const columnNames = columns.map((col: any) => col.name);

    // Add pesapal_tracking_id if it doesn't exist
    if (!columnNames.includes('pesapal_tracking_id')) {
      db.run(`
        ALTER TABLE transactions
        ADD COLUMN pesapal_tracking_id TEXT
      `, (err) => {
        if (err) {
          console.error('Error adding pesapal_tracking_id column:', err);
        } else {
          console.log('✓ Added pesapal_tracking_id column to transactions table');
        }
      });
    }

    // Add payment_status if it doesn't exist
    if (!columnNames.includes('payment_status')) {
      db.run(`
        ALTER TABLE transactions
        ADD COLUMN payment_status TEXT DEFAULT 'completed'
      `, (err) => {
        if (err) {
          console.error('Error adding payment_status column:', err);
        } else {
          console.log('✓ Added payment_status column to transactions table');
        }
      });
    }

    // Add payment_reference if it doesn't exist
    if (!columnNames.includes('payment_reference')) {
      db.run(`
        ALTER TABLE transactions
        ADD COLUMN payment_reference TEXT
      `, (err) => {
        if (err) {
          console.error('Error adding payment_reference column:', err);
        } else {
          console.log('✓ Added payment_reference column to transactions table');
        }
      });
    }

    // Add updated_at if it doesn't exist
    if (!columnNames.includes('updated_at')) {
      db.run(`
        ALTER TABLE transactions
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      `, (err) => {
        if (err) {
          console.error('Error adding updated_at column:', err);
        } else {
          console.log('✓ Added updated_at column to transactions table');
        }
      });
    }
  });
}

async function seedInitialData() {
  // Check if admin exists
  db.get('SELECT * FROM users WHERE role = ?', ['admin'], async (err, row) => {
    if (!row) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(
        'INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin', 'System Administrator'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Default admin user created (username: admin, password: admin123)');
          }
        }
      );
    }
  });

  // Seed initial items from HGM Properties list
  const items = [
    // Bar items
    { name: 'Club Big Small', category: 'Beer', section: 'bar', price: 5000, stock: 100 },
    { name: 'Nile', category: 'Beer', section: 'bar', price: 4500, stock: 100 },
    { name: 'Guinness', category: 'Beer', section: 'bar', price: 7000, stock: 50 },
    { name: 'Smirnoff Ice Black', category: 'RTD', section: 'bar', price: 6000, stock: 50 },
    { name: 'Smirnoff Ice Red', category: 'RTD', section: 'bar', price: 6000, stock: 50 },
    { name: 'Lager', category: 'Beer', section: 'bar', price: 4000, stock: 100 },
    { name: 'Pilsner', category: 'Beer', section: 'bar', price: 4000, stock: 100 },
    { name: 'Coca Cola', category: 'Soft Drink', section: 'bar', price: 2000, stock: 200 },
    { name: 'Pepsi', category: 'Soft Drink', section: 'bar', price: 2000, stock: 200 },
    { name: 'Bell Lager', category: 'Beer', section: 'bar', price: 4500, stock: 100 },
    { name: 'Bell Small', category: 'Beer', section: 'bar', price: 3000, stock: 100 },
    { name: 'Water', category: 'Water', section: 'bar', price: 1500, stock: 300 },
    { name: 'Uganda Waragi Big', category: 'Spirits', section: 'bar', price: 25000, stock: 30 },
    { name: 'Uganda Waragi Small', category: 'Spirits', section: 'bar', price: 8000, stock: 50 },
    { name: 'Jack Daniels', category: 'Whiskey', section: 'bar', price: 150000, stock: 10 },
    { name: 'Red Wine', category: 'Wine', section: 'bar', price: 40000, stock: 20 },
    { name: 'White Wine', category: 'Wine', section: 'bar', price: 40000, stock: 20 },
    { name: 'G.nuts', category: 'Snacks', section: 'bar', price: 2000, stock: 100 },
    { name: 'Pop Corns', category: 'Snacks', section: 'bar', price: 3000, stock: 100 },
    
    // Restaurant items
    { name: 'Grill Chicken', category: 'Main Course', section: 'restaurant', price: 25000, stock: 0 },
    { name: 'Chicken & Fries', category: 'Main Course', section: 'restaurant', price: 20000, stock: 0 },
    { name: 'Goat Meat', category: 'Main Course', section: 'restaurant', price: 30000, stock: 0 },
    { name: 'Breakfast', category: 'Meals', section: 'restaurant', price: 15000, stock: 0 },
    { name: 'Pillaoo', category: 'Main Course', section: 'restaurant', price: 18000, stock: 0 },
    { name: 'Rice', category: 'Sides', section: 'restaurant', price: 10000, stock: 0 },
    { name: 'Matooke', category: 'Sides', section: 'restaurant', price: 8000, stock: 0 },
    { name: 'Lunch', category: 'Meals', section: 'restaurant', price: 15000, stock: 0 },
    { name: 'Fish Dish', category: 'Main Course', section: 'restaurant', price: 22000, stock: 0 },
    { name: 'Chips', category: 'Sides', section: 'restaurant', price: 8000, stock: 0 },
    
    // Lodge services
    { name: 'Short Stay (Less than 2 Hours)', category: 'Room', section: 'lodge', price: 20000, stock: 10 },
    { name: 'Full Stay (More than 2 Hours)', category: 'Room', section: 'lodge', price: 35000, stock: 10 },
    { name: '1 Day Stay', category: 'Room', section: 'lodge', price: 50000, stock: 10 },
    { name: '1 Week Stay', category: 'Room', section: 'lodge', price: 300000, stock: 10 },
    { name: 'Bed & Breakfast', category: 'Service', section: 'lodge', price: 60000, stock: 100 },
    { name: 'Bed Only', category: 'Service', section: 'lodge', price: 45000, stock: 100 },
    { name: 'Ironing', category: 'Service', section: 'lodge', price: 5000, stock: 100 },
    { name: 'Washing', category: 'Service', section: 'lodge', price: 10000, stock: 100 },
    { name: 'Extra Towel', category: 'Service', section: 'lodge', price: 3000, stock: 50 },
    { name: 'Extra Bed Sheets', category: 'Service', section: 'lodge', price: 5000, stock: 50 }
  ];

  db.get('SELECT COUNT(*) as count FROM items', [], (err, row: any) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO items (name, category, section, price, stock) VALUES (?, ?, ?, ?, ?)');
      items.forEach(item => {
        stmt.run([item.name, item.category, item.section, item.price, item.stock]);
      });
      stmt.finalize();
      console.log('Initial items seeded successfully');
    }
  });
}

// Promise-based database wrapper for async/await
export async function openDb() {
  return {
    get: <T = any>(sql: string, params: any[] = []): Promise<T> => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err: Error | null, row: T) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    all: <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err: Error | null, rows: T[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    },
    run: (sql: string, params: any[] = []): Promise<any> => {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err: Error | null) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  };
}

export default db;