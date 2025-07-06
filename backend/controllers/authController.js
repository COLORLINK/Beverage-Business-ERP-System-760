import { User } from '../models/User.js';
import { Installation } from '../models/Installation.js';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const initializeProduction = async (req, res) => {
  try {
    // Check if already installed
    const isInstalled = await Installation.isInstalled();
    if (isInstalled) {
      return res.status(400).json({
        success: false,
        error: 'System is already installed'
      });
    }

    const schema = Joi.object({
      admin: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('super_admin').required()
      }).required(),
      company: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().allow(''),
        phone: Joi.string().allow(''),
        currency: Joi.string().required(),
        timezone: Joi.string().required()
      }).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { admin, company } = req.body;

    // Check if admin email already exists
    const existingUser = await User.findByEmail(admin.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Admin email already exists'
      });
    }

    // Create admin user
    const adminUser = await User.create({
      email: admin.email,
      password: admin.password,
      name: admin.name,
      role: admin.role,
      phone: null,
      department: 'System'
    });

    if (!adminUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create admin user'
      });
    }

    // Create installation record
    const installationCreated = await Installation.create({
      company_name: company.name,
      company_email: company.email,
      company_phone: company.phone,
      currency: company.currency,
      timezone: company.timezone
    });

    if (!installationCreated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create installation record'
      });
    }

    // Generate token for auto-login
    const token = generateToken(adminUser.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = adminUser;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        message: 'Production system initialized successfully'
      }
    });
  } catch (error) {
    console.error('Production initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize production system'
    });
  }
};

export const checkInstallation = async (req, res) => {
  try {
    const isInstalled = await Installation.isInstalled();
    const installation = await Installation.getInstallation();

    res.json({
      success: true,
      data: {
        isInstalled,
        installation: installation || {}
      }
    });
  } catch (error) {
    console.error('Check installation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check installation status'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};