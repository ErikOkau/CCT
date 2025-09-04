# 🚀 Deployment Guide: Vercel + Supabase

This guide will walk you through deploying your Nuxt.js application to Vercel with Supabase as your backend.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Vercel CLI](https://vercel.com/cli) (optional but recommended)
- A [Supabase](https://supabase.com/) account
- A [Vercel](https://vercel.com/) account

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `cct-guild-battle-analyzer` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_KEY) - Keep this secret!

### 1.3 Set Up Database Schema

You can use your existing Prisma schema or create tables directly in Supabase:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle data table
CREATE TABLE public.battle_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  player_name TEXT NOT NULL,
  red_velvet_damage BIGINT DEFAULT 0,
  red_velvet_battles INTEGER DEFAULT 0,
  avatar_damage BIGINT DEFAULT 0,
  avatar_battles INTEGER DEFAULT 0,
  living_abyss_damage BIGINT DEFAULT 0,
  living_abyss_battles INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view battle data" ON public.battle_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert battle data" ON public.battle_data
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));
```

## ☁️ Step 2: Deploy to Vercel

### 2.1 Prepare Your Repository

1. Make sure your code is pushed to GitHub/GitLab/Bitbucket
2. Ensure you have the following files in your project:
   - `vercel.json` ✅ (already created)
   - `nuxt.config.ts` ✅ (already updated)
   - `package.json` ✅ (already exists)

### 2.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com/) and sign up/login
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Nuxt.js (should auto-detect)
   - **Root Directory**: `./` (if your project is in the root)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.output` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

### 2.3 Set Environment Variables

In your Vercel project settings, add these environment variables:

```bash
# ChatGPT API Configuration
CHATGPT_API=your_chatgpt_api_key

# Google Sheets Configuration (if using)
GOOGLE_SHEETS_CREDENTIALS_PATH=/tmp/credentials.json
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 🔧 Step 3: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## 🔄 Step 4: Set Up Continuous Deployment

Your app will automatically redeploy when you push changes to your main branch.

### Development Workflow:

1. Make changes locally
2. Test with `npm run dev`
3. Commit and push to GitHub
4. Vercel automatically deploys the changes

## 🛠️ Step 5: Update Your Application

### Update Authentication

Replace your current auth system with Supabase auth:

```vue
<!-- In your login.vue -->
<script setup>
import { useSupabase } from '~/composables/useSupabase'

const { signIn, loading } = useSupabase()

const loginForm = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const { error } = await signIn(loginForm.value.email, loginForm.value.password)
  if (error) {
    console.error('Login error:', error)
  } else {
    // Redirect to dashboard
    await navigateTo('/')
  }
}
</script>
```

### Update Database Operations

Replace Prisma with Supabase:

```typescript
// In your composables
import { supabase } from '~/utils/supabase'

export const useDatabase = () => {
  const saveBattleData = async (data: any) => {
    const { data: result, error } = await supabase
      .from('battle_data')
      .insert(data)
    
    return { data: result, error }
  }

  const getBattleData = async (season: string) => {
    const { data, error } = await supabase
      .from('battle_data')
      .select('*')
      .eq('season', season)
    
    return { data, error }
  }

  return {
    saveBattleData,
    getBattleData
  }
}
```

## 🔍 Step 6: Testing Your Deployment

1. **Test Authentication**: Try logging in/out
2. **Test Database**: Save and retrieve data
3. **Test API Routes**: Ensure server-side functions work
4. **Test Google Sheets**: Verify Google Sheets integration still works

## 🚨 Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**
   - Double-check variable names in Vercel
   - Ensure no typos in values
   - Redeploy after adding variables

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check if your IP is allowed in Supabase
   - Ensure RLS policies are correct

3. **Build Failures**
   - Check Vercel build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

4. **CORS Issues**
   - Add your Vercel domain to Supabase allowed origins
   - Check Supabase → Settings → API → Allowed Origins

### Useful Commands:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull .env.local
```

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Database performance and logs
- **Error Tracking**: Consider adding Sentry for error monitoring

## 🔐 Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable RLS** in Supabase
4. **Regular security updates** for dependencies
5. **Monitor access logs** in Supabase

## 🎉 You're Live!

Your application is now deployed and ready for production use! 

- **Frontend**: Hosted on Vercel
- **Backend**: Supabase (Database + Auth + API)
- **Domain**: Your custom domain or Vercel subdomain

Remember to:
- Set up monitoring and alerts
- Configure backups for your database
- Set up a staging environment for testing
- Document your deployment process for your team

Happy coding! 🚀
