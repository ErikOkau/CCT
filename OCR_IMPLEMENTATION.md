# OCR Implementation for Battle Result Screenshots

This document explains the OCR (Optical Character Recognition) implementation for analyzing guild battle result screenshots in the CCT application.

## Overview

The application uses two OCR methods to extract player data from battle result screenshots:

1. **Google Cloud Vision API** (Primary) - Cloud-based OCR service
2. **Tesseract.js** (Fallback) - Client-side OCR library

## Features

### Supported Screenshot Formats

The OCR system is designed to handle guild battle participant screenshots that contain:

- Player names and levels
- Player titles/achievements
- Red Velvet Dragon battle counts and damage
- Avatar of Destiny battle counts and damage
- Season total battle counts and damage
- Guild ranks (Leader, Officer, Member)

### Pattern Recognition

The system uses multiple regex patterns to extract data from OCR text:

1. **Full Format**: Player name, level, title, battle counts, and damage
2. **Level + Damage**: Player name, level, and damage numbers
3. **Damage Only**: Player name and damage numbers (fallback)
4. **N/A Handling**: Cases where some columns show "N/A"

### Data Validation

- Player name validation (length, format)
- Damage number parsing (handles commas, spaces)
- Battle count calculation from damage
- Duplicate player detection and merging

## Configuration

### OCR Settings

```typescript
const OCR_CONFIG = {
  // Google Cloud Vision API settings
  googleVision: {
    features: [
      { type: 'TEXT_DETECTION' },
      { type: 'DOCUMENT_TEXT_DETECTION' }
    ],
    imageContext: {
      languageHints: ['en'],
      productSearchParams: {
        productCategories: ['general-v1'],
        filter: ''
      }
    }
  },
  
  // Tesseract.js settings
  tesseract: {
    language: 'eng',
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
      }
    }
  },
  
  // Pattern matching thresholds
  thresholds: {
    minPlayersForSuccess: 2,
    maxPlayersPerScreenshot: 10,
    minPlayerNameLength: 2,
    maxPlayerNameLength: 20,
    minDamageForValidPlayer: 1000000, // 1M minimum damage
    defaultPlayerLevel: 50,
    defaultTitle: 'Unknown Title'
  },
  
  // Battle count estimation
  battleEstimation: {
    redVelvetAvgDamagePerBattle: 11000000000, // 11B
    avatarAvgDamagePerBattle: 5500000000,     // 5.5B
    maxBattlesPerPlayer: 15
  }
}
```

## Implementation Details

### Google Cloud Vision API

**Endpoint**: `/api/analyze-screenshot`

**Features**:
- Text detection and document text detection
- English language hints for better accuracy
- Enhanced error handling with user-friendly messages
- Response validation and logging

**Setup Required**:
1. Google Cloud Vision API key in environment variable `GOOGLE_CLOUD_VISION_API_KEY`
2. Enable Google Cloud Vision API in Google Cloud Console

### Tesseract.js

**Features**:
- Client-side OCR processing
- Image preprocessing for better text recognition
- Progress logging
- Fallback when Google Vision API is unavailable

**Image Preprocessing**:
- Grayscale conversion
- Contrast enhancement
- Thresholding for better text recognition

### Text Parsing

The `parseExtractedText` method uses multiple regex patterns to extract:

1. **Player Information**:
   - Name (validated for length and format)
   - Level (parsed as integer)
   - Title (extracted from text)

2. **Battle Data**:
   - Red Velvet Dragon battles and damage
   - Avatar of Destiny battles and damage
   - Season total battles and damage

3. **Data Validation**:
   - Minimum damage thresholds
   - Battle count estimation from damage
   - Guild rank inference

## Usage

### Basic Usage

```typescript
import { BattleAnalyzer } from '~/utils/battleAnalyzer'

// Analyze screenshots
const players = await BattleAnalyzer.analyzeScreenshots(imageFiles)

// Get statistics
const stats = BattleAnalyzer.calculateStats(players)

// Generate insights
const insights = BattleAnalyzer.generateInsights(players)
```

### Error Handling

The system includes comprehensive error handling:

- **API Key Missing**: Graceful fallback to Tesseract.js
- **Rate Limiting**: User-friendly error messages
- **Invalid Images**: Validation and helpful error messages
- **OCR Failures**: Fallback to hardcoded data

## Performance Considerations

### Google Cloud Vision API
- **Cost**: Pay-per-use pricing
- **Speed**: Fast processing (1-3 seconds)
- **Accuracy**: High accuracy for text recognition
- **Limits**: Rate limits and quota restrictions

### Tesseract.js
- **Cost**: Free (client-side processing)
- **Speed**: Slower processing (5-15 seconds)
- **Accuracy**: Good accuracy with preprocessing
- **Limits**: Browser memory and processing power

## Troubleshooting

### Common Issues

1. **No Players Detected**:
   - Check image quality and resolution
   - Verify screenshot contains participant data
   - Review OCR configuration thresholds

2. **Incorrect Data Extraction**:
   - Adjust regex patterns for new screenshot formats
   - Update battle count estimation values
   - Review image preprocessing settings

3. **API Errors**:
   - Verify Google Cloud Vision API key
   - Check API quota and rate limits
   - Review network connectivity

### Debugging

Enable console logging to debug OCR issues:

```typescript
// Check OCR results
console.log('OCR Text:', extractedText)

// Review parsed players
console.log('Parsed Players:', players)

// Validate data
console.log('Validation Results:', validationResults)
```

## Future Enhancements

1. **Machine Learning**: Train custom models for better accuracy
2. **Image Enhancement**: Advanced preprocessing algorithms
3. **Multi-language Support**: Support for other languages
4. **Real-time Processing**: WebSocket-based real-time OCR
5. **Batch Processing**: Optimize for multiple screenshots

## Security Considerations

1. **API Key Protection**: Store keys securely in environment variables
2. **Image Privacy**: Process images locally when possible
3. **Data Validation**: Validate all extracted data before use
4. **Rate Limiting**: Implement client-side rate limiting

## Contributing

When adding new screenshot formats or improving OCR accuracy:

1. Test with various screenshot formats
2. Update regex patterns as needed
3. Adjust configuration thresholds
4. Add comprehensive error handling
5. Update documentation
