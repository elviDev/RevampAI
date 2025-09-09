# OpenAI API Key Setup for RevampAI

## 🔑 Quick Setup

The voice processing features in RevampAI require an OpenAI API key to work properly. Here's how to set it up:

### Method 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```bash
   node setup-openai.js
   ```

2. **Enter your OpenAI API key when prompted**

3. **Restart your servers:**
   ```bash
   npm run backend:dev
   npm run android  # or npm run ios
   ```

### Method 2: Manual Setup

1. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Update environment files:**
   
   **Frontend (.env):**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
   
   **Backend (backend/.env):**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart your servers**

## 🧪 Testing Voice Features

Once configured, test the voice processing:

1. **Open the mobile app**
2. **Grant microphone permissions**
3. **Try voice commands like:**
   - "Create a new task called Meeting Preparation"
   - "Assign this task to John Smith"
   - "Set the priority to high"
   - "Create a channel for Project Alpha"

## 🎯 What Voice Processing Does

With OpenAI integration, your voice commands are processed using GPT-4 to:

- **Parse complex commands** with multiple actions
- **Extract entities** (names, dates, priorities, etc.)
- **Generate task breakdowns** from high-level requests
- **Handle natural language** variations and context
- **Provide intelligent responses** to voice requests

## 💰 API Costs

Voice processing uses OpenAI's GPT-4 Turbo model:
- **Cost:** ~$0.01-0.03 per voice command
- **Usage:** Only when processing voice commands
- **Optimization:** Commands are cached and optimized for cost

## 🛠️ Troubleshooting

**"OpenAI API key not found" error:**
- Check that your API key is properly set in both .env files
- Restart your backend server after updating the key
- Ensure the key starts with `sk-`

**Voice commands not working:**
- Verify microphone permissions are granted
- Check that the backend server is running
- Look at backend logs for OpenAI API errors

**API key invalid:**
- Verify the key is correct on https://platform.openai.com/api-keys
- Check that your OpenAI account has available credits
- Ensure the key has proper permissions

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** for all secrets
- **Rotate keys periodically** for security
- **Monitor usage** on your OpenAI dashboard

## 📊 Monitoring Usage

- Check your usage at https://platform.openai.com/usage
- Set up billing alerts to avoid surprises
- Monitor the backend logs for API call patterns