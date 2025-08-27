const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ceo',
  department: 'Executive',
  jobTitle: 'CEO',
  phone: '+1234567890'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  // Accept any email/password for testing
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: { ...mockUser, email },
        token: 'mock-jwt-token-' + Date.now(),
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 86400 // 24 hours
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: {
        message: 'Email and password are required',
        code: 'VALIDATION_ERROR'
      }
    });
  }
});

// Mock register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  console.log('Register request received:', req.body);
  
  res.json({
    success: true,
    data: {
      user: { ...mockUser, ...req.body },
      message: 'Registration successful'
    }
  });
});

// Mock user profile endpoint
app.get('/api/v1/users/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: mockUser
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Accept connections from any IP

app.listen(PORT, HOST, () => {
  console.log(`Mock backend server running on http://${HOST}:${PORT}`);
  console.log('Your computer IP: 192.168.1.2');
  console.log(`Physical device should connect to: http://192.168.1.2:${PORT}`);
});