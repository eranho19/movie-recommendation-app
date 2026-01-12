# Let Me Set You Up 🎬

An elegant movie recommendation website with IMDb-inspired design.

## Features

- 🎯 Multi-criteria filtering (Genre, Tags, Score, Language)
- ⭐ Combined IMDB & Rotten Tomatoes ratings
- 📱 Responsive design (List & Grid views)
- 🎥 Movie trailers and previews
- 🎨 IMDb-inspired color scheme
- ☁️ Cloud storage with Supabase (optional)

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your TMDB API key:**
   - Sign up at [TMDB](https://www.themoviedb.org/)
   - Get your API key from [API Settings](https://www.themoviedb.org/settings/api)
   - Copy `env.example` to `.env.local`
   - Add your API key to `.env.local`

3. **Optional: Set up Supabase for cloud storage:**
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
   - Without Supabase, the app uses localStorage (works fine for single-device use)

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **API:** The Movie Database (TMDB)
- **Database:** Supabase (optional, falls back to localStorage)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_TMDB_API_KEY` (required)
   - `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
5. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)

## Project Structure

```
movie-recommendation-app/
├── app/
│   ├── api/          # API routes
│   ├── components/   # React components
│   ├── lib/          # Utilities and helpers
│   ├── types/        # TypeScript types
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── public/           # Static assets
└── ...config files
```

## License

MIT








