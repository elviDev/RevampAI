#!/usr/bin/env node

// Test script to verify Android emulator can reach the backend
const http = require('http');

const testEndpoints = [
  'http://10.0.2.2:3001/api/v1/activities',
  'http://10.0.2.2:3001/auth/login',
];

async function testConnection(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Android emulator connectivity to backend...\n');

  // Test API endpoint (should return 401 - auth required)
  try {
    console.log('📡 Testing API endpoint...');
    const apiResult = await testConnection('http://10.0.2.2:3001/api/v1/activities');
    console.log(`✅ API Status: ${apiResult.status}`);
    console.log(`📄 Response: ${apiResult.data.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`❌ API Error: ${error.message}\n`);
  }

  // Test auth endpoint with login (should return 400 or similar)
  try {
    console.log('🔐 Testing auth endpoint...');
    const authResult = await testConnection(
      'http://10.0.2.2:3001/auth/login', 
      'POST', 
      { email: 'test@example.com', password: 'test' }
    );
    console.log(`✅ Auth Status: ${authResult.status}`);
    console.log(`📄 Response: ${authResult.data.substring(0, 100)}...\n`);
  } catch (error) {
    console.log(`❌ Auth Error: ${error.message}\n`);
  }

  console.log('🎯 If you see responses above (even error responses), the connection works!');
  console.log('🚀 Your Android app should be able to reach the backend.');
}

runTests();