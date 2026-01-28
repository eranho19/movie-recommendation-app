# Quick Start Guide 🚀

## Get Your Movie Site Running in 5 Minutes!

### Step 1: Get Your TMDB API Key (2 minutes)

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to https://www.themoviedb.org/settings/api
4. Click "Request an API Key"
5. Choose "Developer"
6. Fill in the form (you can use dummy data for personal projects)
7. Copy your API key

### Step 2: Set Up Environment Variables (1 minute)

**Windows (PowerShell):**
```powershell
cd movie-recommendation-app
Copy-Item env.example .env.local
notepad .env.local
```

**Mac/Linux:**
```bash
cd movie-recommendation-app
cp env.example .env.local
nano .env.local
```

Then replace `your_api_key_here` with your actual TMDB API key:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

Save and close the file.

### Step 3: Run the Site (1 minute)

```bash
npm run dev
```

### Step 4: Open in Browser

Go to: *http://localhost:4000***

---

## 🎬 You're Done!

You should now see your movie recommendation site running!

### Features to Try:

✅ **Filter by Genre** - Click on genre tags to filter movies  
✅ **Adjust Score Range** - Use the sliders to set minimum/maximum ratings  
✅ **Select Language** - Choose English, International, or All  
✅ **Toggle Views** - Switch between List and Grid views  
✅ **Watch Previews** - Click "Watch Preview" to see trailers  

---

## Troubleshooting

**Problem**: Movies won't load / API errors  
**Solution**: Make sure your `.env.local` file has the correct API key

**Problem**: "Module not found" errors  
**Solution**: Run `npm install` again

**Problem**: Port 4000 already in use  
**Solution**: Run `npm run dev -- -p 4001` to use port 4001 instead

---

## What's Next?

Ready to deploy? Check out **DEPLOYMENT.md** for step-by-step instructions to deploy to Vercel!

---

**Need help?** Check the README.md for more detailed information.








