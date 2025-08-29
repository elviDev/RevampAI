#!/usr/bin/env node

/**
 * Test script to verify CEO permission fixes
 */

const https = require('http');

function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'alex.ceo@company.com',
      password: 'TempPass123!'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response.data);
          } else {
            reject(new Error(`Login failed: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

function testChannelAccess(accessToken, channelId = 'test-channel-id') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/channels/${channelId}/members`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('🔍 Testing CEO permission fixes...\n');

    console.log('1. Testing CEO login...');
    const loginData = await testLogin();
    console.log('✅ CEO login successful');
    console.log(`   User: ${loginData.user.name} (${loginData.user.role})`);
    console.log(`   Permissions: ${JSON.stringify(loginData.user.permissions)}\n`);

    if (loginData.user.permissions.includes('*')) {
      console.log('✅ CEO has wildcard permissions (*)\n');
    } else {
      console.log('❌ CEO does not have wildcard permissions\n');
      console.log('Available permissions:', loginData.user.permissions);
    }

    console.log('2. Testing channel member access...');
    const channelResponse = await testChannelAccess(loginData.accessToken);
    
    if (channelResponse.statusCode === 200) {
      console.log('✅ CEO can access channel members successfully');
      console.log('   Response:', channelResponse.data);
    } else if (channelResponse.statusCode === 403) {
      console.log('❌ CEO still getting permission denied (403)');
      console.log('   Error:', channelResponse.data);
    } else if (channelResponse.statusCode === 404) {
      console.log('⚠️  Channel not found (404) - this is expected for test channel');
      console.log('   Permission check passed, but channel doesn\'t exist');
    } else {
      console.log(`ℹ️  Unexpected status code: ${channelResponse.statusCode}`);
      console.log('   Response:', channelResponse.data);
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running on port 3001');
    }
    
    process.exit(1);
  }
}

main();
