import { executeQuery } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  static async findByEmail(email) {
    const result = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result.success ? result.data[0] : null;
  }

  static async findById(id) {
    const result = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result.success ? result.data[0] : null;
  }

  static async findAll() {
    const result = await executeQuery(
      'SELECT id, email, name, role, status, phone, department, custom_permissions, created_at, updated_at, last_login FROM users ORDER BY created_at DESC'
    );
    return result.success ? result.data : [];
  }

  static async create(userData) {
    const { email, password, name, role, phone, department } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await executeQuery(
      `INSERT INTO users (email, password, name, role, phone, department, custom_permissions) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, role, phone || null, department || null, JSON.stringify([])]
    );

    if (result.success) {
      return await this.findById(result.data.insertId);
    }
    return null;
  }

  static async update(id, userData) {
    const updates = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id' && key !== 'password') {
        if (key === 'custom_permissions') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(userData[key]));
        } else {
          updates.push(`${key} = ?`);
          values.push(userData[key]);
        }
      }
    });

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    values.push(id);

    const result = await executeQuery(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.success;
  }

  static async delete(id) {
    const result = await executeQuery(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.success;
  }

  static async updateLastLogin(id) {
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, login_attempts = 0 WHERE id = ?',
      [id]
    );
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async toggleStatus(id) {
    const result = await executeQuery(
      'UPDATE users SET status = CASE WHEN status = "active" THEN "inactive" ELSE "active" END WHERE id = ?',
      [id]
    );
    return result.success;
  }
}