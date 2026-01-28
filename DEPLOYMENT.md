# Deployment Guide for "Let Me Set You Up"

## Prerequisites

1. **TMDB API Key**
   - Sign up at [TMDB](https://www.themoviedb.org/)
   - Navigate to [API Settings](https://www.themoviedb.org/settings/api)
   - Request an API key (free)
   - Copy your API key

2. **GitHub Account**
   - Sign up at [GitHub](https://github.com) if you don't have an account

3. **Vercel Account**
   - Sign up at [Vercel](https://vercel.com) using your GitHub account

---

## Step 1: Setup Environment Variables Locally

1. In the `movie-recommendation-app` directory, create a `.env.local` file:

```bash
cd movie-recommendation-app
copy env.example .env.local
```

2. Edit `.env.local` and add your TMDB API key:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

3. Test locally:

```bash
npm install
npm run dev
```

4. Open [http://localhost:4000](http://localhost:4000) and verify everything works

---

## Step 2: Push to GitHub

### Option A: Create New Repository via GitHub Website

1. Go to [GitHub](https://github.com) and click "New Repository"
2. Name it `movie-recommendation-site` (or your preferred name)
3. Keep it **Public** (or Private if you prefer)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create Repository"

### Option B: Use GitHub CLI

```bash
gh repo create movie-recommendation-site --public --source=. --remote=origin
```

### Push Your Code

```bash
cd movie-recommendation-app

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Let Me Set You Up movie recommendation site"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/movie-recommendation-site.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)

2. Click **"Add New..."** → **"Project"**

3. **Import Git Repository**
   - Click "Import" next to your `movie-recommendation-site` repository
   - Vercel will auto-detect it's a Next.js project

4. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `movie-recommendation-app` (this repo is a monorepo; the Next.js app lives in this subfolder)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add (Required):
     - **Name**: `NEXT_PUBLIC_TMDB_API_KEY`
     - **Value**: Your TMDB API key
     - Select: Production, Preview, and Development
   - Add (Required):
     - **Name**: `NEXT_PUBLIC_TMDB_BASE_URL`
     - **Value**: `https://api.themoviedb.org/3`
     - Select: Production, Preview, and Development
   - Add (Optional - for Supabase):
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Your Supabase project URL
     - Select: Production, Preview, and Development
   - Add (Optional - for Supabase):
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon key
     - Select: Production, Preview, and Development

6. Click **"Deploy"**

7. Wait 2-3 minutes for deployment to complete

8. Click on the deployment URL to view your live site! 🎉

### Supabase Auth (Only if you're using Supabase)

If you set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, configure Supabase so auth redirects work on your Vercel URL:

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your production Vercel URL (e.g. `https://your-project.vercel.app`)
3. Add **Redirect URLs** (at minimum):
   - `https://your-project.vercel.app/auth/callback`
   - (Optional but recommended) `https://your-project.vercel.app/auth/callback-handler`

For local dev, keep these too:
- `http://localhost:4000/auth/callback`
- (Optional) `http://localhost:4000/auth/callback-handler`

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd movie-recommendation-app
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? movie-recommendation-site
# - In which directory is your code located? ./
# - Want to override the settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_TMDB_API_KEY
# Paste your API key when prompted
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_TMDB_BASE_URL
# Enter: https://api.themoviedb.org/3
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## Step 4: Post-Deployment

### Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

### Verify Deployment

1. Visit your Vercel URL (e.g., `movie-recommendation-site.vercel.app`)
2. Test all features:
   - ✅ Filters working
   - ✅ Movies loading
   - ✅ List/Grid view toggle
   - ✅ Movie preview modal
   - ✅ Trailer playback
   - ✅ Responsive design

### Monitor and Maintain

- **Analytics**: Vercel provides built-in analytics
- **Logs**: View deployment logs in Vercel Dashboard
- **Re-deploy**: Push to GitHub main branch to trigger auto-deploy
- **Rollback**: Use Vercel Dashboard to rollback to previous deployment if needed

---

## Troubleshooting

### Issue: "API Key Error" on Deployed Site

**Solution**: 
- Verify environment variables in Vercel Dashboard
- Make sure variable name starts with `NEXT_PUBLIC_`
- Redeploy after adding/updating environment variables

### Issue: Images Not Loading

**Solution**:
- Check that `image.tmdb.org` is in `next.config.js` domains
- Verify TMDB API key has image access

### Issue: Build Fails

**Solution**:
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### Issue: Movies Not Loading

**Solution**:
- Verify TMDB API key is valid
- Check browser console for API errors
- Ensure API key has proper permissions

---

## Updating Your Site

```bash
# Make changes to your code
# ...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# Vercel will automatically deploy the changes!
```

---

## Production Checklist

- [ ] TMDB API key added to Vercel environment variables
- [ ] Site loads without errors
- [ ] All filters functional
- [ ] Movies display correctly in both views
- [ ] Video previews work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Fast load times (<3s)

---

## Useful Links

- **Your Vercel Dashboard**: https://vercel.com/dashboard
- **TMDB API Docs**: https://developers.themoviedb.org/3
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify environment variables
4. Test locally with `npm run dev`
5. Check TMDB API status

---

**🎬 Congratulations! Your movie recommendation site is now live!**

