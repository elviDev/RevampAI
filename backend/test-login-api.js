const fetch = require('node-fetch');
require('dotenv').config({ path: '.env' });

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API endpoint...');
    
    const API_BASE_URL = 'http://localhost:3001/api/v1';
    const email = 'alex.ceo@company.com';
    const password = 'TempPass123!';
    
    console.log(`Testing login with: ${email}`);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      console.log('Response summary:', {
        success: data.success,
        hasAccessToken: !!data.data?.accessToken,
        hasRefreshToken: !!data.data?.refreshToken,
        accessTokenLength: data.data?.accessToken?.length || 0,
        user: {
          id: data.data?.user?.id,
          email: data.data?.user?.email,
          name: data.data?.user?.name,
          role: data.data?.user?.role,
        },
      });
      
      // Test the /auth/me endpoint with the token
      console.log('\n🧪 Testing /auth/me endpoint...');
      const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.data.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`/auth/me response status: ${meResponse.status}`);
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ /auth/me successful!');
        console.log('User profile data:', {
          id: meData.data?.user?.id,
          email: meData.data?.user?.email,
          name: meData.data?.user?.name,
          role: meData.data?.user?.role,
          department: meData.data?.user?.department,
          job_title: meData.data?.user?.job_title,
          phone: meData.data?.user?.phone,
        });
      } else {
        const errorData = await meResponse.text();
        console.log('❌ /auth/me failed:', errorData);
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ Login failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testLoginAPI();