# 🚀 Vercel Deployment Guide for CCT Guild Battle Analyzer

Your web app is **perfectly optimized** for Vercel deployment! Here's how to deploy it:

## 📋 **Prerequisites**

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables** - If you're using Google Sheets API

## 🎯 **Deployment Options**

### **Option 1: Full Web App (Recommended)**
This gives you the complete web app experience with all features.

### **Option 2: Static Website**
This creates a fast, static version for maximum performance.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### **Step 2: Connect to Vercel**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in** with your GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Select the CCT repository**

### **Step 3: Configure Project**

Vercel will automatically detect it's a Nuxt.js project. The settings should be:

- **Framework Preset**: Nuxt.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.output` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### **Step 4: Set Environment Variables (If Needed)**

If you're using Google Sheets API or ChatGPT, add these in the Vercel dashboard:

1. **Go to Project Settings**
2. **Environment Variables**
3. **Add these variables**:
   ```
   CHATGPT_API=your_chatgpt_api_key
   GOOGLE_SHEETS_CREDENTIALS=your_credentials_here
   ```

### **Step 5: Deploy**

1. **Click "Deploy"**
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Your app will be live!** 🎉

## 🌐 **Your App URLs**

After deployment, you'll get:

- **Production URL**: `https://your-project-name.vercel.app`
- **Custom Domain**: You can add your own domain later

## 📱 **PWA Features on Vercel**

Your app will have full PWA functionality:

- ✅ **Installable** on mobile devices
- ✅ **Offline support** via service worker
- ✅ **App-like experience**
- ✅ **Fast loading** with edge caching
- ✅ **HTTPS** automatically enabled

## 🔧 **Vercel Configuration**

The `vercel.json` file I created optimizes:

- **Service Worker** caching
- **Image optimization**
- **API routes** handling
- **Static assets** caching
- **PWA manifest** serving

## 📊 **Performance Features**

Vercel provides:

- **Edge Network** - Global CDN
- **Automatic HTTPS** - Security by default
- **Image Optimization** - Automatic image compression
- **Function Optimization** - Serverless API routes
- **Analytics** - Built-in performance monitoring

## 🔄 **Automatic Deployments**

Vercel will automatically:

- **Deploy on every push** to main branch
- **Create preview deployments** for pull requests
- **Rollback** to previous versions if needed
- **Scale automatically** based on traffic

## 🎯 **Deployment Modes**

### **Full Web App Mode**
```bash
# This is the default - gives you everything
npm run build
```

**Features:**
- ✅ Real-time battle analysis
- ✅ Google Sheets integration
- ✅ User authentication
- ✅ Dynamic data loading
- ✅ PWA functionality
- ✅ Offline support

### **Static Website Mode**
```bash
# For maximum performance
npm run generate
```

**Features:**
- ✅ Ultra-fast loading
- ✅ Maximum SEO
- ✅ Static content
- ✅ Guild information
- ✅ Boss schedules

## 🚀 **Advanced Configuration**

### **Custom Domain**
1. **Go to Project Settings**
2. **Domains**
3. **Add your domain**
4. **Configure DNS** as instructed

### **Environment Variables**
```bash
# Development
CHATGPT_API=dev_key
GOOGLE_SHEETS_CREDENTIALS=dev_creds

# Production
CHATGPT_API=prod_key
GOOGLE_SHEETS_CREDENTIALS=prod_creds
```

### **Branch Deployments**
- **Main branch** → Production
- **Feature branches** → Preview deployments
- **Pull requests** → Preview deployments

## 📱 **Mobile Testing**

After deployment:

1. **Open your Vercel URL** on mobile
2. **Test PWA installation**:
   - **Android**: Chrome → Menu → "Add to Home screen"
   - **iOS**: Safari → Share → "Add to Home Screen"
3. **Test offline functionality**
4. **Test all interactive features**

## 🔍 **Monitoring & Analytics**

Vercel provides:

- **Real-time analytics**
- **Performance monitoring**
- **Error tracking**
- **Function logs**
- **Deployment history**

## 🎉 **Success Checklist**

After deployment, verify:

- ✅ **Site loads** on desktop and mobile
- ✅ **PWA installs** on mobile devices
- ✅ **Offline functionality** works
- ✅ **Battle analysis** features work
- ✅ **Google Sheets integration** works (if configured)
- ✅ **All images** load properly
- ✅ **Responsive design** works on all screen sizes

## 🆘 **Troubleshooting**

### **Build Fails**
- Check **environment variables** are set
- Verify **Node.js version** (Vercel uses 18.x)
- Check **package.json** dependencies

### **PWA Not Working**
- Ensure **HTTPS** is enabled (automatic on Vercel)
- Check **manifest.json** is accessible
- Verify **service worker** is registered

### **API Routes Not Working**
- Check **environment variables**
- Verify **function configuration** in vercel.json
- Check **runtime** settings

## 🎯 **Next Steps**

1. **Deploy to Vercel** using the steps above
2. **Test all features** on mobile and desktop
3. **Add custom domain** if desired
4. **Set up monitoring** and analytics
5. **Configure environment variables** for production
6. **Share your live app** with your guild! 🎉

Your CCT Guild Battle Analyzer will be live and accessible worldwide! 🌍
