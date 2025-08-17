# Google Cloud Vision API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for API usage)

## Step 2: Enable APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Cloud Vision API** (for OCR functionality)
   - **Google Sheets API** (for fetching spreadsheet data)

## Step 3: Create Service Account for Google Sheets API

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: "CCT Sheets API"
   - Description: "Service account for CCT Google Sheets integration"
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"
6. Click on the created service account
7. Go to the "Keys" tab
8. Click "Add Key" > "Create New Key" > "JSON"
9.  Download the JSON key file
10. Save it as `google-sheets-credentials.json` in your project root (add to .gitignore)

## Step 4: Set Environment Variables

### Option A: Local Development (.env file)
Create a `.env` file in your project root:
```
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here
GOOGLE_SHEETS_CREDENTIALS_PATH=./google-sheets-credentials.json
```

### Option B: System Environment Variable
Set the environment variables in your system:

**Windows (PowerShell):**
```powershell
$env:GOOGLE_CLOUD_VISION_API_KEY="your_vision_api_key_here"
$env:GOOGLE_SHEETS_CREDENTIALS_PATH="./google-sheets-credentials.json"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here
set GOOGLE_SHEETS_CREDENTIALS_PATH=./google-sheets-credentials.json
```

**Linux/Mac:**
```bash
export GOOGLE_CLOUD_VISION_API_KEY="your_vision_api_key_here"
export GOOGLE_SHEETS_CREDENTIALS_PATH="./google-sheets-credentials.json"
```

## Step 5: Share Google Sheets with Service Account

1. Open your Google Sheets document
2. Click "Share" in the top right
3. Add the service account email (found in the JSON credentials file) as a viewer
4. The email will look like: `cct-sheets-api@your-project-id.iam.gserviceaccount.com`

## Step 6: Restart Development Server

After setting the environment variables, restart your development server:
```bash
npm run dev
```

## Pricing Information

- **Cloud Vision API**:
  - Free Tier: 1,000 requests per month
  - Paid Tier: $1.50 per 1,000 requests

- **Google Sheets API**:
  - Free Tier: 300 requests per minute per user
  - Paid Tier: $0.10 per 1,000 requests

## Security Notes

- Never commit your API keys or service account credentials to version control
- Use environment variables to store sensitive keys
- Consider restricting the API keys to specific domains/IPs
- Monitor usage in Google Cloud Console
- Add `google-sheets-credentials.json` to your `.gitignore` file

## Testing the Setup

1. Set up the API keys and credentials as described above
2. Restart your development server
3. Go to `/test-sheets` page
4. Enter your Google Sheets ID: `1Ox7NruSIuN-MATGW2RVeYq66HKQTbdMpb8opix3wggs`
5. Click "Fetch from Google Sheets"
6. You should see all 30 players from the guild

## Troubleshooting

- **"No data found" error**: Make sure the service account has access to the spreadsheet
- **"Invalid credentials" error**: Check that the credentials file path is correct
- **"API not enabled" error**: Ensure both Cloud Vision API and Google Sheets API are enabled
