import express from 'express';
import { login, initializeProduction, checkInstallation, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/initialize-production', initializeProduction);
router.get('/check-installation', checkInstallation);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;