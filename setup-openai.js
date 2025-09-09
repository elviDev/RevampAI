#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 OpenAI API Key Setup for RevampAI\n');
console.log('This script will help you configure your OpenAI API key for the voice processing features.\n');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateEnvFile(filePath, apiKey) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filePath} does not exist, skipping...`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the placeholder with the actual key
    content = content.replace(
      /OPENAI_API_KEY=your_openai_api_key_here/g,
      `OPENAI_API_KEY=${apiKey}`
    );

    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  try {
    // Get API key from user
    const apiKey = await question('Please enter your OpenAI API key: ');
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('❌ No API key provided. Exiting...');
      rl.close();
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      console.log('⚠️  Warning: OpenAI API keys typically start with "sk-"');
      const proceed = await question('Continue anyway? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('\n🔄 Updating environment files...\n');

    // Update both .env files
    const frontendEnv = path.join(__dirname, '.env');
    const backendEnv = path.join(__dirname, 'backend', '.env');

    const frontendUpdated = await updateEnvFile(frontendEnv, apiKey);
    const backendUpdated = await updateEnvFile(backendEnv, apiKey);

    if (frontendUpdated || backendUpdated) {
      console.log('\n🎉 OpenAI API key has been configured successfully!\n');
      
      console.log('📝 Next steps:');
      console.log('1. Restart your backend server: npm run backend:dev');
      console.log('2. Restart your mobile app: npm run android (or ios)');
      console.log('3. Test voice commands in the app\n');
      
      console.log('🗣️  Try saying: "Create a new task called Meeting Preparation"');
      console.log('   The app will process your voice command using OpenAI GPT-4!\n');
    } else {
      console.log('❌ Failed to update any environment files.');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main();