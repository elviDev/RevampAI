// Debug script to test authentication and get a token
const API_URL = 'http://localhost:3001/api/v1';

async function testLogin(email, password) {
  console.log(`🔄 Testing login for: ${email}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Login failed:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Login successful:', {
      hasAccessToken: !!data.data?.accessToken,
      tokenLength: data.data?.accessToken?.length,
      user: data.data?.user,
    });
    
    return data.data?.accessToken;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
}

async function testMessagesEndpoint(token, channelId = 'test-channel') {
  if (!token) {
    console.log('❌ No token available for testing messages endpoint');
    return;
  }

  console.log(`🔄 Testing messages endpoint with channel: ${channelId}`);

  try {
    const response = await fetch(`${API_URL}/channels/${channelId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Messages response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Messages request failed:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Messages response:', {
      success: data.success,
      messageCount: data.data?.length || 0,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error('❌ Messages request error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting authentication debug...\n');

  // Test different users
  const users = [
    { email: 'alex.ceo@company.com', password: 'TempPass123!' },
    { email: 'sarah.manager@seeddata.com', password: 'TempPass123!' },
    { email: 'mike.manager@seeddata.com', password: 'TempPass123!' },
  ];

  for (const user of users) {
    console.log(`\n--- Testing ${user.email} ---`);
    const token = await testLogin(user.email, user.password);
    
    if (token) {
      await testMessagesEndpoint(token);
      break; // Stop at first successful login
    }
    
    console.log('⏳ Waiting 2 seconds before next attempt...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);