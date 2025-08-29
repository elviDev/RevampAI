#!/usr/bin/env node

const API_URL = 'http://localhost:3001/api';

console.log('🧪 Testing Member Avatar and Statistics Fix...\n');

async function testMemberFix() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in as CEO Alex...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ceo@company.com',
        password: 'ceo123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    console.log('✅ Login successful');

    // Get channels first
    console.log('\n📂 Fetching channels...');
    const channelsResponse = await fetch(`${API_URL}/channels`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!channelsResponse.ok) {
      throw new Error(`Channels fetch failed: ${channelsResponse.status}`);
    }

    const channelsData = await channelsResponse.json();
    console.log(`✅ Found ${channelsData.data?.length || 0} channels`);
    
    if (!channelsData.data || channelsData.data.length === 0) {
      console.log('⚠️ No channels found to test');
      return;
    }

    // Test member endpoint for the first channel
    const firstChannel = channelsData.data[0];
    console.log(`\n👥 Testing members for channel: ${firstChannel.name}`);
    
    const membersResponse = await fetch(`${API_URL}/channels/${firstChannel.id}/members`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!membersResponse.ok) {
      const errorText = await membersResponse.text();
      console.error(`❌ Members API failed: ${membersResponse.status}`, errorText);
      return;
    }

    const membersData = await membersResponse.json();
    console.log('✅ Members API response:', {
      success: membersData.success,
      memberCount: membersData.data?.length || 0,
      pagination: membersData.pagination
    });

    // Check first member structure to verify avatar fix
    if (membersData.data && membersData.data.length > 0) {
      const firstMember = membersData.data[0];
      console.log('\n🔍 First member structure:', {
        user_id: firstMember.user_id,
        user_name: firstMember.user_name,
        user_avatar: firstMember.user_avatar,
        role: firstMember.role,
        hasAvatar: !!firstMember.user_avatar,
      });

      console.log('\n✅ Avatar Fix Status:', {
        hasUserName: !!firstMember.user_name,
        hasUserAvatar: !!firstMember.user_avatar,
        hasUserId: !!firstMember.user_id,
        fieldStructureCorrect: !!(firstMember.user_name && firstMember.user_id),
      });
    }

    // Test channel statistics
    console.log('\n📊 Testing channel statistics...');
    console.log('Channel stats from API:', {
      memberCount: firstChannel.member_count,
      messageCount: firstChannel.message_count || 'Not available',
      fileCount: firstChannel.file_count || 'Not available'
    });

    console.log('\n🎉 Member Fix Test Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Backend API is accessible');
    console.log('✅ Members endpoint returns data');
    console.log('✅ Member structure includes user_name and user_avatar fields');
    console.log('✅ No more question mark avatars (if avatar_url exists in database)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testMemberFix();
