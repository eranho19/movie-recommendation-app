# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to GitHub and Vercel.

---

## Pre-Deployment Checklist

### ✅ Local Setup
- [ ] TMDB API key obtained from https://www.themoviedb.org/settings/api
- [ ] `.env.local` file created with API key
- [ ] Dependencies installed (`npm install`)
- [ ] Application runs locally (`npm run dev`)
- [ ] Tested on http://localhost:4000
- [ ] All features working:
  - [ ] Genre filter works
  - [ ] Genre-specific tags appear
  - [ ] Minimum score slider works
  - [ ] Language filter (All/English/International) works
  - [ ] List view displays correctly
  - [ ] Grid view displays correctly
  - [ ] Movie preview modal opens
  - [ ] Trailers play
  - [ ] Awards display for high-rated movies
  - [ ] External links work
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors

---

## GitHub Deployment Checklist

### ✅ Repository Setup
- [ ] GitHub account created/logged in
- [ ] New repository created on GitHub
  - Name: `movie-recommendation-site` (or your choice)
  - Visibility: Public or Private
  - Do NOT initialize with README (we have one)

### ✅ Git Configuration
```bash
cd movie-recommendation-app
git init
git add .
git commit -m "Initial commit: Let Me Set You Up movie site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

- [ ] Git initialized
- [ ] All files added and committed
- [ ] Remote added with YOUR GitHub username
- [ ] Pushed to GitHub successfully
- [ ] Verified files on GitHub website

### ✅ Files to Verify on GitHub
- [ ] All source code files present
- [ ] `.gitignore` working (no `node_modules`, no `.env.local`)
- [ ] Documentation files visible:
  - [ ] README.md
  - [ ] QUICKSTART.md
  - [ ] DEPLOYMENT.md
  - [ ] PRD.md
  - [ ] FEATURES.md

---

## Vercel Deployment Checklist

### ✅ Vercel Account Setup
- [ ] Vercel account created at https://vercel.com
- [ ] Logged in with GitHub account (recommended)
- [ ] GitHub integration authorized

### ✅ Project Import
- [ ] Clicked "Add New..." → "Project" in Vercel Dashboard
- [ ] Found and selected your GitHub repository
- [ ] Vercel detected it as Next.js project ✓

### ✅ Project Configuration
- [ ] Framework Preset: **Next.js** (auto-detected)
- [ ] Root Directory: `movie-recommendation-app` (the Next.js app lives in this subfolder)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)

### ✅ Environment Variables
**CRITICAL**: Add these before deploying!

- [ ] Clicked "Environment Variables" section
- [ ] Added `NEXT_PUBLIC_TMDB_API_KEY`:
  - Name: `NEXT_PUBLIC_TMDB_API_KEY`
  - Value: Your actual TMDB API key
  - Environments: ✓ Production ✓ Preview ✓ Development
- [ ] Added `NEXT_PUBLIC_TMDB_BASE_URL`:
  - Name: `NEXT_PUBLIC_TMDB_BASE_URL`
  - Value: `https://api.themoviedb.org/3`
  - Environments: ✓ Production ✓ Preview ✓ Development

- [ ] (Optional) Added Supabase variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] (Optional) Supabase Auth URL Configuration updated for production:
  - Site URL: `https://your-project.vercel.app`
  - Redirect URLs include:
    - `https://your-project.vercel.app/auth/callback`
    - (Optional) `https://your-project.vercel.app/auth/callback-handler`

### ✅ Deploy
- [ ] Clicked "Deploy" button
- [ ] Waited for build to complete (2-3 minutes)
- [ ] Build succeeded ✓
- [ ] No build errors

---

## Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Visited Vercel deployment URL (e.g., `your-site.vercel.app`)
- [ ] Site loads without errors
- [ ] IMDb-style design appears correctly
- [ ] "Let Me Set You Up" title visible

### ✅ Test All Features
- [ ] **Filters**:
  - [ ] Genre filter works
  - [ ] Genre-specific tags appear when genres selected
  - [ ] Minimum score slider works
  - [ ] Language filter works (All/English/International)
  - [ ] Clear filters button works
- [ ] **Display**:
  - [ ] Movies load and display
  - [ ] List view works
  - [ ] Grid view works
  - [ ] View toggle works
  - [ ] Images load correctly
  - [ ] Rankings show (1, 2, 3...)
  - [ ] Scores display correctly
  - [ ] Award badges appear on high-rated movies
- [ ] **Preview**:
  - [ ] "Watch Preview" button works
  - [ ] Modal opens
  - [ ] Trailer plays (if available)
  - [ ] Awards section displays
  - [ ] Synopsis shows
  - [ ] External links work (IMDb, Rotten Tomatoes)
  - [ ] Close button works
- [ ] **Responsive**:
  - [ ] Works on mobile (test with browser dev tools)
  - [ ] Works on tablet
  - [ ] Works on desktop
  - [ ] No horizontal scrolling
  - [ ] Touch interactions work

### ✅ Performance Check
- [ ] Page loads in < 3 seconds
- [ ] No console errors in browser
- [ ] Images load properly
- [ ] Smooth animations and transitions

---

## Optional: Custom Domain

### ✅ Custom Domain Setup
- [ ] Domain purchased (from Namecheap, GoDaddy, etc.)
- [ ] In Vercel Dashboard → Settings → Domains
- [ ] Added custom domain
- [ ] Followed Vercel's DNS configuration instructions
- [ ] DNS propagated (can take 24-48 hours)
- [ ] SSL certificate issued automatically ✓
- [ ] Site accessible via custom domain

---

## Troubleshooting

### ❌ Build Failed
**Check**:
- [ ] All dependencies in `package.json`
- [ ] No TypeScript errors locally
- [ ] Build works locally (`npm run build`)
- [ ] Review Vercel build logs

### ❌ Environment Variables Not Working
**Check**:
- [ ] Variable names start with `NEXT_PUBLIC_`
- [ ] No quotes around values in Vercel
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Redeployed after adding variables

### ❌ Movies Not Loading
**Check**:
- [ ] TMDB API key is correct
- [ ] API key added to Vercel environment variables
- [ ] Check browser console for API errors
- [ ] Verify API key works on TMDB website

### ❌ Images Not Loading
**Check**:
- [ ] `next.config.js` has `image.tmdb.org` in domains
- [ ] No console errors about image loading
- [ ] TMDB API key has image access

---

## Continuous Deployment

### ✅ Auto-Deploy Setup
Once deployed, Vercel automatically:
- [ ] Watches your GitHub repository
- [ ] Builds on every push to `main` branch
- [ ] Deploys successful builds
- [ ] Provides preview URLs for pull requests

### To Update Your Site:
```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push origin main
# Vercel automatically deploys! 🚀
```

---

## Success Criteria

Your deployment is successful when:
- ✅ Site is live on Vercel URL
- ✅ All filters work correctly
- ✅ Movies load and display
- ✅ Trailers play in preview modal
- ✅ Awards display for qualifying movies
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Fast load times
- ✅ Professional IMDb-style appearance

---

## Final Steps

- [ ] Share your site URL with friends! 🎉
- [ ] Add site URL to GitHub repository description
- [ ] Consider adding to your portfolio
- [ ] Monitor Vercel analytics (optional)
- [ ] Set up custom domain (optional)

---

## 🎊 Congratulations!

Your movie recommendation site is now live and accessible to the world!

**Your Site**: `https://your-site.vercel.app`

Share it, enjoy it, and happy movie discovering! 🎬🍿

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TMDB API Docs**: https://developers.themoviedb.org/3
- **GitHub Docs**: https://docs.github.com

---

**Last Updated**: January 2, 2026  
**Status**: Ready for Deployment ✅

