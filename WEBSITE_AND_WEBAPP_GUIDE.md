# CCT Guild Battle Analyzer - Website & Web App Guide

Your project is now configured to work as **both a traditional website and a modern web application**! Here's how to use each mode:

## 🌐 Website Mode (Static Site)

### What it is:
- Traditional website that works like any other site
- Server-side rendered content
- SEO-friendly
- Fast loading
- Works without JavaScript

### How to build for website mode:
```bash
# Generate static site
npm run generate

# Preview the static site
npm run preview
```

### Features in website mode:
- ✅ Guild information display
- ✅ Boss schedules
- ✅ Hall of Glory (static data)
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Fast loading

## 📱 Web App Mode (Progressive Web App)

### What it is:
- Modern web application with app-like features
- Can be installed on mobile devices
- Works offline
- Dynamic interactions
- Real-time data updates

### How to use web app mode:
```bash
# Development mode (full web app features)
npm run dev

# Production build
npm run build
npm run preview
```

### Features in web app mode:
- ✅ All website features
- ✅ Installable on mobile devices
- ✅ Offline functionality
- ✅ Real-time battle analysis
- ✅ Google Sheets integration
- ✅ Dynamic data loading
- ✅ Interactive components

## 🚀 Deployment Options

### 1. Static Website Deployment (Recommended for website mode)
```bash
# Build static site
npm run generate

# Deploy to any static hosting:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - Any web server
```

### 2. Full Web App Deployment (Recommended for web app mode)
```bash
# Build for production
npm run build

# Deploy to:
# - Vercel (recommended)
# - Netlify
# - Heroku
# - DigitalOcean
# - Any Node.js hosting
```

## 📋 Configuration Details

### Current Setup:
- **SSR Enabled**: `ssr: true` - Server-side rendering for better SEO
- **Static Generation**: `prerender: { routes: ['/'] }` - Pre-renders main page
- **PWA Features**: Service worker, manifest, offline caching
- **Responsive Design**: Works on all devices
- **SEO Optimized**: Meta tags, proper titles, descriptions

### Build Scripts:
- `npm run dev` - Development with hot reload
- `npm run build` - Production build
- `npm run generate` - Static site generation
- `npm run preview` - Preview built site

## 🎯 Use Cases

### Use Website Mode When:
- You want maximum SEO
- You need fast loading times
- You're deploying to static hosting
- Content doesn't change frequently
- You want simple deployment

### Use Web App Mode When:
- You need real-time features
- You want offline functionality
- You need dynamic data loading
- You want app-like experience
- You need Google Sheets integration

## 🔧 Customization

### Adding More Static Pages:
1. Create new `.vue` files in `pages/`
2. Add routes to `prerender` in `nuxt.config.ts`
3. They'll be included in static generation

### Adding More Web App Features:
1. Create new API routes in `server/api/`
2. Add dynamic components
3. Implement real-time updates

### PWA Customization:
- Edit `public/manifest.json` for app details
- Modify `public/sw.js` for caching strategy
- Update `plugins/pwa.client.ts` for install prompts

## 📱 Mobile Installation

### Android:
1. Open the site in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home screen"
4. Follow prompts

### iOS:
1. Open the site in Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. Follow prompts

## 🎨 Styling & Theming

The project uses:
- **SCSS** for styling
- **Responsive design** for all screen sizes
- **Dark theme** optimized for gaming
- **Custom animations** and transitions

## 🔄 Data Management

### Static Data (Website Mode):
- Guild information
- Boss schedules
- Static Hall of Glory data

### Dynamic Data (Web App Mode):
- Real-time battle analysis
- Google Sheets integration
- User authentication
- Database storage

## 🚀 Performance Tips

### For Website Mode:
- Images are optimized and cached
- CSS is minified
- Static assets are compressed
- Fast initial load times

### For Web App Mode:
- Service worker caches resources
- Lazy loading for components
- Optimized bundle sizes
- Offline functionality

## 📊 Analytics & Monitoring

### Built-in Features:
- Error tracking
- Performance monitoring
- User interaction tracking
- Offline usage analytics

## 🔒 Security

### Implemented:
- HTTPS required for PWA features
- Secure API endpoints
- Environment variable protection
- Input validation

## 🎯 Next Steps

1. **Choose your deployment strategy** based on your needs
2. **Test both modes** to see which works better for your use case
3. **Customize the PWA** features as needed
4. **Add more dynamic features** for web app mode
5. **Optimize for your specific hosting platform**

Your project is now ready to work as both a professional website and a modern web application! 🎉
