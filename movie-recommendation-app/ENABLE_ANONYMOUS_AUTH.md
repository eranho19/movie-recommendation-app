# Enable Anonymous Authentication in Supabase

To save movies to Supabase when you click "Don't Suggest", you need to enable anonymous authentication in your Supabase project.

## Quick Steps

1. **Go to your Supabase Dashboard**
   - Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Enable Anonymous Authentication**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Providers"** 
   - Scroll down to find **"Anonymous"** provider
   - Toggle it **ON** (enable it)
   - Click **"Save"**

3. **Verify Your Setup**
   - Make sure you have:
     - ✅ Supabase URL and Anon Key in `.env.local`
     - ✅ `watched_movies` table created (run `supabase-schema.sql`)
     - ✅ Anonymous auth enabled (step above)

4. **Test It**
   - Restart your dev server: `npm run dev`
   - Open your app
   - Click "Seen / Don't Suggest" on any movie
   - Check your Supabase dashboard → Table Editor → `watched_movies`
   - You should see the movie saved!

## How It Works

- When you first visit the app, it automatically creates an anonymous user session
- This anonymous user has a unique ID that persists in your browser
- When you mark a movie as "Don't Suggest", it saves to Supabase with your anonymous user ID
- The app will never suggest that movie again

## Troubleshooting

### "No user ID found, falling back to localStorage"
- **Solution**: Make sure anonymous authentication is enabled (see steps above)
- Check browser console for any errors

### Movies not appearing in Supabase
- Check browser console for errors
- Verify your `.env.local` has correct Supabase credentials
- Make sure the `watched_movies` table exists
- Check that Row Level Security (RLS) policies are set up correctly

### Still using localStorage?
- The app automatically falls back to localStorage if Supabase isn't configured
- Check that your `.env.local` file has:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  ```

## Benefits of Supabase

- ✅ **Cloud Storage**: Your preferences saved in the cloud
- ✅ **Cross-Device**: Access from any device (with same anonymous session)
- ✅ **Persistent**: Won't be lost if you clear browser data
- ✅ **Automatic**: Works seamlessly in the background
