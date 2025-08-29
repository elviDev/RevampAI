// Test script to get channels and test messages
const API_URL = 'http://localhost:3001/api/v1';

async function getTokenAndTestChannels() {
  // Get fresh token
  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alex.ceo@company.com',
      password: 'TempPass123!'
    })
  });

  if (!loginResponse.ok) {
    throw new Error('Login failed');
  }

  const loginData = await loginResponse.json();
  const token = loginData.data.accessToken;
  console.log('✅ Got fresh token');

  // Test channels endpoint
  console.log('\n🔄 Testing channels endpoint...');
  const channelsResponse = await fetch(`${API_URL}/channels`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!channelsResponse.ok) {
    const error = await channelsResponse.text();
    console.error('❌ Channels failed:', error);
    return;
  }

  const channelsData = await channelsResponse.json();
  console.log('✅ Channels response:', {
    success: channelsData.success,
    channelCount: channelsData.data?.length || 0,
    channels: channelsData.data?.map(c => ({ id: c.id, name: c.name })) || []
  });

  // Test messages with first channel if available
  if (channelsData.data && channelsData.data.length > 0) {
    const firstChannel = channelsData.data[0];
    console.log(`\n🔄 Testing messages for channel: ${firstChannel.name} (${firstChannel.id})`);
    
    const messagesResponse = await fetch(`${API_URL}/channels/${firstChannel.id}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Messages response status:', messagesResponse.status);
    
    if (!messagesResponse.ok) {
      const error = await messagesResponse.text();
      console.error('❌ Messages failed:', error);
    } else {
      const messagesData = await messagesResponse.json();
      console.log('✅ Messages response:', {
        success: messagesData.success,
        messageCount: messagesData.data?.length || 0,
        pagination: messagesData.pagination
      });
    }
  } else {
    console.log('⚠️ No channels found to test messages');
  }
}

getTokenAndTestChannels().catch(console.error);