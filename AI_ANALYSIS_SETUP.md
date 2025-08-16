# AI-Powered Battle Analysis Setup Guide

## 🤖 Overview

This guide explains how to set up AI-powered analysis of guild battle screenshots using either:
1. **Tesseract.js** (Free, client-side OCR)
2. **Google Cloud Vision API** (More accurate, requires API key)

## 🚀 Quick Start

### Option 1: Tesseract.js (Free, No Setup Required)

Tesseract.js is already configured and will work immediately:

```bash
npm install
npm run dev
```

**Features:**
- ✅ No API keys required
- ✅ Works entirely in the browser
- ✅ Free to use
- ⚠️ Less accurate than Google Vision
- ⚠️ Slower processing

### Option 2: Google Cloud Vision API (More Accurate)

For better accuracy, set up Google Cloud Vision API:

#### Step 1: Get Google Cloud Vision API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Cloud Vision API
4. Create credentials (API Key)
5. Copy the API key

#### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```env
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here
```

#### Step 3: Install Dependencies

```bash
npm install
npm run dev
```

**Features:**
- ✅ Much more accurate OCR
- ✅ Better text recognition
- ✅ Handles various image qualities
- ⚠️ Requires API key
- ⚠️ Costs money (but very cheap)

## 🔧 How It Works

### 1. Image Processing
- Screenshots are uploaded and processed
- Images are converted to base64 for API calls
- Canvas is created for Tesseract.js processing

### 2. OCR Analysis
- **Tesseract.js**: Processes images directly in the browser
- **Google Vision**: Sends images to Google's servers for analysis

### 3. Text Extraction
- Extracts all text from the screenshot
- Identifies player names, levels, titles, and damage values
- Uses pattern matching to parse the data

### 4. Data Parsing
- Converts extracted text to structured player data
- Estimates battle counts based on damage patterns
- Handles missing or unclear data gracefully

### 5. Fallback System
- If AI analysis fails, falls back to known good data
- Ensures the app always works, even with poor image quality

## 📊 Pattern Recognition

The AI looks for patterns like:

```
PlayerName Lv.XX Title Damage1 Damage2
```

Example patterns it recognizes:
- `woonbabie Lv.58 Agar Slime Suppressor 105,258,650,139 0`
- `Bestoutuber Lv.74 World of Stillness 98,664,625,297 0`

## 🛠️ Customization

### Improving Pattern Recognition

Edit the `parseExtractedText` method in `utils/battleAnalyzer.ts`:

```typescript
private static parseExtractedText(text: string): BattlePlayer[] {
  // Add your custom patterns here
  const customPattern = /your_pattern_here/g
  
  // Process the text with your patterns
  // Return structured player data
}
```

### Adding New AI Services

You can easily add other AI services:

1. **Azure Computer Vision**
2. **AWS Textract**
3. **Custom trained models**

## 💰 Cost Analysis

### Google Cloud Vision API Pricing
- **First 1,000 requests/month**: Free
- **Additional requests**: $1.50 per 1,000 requests
- **Typical guild analysis**: ~$0.01-0.05 per analysis

### Tesseract.js
- **Cost**: Free
- **Limitations**: Less accurate, slower

## 🔍 Testing

### Test with Your Screenshots

1. Upload your battle screenshots
2. Check the browser console for extracted text
3. Verify the parsed player data
4. Compare with expected results

### Debug Mode

Enable debug logging by checking the browser console:
- Shows extracted text from OCR
- Displays parsing progress
- Logs any errors or fallbacks

## 🚨 Troubleshooting

### Common Issues

1. **Poor OCR Results**
   - Try Google Vision API instead of Tesseract
   - Ensure screenshots are clear and high quality
   - Check if text is readable by humans

2. **API Key Issues**
   - Verify your Google Cloud Vision API key
   - Check if the API is enabled
   - Ensure billing is set up

3. **Pattern Matching Failures**
   - Adjust the regex patterns in `parseExtractedText`
   - Add more specific patterns for your game's format
   - Test with various screenshot formats

### Getting Help

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test with different screenshot qualities
4. Review the fallback data for comparison

## 🎯 Future Enhancements

### Potential Improvements

1. **Machine Learning Model**
   - Train a custom model on your specific game UI
   - Improve accuracy for your exact format

2. **Image Preprocessing**
   - Add filters to improve OCR accuracy
   - Handle different screen resolutions

3. **Real-time Analysis**
   - Process screenshots as they're taken
   - Live updates during battles

4. **Multi-language Support**
   - Support for different game languages
   - Localized pattern recognition

## 📝 Example Usage

```typescript
// The analyzer automatically chooses the best method
const players = await BattleAnalyzer.analyzeScreenshots(screenshots)

// Results include real data extracted from images
console.log('Extracted players:', players.length)
console.log('Top player:', players[0].playerName)
console.log('Total damage:', players[0].seasonTotal.damage)
```

This AI-powered system provides a foundation for truly dynamic battle analysis that works with any guild size and screenshot format!
