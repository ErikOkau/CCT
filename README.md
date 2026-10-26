# Chaos Control Team (CCT) Guild Battle Analyzer

Guild battle analytics for **Chaos Control Team** (Cookie Run: Kingdom): live data from the guild Google Sheet, boss guides, and optional Discord OCR import.

## ⚡ Features

- **Season analyzer** — reads guild tabs from Google Sheets (per-season boss columns, ticket totals)
- **Hall of Glory** — all-time boss champions across **all four bosses** (RVD, AoD, LA, MG)
- **Boss guides** — MGEV / TLA / AoD teams, gear targets, timings
- **Cookie Alliance & Kingdom Arena** — doc-only autoplay guides (no Gear Check)
- **Homepage boss bars** — optional sheet tab **Guild Progress** (boss level, HP %, guild DMG) drives the hero background
- **Gear Check** (`/tools/gear-check`) — OpenAI vision vs **guild boss** guide targets only
- **Discord bot** (`services/discord-ocr-bot`) — `?submit_result` with Participants screenshots → sheet
- **Excel export** — download reports from the analyzer

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

1. **Officers** import battle results via the Discord bot (or maintain the sheet manually).
2. The **website** loads the active season tab and shows rankings, boss columns, and insights.
3. **Gear Check** compares cookie stats from a Gear screenshot to CCT guide targets.
4. Guild Leader / Officer badges are set in `utils/guildRanks.ts` (hardcoded names).
5. **Guild Progress tab** (optional): paste **level / HP % / round / trophies** from the in-game hub. **Total boss damage** on the homepage is summed automatically from the active season sheet tab. There is no reliable public per-level HP table for modern bosses, so level cannot be computed from damage alone — see `utils/guildBossLevelEstimate.ts`.

Copy `.env` from `env.example` — `GOOGLE_SHEETS_CREDENTIALS`, `CHATGPT_API` (vision), optional `OPENAI_VISION_MODEL`.

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
