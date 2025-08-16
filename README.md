# Chaos Control Team (CCT) Guild Battle Analyzer

A modern web application that analyzes guild battle screenshots from Cookie Run Kingdom and converts the results into detailed Excel reports with performance insights. Built specifically for the Chaos Control Team guild with Sonic-inspired theming.

## ⚡ Features

- **Smart Image Upload**: Drag and drop or click to upload guild battle screenshots
- **Automatic Data Extraction**: Advanced OCR technology to extract player performance data
- **Performance Analytics**: Comprehensive analysis of guild member performance
- **Excel Export**: Download formatted Excel reports for record keeping
- **Performance Insights**: AI-powered insights and recommendations
- **Modern UI**: Beautiful, responsive design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CCT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📊 How It Works

1. **Upload Screenshot**: Upload a screenshot of your guild battle results
2. **Automatic Analysis**: The system uses OCR to extract player data including:
   - Player names and rankings
   - Damage dealt (in Billions)
   - Battles completed
   - Average damage per ticket
3. **Performance Insights**: Get AI-generated insights about guild performance
4. **Excel Export**: Download a comprehensive Excel report with all data

## 🛠️ Technology Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: SCSS with modern CSS features
- **Excel Generation**: XLSX library
- **File Handling**: File-saver for downloads
- **Animations**: GSAP for smooth interactions

## 📁 Project Structure

```
CCT/
├── pages/
│   └── index.vue          # Main landing page
├── utils/
│   └── battleAnalyzer.ts  # Core analysis logic
├── assets/
│   └── scss/
│       └── main.scss      # Global styles
├── components/            # Reusable Vue components
├── public/               # Static assets
└── nuxt.config.ts        # Nuxt configuration
```

## 🎯 Key Components

### BattleAnalyzer Class
Located in `utils/battleAnalyzer.ts`, this class handles:
- Image analysis and data extraction
- Statistical calculations
- Performance insights generation
- Data validation and formatting

### Main Landing Page
The `pages/index.vue` file contains:
- Hero section with animated cookie illustrations
- File upload area with drag-and-drop support
- Results display with statistics and insights
- Excel export functionality
- Responsive design for all devices

## 🎨 Design Features

- **Sonic-Inspired Theme**: Blue gradient backgrounds with orange and gold accents
- **Glassmorphism**: Modern glass-like UI elements
- **Smooth Animations**: Floating rings, chaos emeralds, and Sonic character animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **CCT Branding**: Chaos Control Team logo and guild information display

## 📈 Data Analysis

The analyzer provides comprehensive insights including:
- Total players and their rankings
- Highest and average damage statistics (in Billions)
- Battle participation analysis
- Average damage per ticket efficiency
- Guild requirements compliance (Red Velvet Dragon, Avatar of Destiny, Living Abyss)
- Performance grades and recommendations
- Guild performance trends

## 🔧 Customization

### Adding New Analysis Features
1. Extend the `BattleAnalyzer` class in `utils/battleAnalyzer.ts`
2. Add new methods for additional calculations
3. Update the UI components to display new data

### Styling Changes
- Modify SCSS variables in `assets/scss/main.scss`
- Update component-specific styles in `pages/index.vue`
- Add new CSS classes for custom elements

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Generate Static Site
```bash
npm run generate
```

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Cookie Run Kingdom for the amazing game
- The Vue.js and Nuxt.js communities
- Chaos Control Team guild members
- All contributors and supporters

## 📞 Support

If you have any questions or need help, please contact the CCT guild leadership.

---

Made with ⚡ for Chaos Control Team guild leaders!
