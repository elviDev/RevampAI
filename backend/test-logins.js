const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api/v1';

const testUsers = [
  // CEO users
  { email: 'alex.ceo@company.com', password: 'TempPass123!', expectedRole: 'ceo' },
  
  // Manager users  
  { email: 'sarah.manager@seeddata.com', password: 'TempPass123!', expectedRole: 'manager' },
  { email: 'mike.manager@seeddata.com', password: 'TempPass123!', expectedRole: 'manager' },
  { email: 'lisa.manager@seeddata.com', password: 'TempPass123!', expectedRole: 'manager' },
];

async function testLogin(user) {
  try {
    console.log(`\n🔍 Testing login for: ${user.email}`);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Login successful!`);
      console.log(`   Role: ${data.data.user.role}`);
      console.log(`   Name: ${data.data.user.name}`);
      console.log(`   Department: ${data.data.user.department}`);
      console.log(`   Job Title: ${data.data.user.job_title}`);
      console.log(`   Access Token: ${data.data.accessToken ? 'Present' : 'Missing'}`);
      console.log(`   Refresh Token: ${data.data.refreshToken ? 'Present' : 'Missing'}`);
      
      return {
        success: true,
        email: user.email,
        password: user.password,
        userData: data.data.user,
        tokens: {
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken
        }
      };
    } else {
      console.log(`❌ Login failed: ${data.message || 'Unknown error'}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error Code: ${data.code || 'N/A'}`);
      
      return {
        success: false,
        email: user.email,
        error: data.message || 'Login failed',
        status: response.status
      };
    }
  } catch (error) {
    console.log(`💥 Error testing login: ${error.message}`);
    return {
      success: false,
      email: user.email,
      error: error.message
    };
  }
}

async function main() {
  console.log('🧪 Testing user login credentials...\n');
  console.log('Testing against:', API_BASE);
  
  const results = {
    successful: [],
    failed: []
  };

  for (const user of testUsers) {
    const result = await testLogin(user);
    
    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n\n📊 SUMMARY RESULTS:');
  console.log(`✅ Successful logins: ${results.successful.length}`);
  console.log(`❌ Failed logins: ${results.failed.length}\n`);

  if (results.successful.length > 0) {
    console.log('🎉 WORKING CREDENTIALS:');
    results.successful.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.userData.name} (${user.userData.role.toUpperCase()})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Department: ${user.userData.department}`);
      console.log(`   Job Title: ${user.userData.job_title}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED CREDENTIALS:');
    results.failed.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   Error: ${user.error}`);
      if (user.status) console.log(`   Status: ${user.status}`);
    });
  }

  return results;
}

main().catch(console.error);