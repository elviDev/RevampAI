#!/usr/bin/env tsx

/**
 * API-based script to fix channel category associations
 * Uses the running backend API to update categories
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api/v1';

// Test user credentials
const TEST_CREDENTIALS = {
  email: 'alex.ceo@company.com',
  password: 'TempPass123!'
};

interface Channel {
  id: string;
  name: string;
  channel_type: string;
  category_id?: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

class CategoryFixer {
  private authToken: string | null = null;

  async login(): Promise<void> {
    console.log('🔑 Logging in...');
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json() as any;
    this.authToken = data.data.accessToken;
    console.log('✅ Login successful');
  }

  async getChannels(): Promise<Channel[]> {
    const response = await fetch(`${API_BASE}/channels`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get channels: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/channels/categories`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get categories: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.data;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await fetch(`${API_BASE}/channels/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(category)
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.data;
  }

  async updateChannel(channelId: string, updates: { category_id?: string }): Promise<void> {
    const response = await fetch(`${API_BASE}/channels/${channelId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Failed to update channel: ${response.status}`);
    }
  }

  async fixChannelCategories(): Promise<void> {
    console.log('🔧 Starting channel category fix via API...\n');

    // 1. Get current data
    const [channels, categories] = await Promise.all([
      this.getChannels(),
      this.getCategories()
    ]);

    console.log('📂 Current categories:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    console.log('\n📋 Current channels:');
    channels.forEach(ch => {
      const categoryName = categories.find(c => c.id === ch.category_id)?.name || 'None';
      console.log(`   - ${ch.name} (Type: ${ch.channel_type}, Category: ${categoryName})`);
    });

    // 2. Create missing categories if needed
    const requiredCategories = [
      { name: 'General', description: 'General discussions and communications', icon: 'chatbubble-outline', color: '#6B7280' },
      { name: 'Project', description: 'Project-specific channels and collaboration', icon: 'folder-outline', color: '#3B82F6' },
      { name: 'Department', description: 'Department-specific communications', icon: 'business-outline', color: '#10B981' },
      { name: 'Announcement', description: 'Important announcements and updates', icon: 'megaphone-outline', color: '#F59E0B' }
    ];

    console.log('\n🔄 Ensuring required categories exist...');
    const categoryMap = new Map<string, string>();
    
    for (const requiredCat of requiredCategories) {
      let category = categories.find(c => 
        c.name.toLowerCase().includes(requiredCat.name.toLowerCase()) ||
        requiredCat.name.toLowerCase().includes(c.name.toLowerCase())
      );

      if (!category) {
        console.log(`   ➕ Creating missing category: ${requiredCat.name}`);
        try {
          category = await this.createCategory(requiredCat);
          categories.push(category);
        } catch (error) {
          console.log(`   ⚠️  Category ${requiredCat.name} might already exist or API doesn't support creation`);
          continue;
        }
      }

      categoryMap.set(requiredCat.name.toLowerCase(), category.id);
      console.log(`   ✅ ${requiredCat.name} → ${category.id}`);
    }

    // 3. Map channel types to categories
    const typeToCategoryMap: Record<string, string> = {
      'announcement': 'announcement',
      'department': 'department',
      'project': 'project', 
      'initiative': 'project',
      'temporary': 'general',
      'emergency': 'announcement'
    };

    // 4. Update channels
    console.log('\n🔄 Updating channel categories...');
    let updatedCount = 0;

    for (const channel of channels) {
      const targetCategoryName = typeToCategoryMap[channel.channel_type];
      const targetCategoryId = targetCategoryName ? categoryMap.get(targetCategoryName) : null;

      if (targetCategoryId && targetCategoryId !== channel.category_id) {
        try {
          await this.updateChannel(channel.id, { category_id: targetCategoryId });
          
          const categoryName = categories.find(c => c.id === targetCategoryId)?.name || 'Unknown';
          console.log(`   ✅ Updated "${channel.name}" → ${categoryName} category`);
          updatedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to update "${channel.name}": ${error}`);
        }
      } else if (targetCategoryId === channel.category_id) {
        console.log(`   ⚪ "${channel.name}" already has correct category`);
      } else {
        console.log(`   ❓ No mapping found for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 5. Show final results
    console.log('\n📊 Final category distribution:');
    const updatedChannels = await this.getChannels();
    const distribution = new Map<string, number>();

    updatedChannels.forEach(channel => {
      const categoryName = categories.find(c => c.id === channel.category_id)?.name || 'Uncategorized';
      distribution.set(categoryName, (distribution.get(categoryName) || 0) + 1);
    });

    Array.from(distribution.entries())
      .sort(([,a], [,b]) => b - a)
      .forEach(([categoryName, count]) => {
        console.log(`   - ${categoryName}: ${count} channel(s)`);
      });

    console.log(`\n✅ Fix completed! Updated ${updatedCount} channel(s).`);
  }
}

async function main() {
  const fixer = new CategoryFixer();
  
  try {
    await fixer.login();
    await fixer.fixChannelCategories();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}