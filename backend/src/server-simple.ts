import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initializeSQLiteDatabase, getDb } from './config/database-sqlite';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://10.0.2.2:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize database
initializeSQLiteDatabase();
const db = getDb();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth endpoints
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Login attempt for email: ${email}`);
    
    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      logger.warn(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email ${email}`);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    // Update last login
    db.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .run(new Date().toISOString(), user.id);

    // Remove password from response
    delete user.password;
    delete user.reset_password_token;
    delete user.verification_token;

    logger.info(`Login successful for user: ${email}`);
    
    res.json({
      success: true,
      data: {
        user,
        token,
        refreshToken: token // For simplicity, using same token
      }
    });
  } catch (error: any) {
    logger.error(`Login error: ${error.message}`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    logger.info(`Registration attempt for email: ${email}`);
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password, name, is_verified)
      VALUES (?, ?, ?, ?)
    `).run(email, hashedPassword, name, 1); // Auto-verify for development

    const userId = result.lastInsertRowid;

    // Generate token
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '7d' }
    );

    // Get created user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    delete user.password;

    logger.info(`Registration successful for user: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken: token
      }
    });
  } catch (error: any) {
    logger.error(`Registration error: ${error.message}`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// Get user profile
app.get('/api/v1/users/profile', (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as any;
    
    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove sensitive data
    delete user.password;
    delete user.reset_password_token;
    delete user.verification_token;

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error(`Get profile error: ${error.message}`, error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
});

// Update user profile
app.put('/api/v1/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key') as any;
    
    const { name, bio, company, position, phone, location } = req.body;
    
    // Update user
    db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, company = ?, position = ?, phone = ?, location = ?, updated_at = ?
      WHERE id = ?
    `).run(name, bio, company, position, phone, location, new Date().toISOString(), decoded.id);

    // Get updated user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id) as any;
    delete user.password;
    delete user.reset_password_token;
    delete user.verification_token;

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error(`Update profile error: ${error.message}`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Forgot password endpoint
app.post('/api/v1/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
    
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // Generate reset token (simplified for development)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    
    db.prepare('UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?')
      .run(resetToken, expires, (user as any).id);

    logger.info(`Password reset token generated for: ${email} - Token: ${resetToken}`);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      resetToken // Only for development - remove in production
    });
  } catch (error: any) {
    logger.error(`Forgot password error: ${error.message}`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Reset password endpoint
app.post('/api/v1/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = db.prepare(`
      SELECT id FROM users 
      WHERE reset_password_token = ? 
      AND reset_password_expires > ?
    `).get(token, new Date().toISOString());
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update password and clear reset token
    db.prepare(`
      UPDATE users 
      SET password = ?, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE id = ?
    `).run(hashedPassword, (user as any).id);

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error: any) {
    logger.error(`Reset password error: ${error.message}`, error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info('Test credentials: test@example.com / password123');
  logger.info('API endpoints:');
  logger.info('  POST /api/v1/auth/login');
  logger.info('  POST /api/v1/auth/register');
  logger.info('  GET  /api/v1/users/profile');
  logger.info('  PUT  /api/v1/users/profile');
  logger.info('  POST /api/v1/auth/forgot-password');
  logger.info('  POST /api/v1/auth/reset-password');
});