import { executeQuery } from '../config/database.js';

export class Installation {
  static async getInstallation() {
    const result = await executeQuery(
      'SELECT * FROM installation ORDER BY installation_date DESC LIMIT 1'
    );
    return result.success ? result.data[0] : null;
  }

  static async create(installationData) {
    const {
      company_name,
      company_email,
      company_phone,
      currency,
      timezone
    } = installationData;

    const result = await executeQuery(
      `INSERT INTO installation 
       (is_production, demo_data_removed, installation_complete, company_name, company_email, company_phone, currency, timezone) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [true, true, true, company_name, company_email || null, company_phone || null, currency, timezone]
    );

    return result.success;
  }

  static async isInstalled() {
    const installation = await this.getInstallation();
    return installation && installation.is_production && installation.installation_complete;
  }

  static async initializeDemo() {
    const result = await executeQuery(
      `INSERT INTO installation (is_production, is_demo_mode, demo_data_removed, installation_complete) 
       VALUES (?, ?, ?, ?)`,
      [false, true, false, false]
    );
    return result.success;
  }
}