import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database ${process.env.DB_NAME} created successfully`);
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
  } finally {
    await connection.end();
  }
};

const createTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'manager', 'employee', 'viewer') DEFAULT 'employee',
        status ENUM('active', 'inactive') DEFAULT 'active',
        phone VARCHAR(50),
        department VARCHAR(100),
        custom_permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        login_attempts INT DEFAULT 0,
        is_email_verified BOOLEAN DEFAULT FALSE
      )
    `);

    // Installation table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS installation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        is_production BOOLEAN DEFAULT FALSE,
        is_demo_mode BOOLEAN DEFAULT TRUE,
        installation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version VARCHAR(50) DEFAULT '1.0.0',
        demo_data_removed BOOLEAN DEFAULT FALSE,
        installation_complete BOOLEAN DEFAULT FALSE,
        company_name VARCHAR(255),
        company_email VARCHAR(255),
        company_phone VARCHAR(50),
        currency VARCHAR(10) DEFAULT 'USD',
        timezone VARCHAR(100) DEFAULT 'UTC'
      )
    `);

    // Role permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ingredients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        stock INT DEFAULT 0,
        reorder_level INT DEFAULT 10,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100),
        ingredients JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        sale_date DATE NOT NULL,
        customer_name VARCHAR(255),
        reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100) NOT NULL,
        salary DECIMAL(10,2) NOT NULL,
        salary_type ENUM('monthly', 'hourly', 'daily') DEFAULT 'monthly',
        email VARCHAR(255),
        phone VARCHAR(50),
        employee_id VARCHAR(50) UNIQUE,
        department VARCHAR(100),
        hire_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Salary adjustments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS salary_adjustments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        adjustment_type ENUM('bonus', 'deduction', 'overtime', 'allowance') NOT NULL,
        reason VARCHAR(255) NOT NULL,
        adjustment_month VARCHAR(7) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Expenses table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        expense_date DATE NOT NULL,
        category VARCHAR(100),
        reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Monthly bills table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS monthly_bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        estimated_amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        bill_type ENUM('fixed', 'variable') DEFAULT 'fixed',
        due_day INT DEFAULT 1,
        description TEXT,
        vendor VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Bill payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bill_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT NOT NULL,
        bill_name VARCHAR(255) NOT NULL,
        actual_amount DECIMAL(10,2) NOT NULL,
        paid_date DATE NOT NULL,
        payment_month VARCHAR(7) NOT NULL,
        notes TEXT,
        reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES monthly_bills(id) ON DELETE CASCADE
      )
    `);

    // Business owners table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS business_owners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        share_capital DECIMAL(15,2) NOT NULL,
        profit_percentage DECIMAL(5,2) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        ownership_type VARCHAR(50),
        join_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await connection.end();
  }
};

const initializeDatabase = async () => {
  console.log('🔄 Initializing database...');
  await createDatabase();
  await createTables();
  console.log('✅ Database initialization complete');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export default initializeDatabase;