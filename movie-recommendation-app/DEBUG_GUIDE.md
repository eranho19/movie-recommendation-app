# Debug Guide - Finding Issues with Filters

## 🔍 How to Debug "No Results" Issues

### Step 1: Open Browser Console
1. Open your app: http://localhost:3000
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Clear the console (trash icon)

### Step 2: Apply Your Filters
Apply your filters and watch the console output. You'll see messages like:

```
Fetching with params: { ... }
Fetched X movies from TMDB
After language filter: X movies
After watched filter: X movies
Generating combinations for 3.5 hours from X movies
Checking provider netflix (TMDB ID: 8)
Found X movies available on netflix
Generated X combinations for netflix
Total combinations generated: X
```

### Step 3: Analyze the Output

#### If you see:
```
Fetched 0 movies from TMDB
```
**Problem**: TMDB API returned no movies with your filter combination
**Solution**: Your filters are too restrictive at the API level
- Try removing year filter
- Try different streaming provider
- Lower minimum score

#### If you see:
```
Fetched 50 movies from TMDB
After language filter: 0 movies
```
**Problem**: Language filter eliminated all movies
**Solution**: Check language selection or remove it

#### If you see:
```
Fetched 50 movies from TMDB
After watched filter: 0 movies
```
**Problem**: All movies are marked as watched
**Solution**: Clear watched movies or disable watched filter

#### If you see:
```
Generating combinations for 3.5 hours from 25 movies
Found 0 movies available on netflix
```
**Problem**: Movies don't have streaming data populated
**Solution**: This is now handled automatically - the fix should use all 25 movies

#### If you see:
```
Generated 0 combinations for netflix
```
**Problem**: Can't create combinations with the available movies for that duration
**Solution**: 
- Try different time duration
- Need more variety in movie runtimes

---

## 🧪 Testing Your Specific Case

### Your Filters:
- **Genre**: Horror (ID: 27)
- **Language**: English
- **Year**: 1970-2026
- **Provider**: Netflix (TMDB ID: 8)
- **Total Time**: 3.5 hours

### Expected Console Output (Good):
```
Fetching with params: {
  sort_by: "vote_average.desc",
  vote_average.gte: 0,
  watch_region: "US",
  with_genres: "27",
  with_original_language: "en",
  with_watch_providers: "8",
  primary_release_date.gte: "1970-01-01",
  primary_release_date.lte: "2026-12-31"
}
Fetched 20+ movies from TMDB
After language filter: 20+ movies
After watched filter: 20+ movies
Generating combinations for 3.5 hours from 20+ movies
Checking provider netflix (TMDB ID: 8)
Found 20+ movies available on netflix (or falls back to all movies)
Generated 3+ combinations for netflix
Total combinations generated: 3+
```

### What Might Go Wrong:

**Issue 1: No movies from TMDB**
```
Fetched 0 movies from TMDB
```
**Reason**: Netflix + Horror + 1970-2026 is too restrictive
**Fix**: Try without year filter first, then add it back

**Issue 2: Movies found but no combinations**
```
Fetched 20 movies from TMDB
...
Generated 0 combinations for netflix
```
**Reason**: Can't make 3.5-hour combinations from available movie runtimes
**Fix**: Try different time (e.g., 2.5 or 4.5 hours)

---

## 🎯 Recommended Testing Sequence

### Test 1: Remove Year Filter
```
✓ Horror
✓ English
✗ Year (remove)
✓ Netflix
✓ 3.5 hours
```
**Expected**: Should find some results
**If this works**: Year + Streaming combo was the issue

### Test 2: Remove Streaming Provider
```
✓ Horror
✓ English
✓ 1970-2026
✗ Netflix (remove)
✓ 3.5 hours
```
**Expected**: Should find many results
**If this works**: Streaming data is the issue

### Test 3: Recent Years Only
```
✓ Horror
✓ English
✓ 2015-2024 (change)
✓ Netflix
✓ 3.5 hours
```
**Expected**: Should find results
**If this works**: Older movies lack streaming data

### Test 4: Try Different Time
```
✓ Horror
✓ English
✓ 1970-2026
✓ Netflix
✓ 2.5 hours (change)
```
**Expected**: Different duration might work better
**If this works**: Runtime combinations were the issue

### Test 5: Lower Score
```
✓ Horror
✓ English
✓ 1970-2026
✓ Netflix
✓ 3.5 hours
✓ Min Score: 0 (ensure it's low)
```
**Expected**: More movies available
**If this works**: Score was filtering out too much

---

## 📊 Understanding the Numbers

### Good Signs:
- ✅ **Fetched 20+ movies**: TMDB has movies matching your criteria
- ✅ **After filters: 15+ movies**: Enough movies survived filtering
- ✅ **Generated 3+ combinations**: Successfully created combos

### Warning Signs:
- ⚠️ **Fetched 0-5 movies**: Very few movies match - filters too restrictive
- ⚠️ **Found 0 movies available on [provider]**: Streaming data issue (now auto-fixed)
- ⚠️ **Generated 0 combinations**: Can't make combinations with available runtimes

---

## 🔧 What The Fix Does

### Before Fix:
```javascript
// Only used movies with availableOn data
const providerMovies = movies.filter(m => 
  m.availableOn && m.availableOn.includes(String(tmdbProviderId))
);
// If 0 movies, generated 0 combinations
```

### After Fix:
```javascript
// Uses movies with availableOn data
const providerMovies = movies.filter(m => 
  m.availableOn && m.availableOn.includes(String(tmdbProviderId))
);

// If no movies match, falls back to all movies
// (since we already filtered by provider in the API call)
const moviesToUse = providerMovies.length > 0 ? providerMovies : movies;
```

**What this means**: If the streaming data isn't populated, we trust that TMDB's API already filtered by the provider, so we use all returned movies.

---

## 🎬 Step-by-Step Debug for Your Case

1. **Clear Console** (trash icon in browser console)

2. **Apply filters**:
   - Horror
   - English
   - 1970-2026
   - Netflix
   - 3.5 hours

3. **Read Console Output**:
   - Note the number after "Fetched X movies from TMDB"
   - Note the number after "Found X movies available on netflix"
   - Note the number after "Generated X combinations"

4. **Share the numbers**:
   If still no results, share these 3 numbers and we can diagnose further

---

## 💡 Quick Wins

### If you just want results now:
1. **Remove year filter** - Try 1970-2026 → (empty)
2. **Or use recent years** - Try 1970-2026 → 2015-2024
3. **Or remove Netflix** - Try combinations without streaming filter
4. **Or try different time** - Try 3.5h → 2.5h or 4h

### If you want to understand the issue:
- Follow the debug guide above
- Check console output
- Test each filter combination

---

## 📞 Still Having Issues?

If you've tried the above and still see no results:

1. **Share your console output** (copy the debug logs)
2. **Try the recommended test sequence** above
3. **Check if any movies show** without the "Total Viewing Time" filter

The debug logs will show exactly where movies are being filtered out!

---

**Remember**: Press F12 → Console tab → Apply filters → Read the debug output! 🔍
