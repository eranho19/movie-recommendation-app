# Product Requirements Document (PRD)
## "Let Me Set You Up" - Movie Recommendation Site

---

## 1. Project Overview

**Product Name:** Let Me Set You Up  
**Version:** 1.0  
**Date:** January 2, 2026  
**Status:** In Development

### Purpose
Create an elegant movie recommendation website that helps users discover movies based on multiple filtering criteria, with a design aesthetic matching IMDb's professional look and feel.

---

## 2. Objectives

- Provide an intuitive movie discovery experience
- Match IMDb's visual design language and color scheme
- Enable multi-criteria filtering for personalized recommendations
- Display aggregated ratings from IMDB and Rotten Tomatoes
- Support multiple viewing modes (list and grid)
- Prepare for seamless deployment on Vercel

---

## 3. Features & Requirements

### 3.1 User Interface

#### Header
- [ ] Site title: "Let Me Set You Up"
- [ ] IMDb-inspired color scheme (black/gold/yellow accents)
- [ ] Navigation bar with responsive design

#### Filter Section
- [ ] **Genre Filter**
  - Multi-select dropdown
  - Icon: 🎬 Film reel
  - Options: Action, Comedy, Drama, Horror, Sci-Fi, Romance, Thriller, Documentary, Animation, etc.

- [ ] **Tags Filter**
  - Multi-select for common tags
  - Icon: 🏷️ Tag
  - Options: Award-winning, Cult Classic, Based on Book, Feel-good, Mind-bending, etc.

- [ ] **Score Range Filter**
  - Slider or range selector
  - Icon: ⭐ Star
  - Range: 0-10 (combined IMDB + Rotten Tomatoes average)

- [ ] **Language Filter**
  - Toggle or select
  - Icon: 🌐 Globe
  - Options: English, International (non-English)

#### Results Display
- [ ] **View Toggle**
  - List view icon (☰)
  - Grid view icon (⊞)
  
- [ ] **List View**
  - Numbered ranking
  - Movie poster (left-aligned)
  - Title, year, rating
  - Short synopsis
  - Combined score badge
  - Preview link

- [ ] **Grid View**
  - Responsive grid (3-4 columns on desktop)
  - Movie poster
  - Title overlay
  - Rating badge
  - Hover effects

### 3.2 Functionality

#### Movie Data
- [ ] Fetch from TMDB API (or OMDb API)
- [ ] Aggregate IMDB and Rotten Tomatoes scores
- [ ] Cache results for performance

#### Filtering & Sorting
- [ ] Apply multiple filters simultaneously
- [ ] Sort by combined score (highest to lowest)
- [ ] Real-time filter updates
- [ ] Clear filters option

#### Movie Preview
- [ ] Clickable link for each movie
- [ ] Open trailer/preview (YouTube embed or external link)
- [ ] Modal or new page view

---

## 4. Technical Specifications

### 4.1 Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React or React Icons
- **API:** TMDB API (The Movie Database)
- **State Management:** React Hooks (useState, useEffect)
- **Deployment:** Vercel

### 4.2 Design System

#### Colors (IMDb-inspired)
- **Background:** #121212 (dark)
- **Surface:** #1F1F1F
- **Primary:** #F5C518 (IMDb yellow/gold)
- **Text Primary:** #FFFFFF
- **Text Secondary:** #AAAAAA
- **Accent:** #F5C518
- **Border:** #404040

#### Typography
- **Font Family:** 'Roboto', 'Arial', sans-serif
- **Headings:** Bold, 1.5-2.5rem
- **Body:** Regular, 1rem
- **Small:** 0.875rem

---

## 5. API Integration

### TMDB API Endpoints
- `/discover/movie` - Discover movies with filters
- `/movie/{id}` - Get movie details
- `/movie/{id}/videos` - Get trailers
- `/genre/movie/list` - Get genre list

### Required API Key
- Sign up at https://www.themoviedb.org/settings/api
- Store in `.env.local` file

---

## 6. Development Phases

### Phase 1: Setup & Structure ✓
- [x] Create PRD
- [ ] Initialize Next.js project
- [ ] Set up Tailwind CSS
- [ ] Configure TypeScript
- [ ] Set up environment variables

### Phase 2: Design & UI Components
- [ ] Implement color scheme
- [ ] Create Header component
- [ ] Create Filter components
- [ ] Create Movie Card component
- [ ] Create ViewToggle component

### Phase 3: Functionality
- [ ] Set up API integration
- [ ] Implement filtering logic
- [ ] Implement sorting by combined scores
- [ ] Add list/grid view toggle
- [ ] Add movie preview functionality

### Phase 4: Polish & Testing
- [ ] Responsive design testing
- [ ] Cross-browser compatibility
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states

### Phase 5: Deployment
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect to Vercel
- [ ] Configure environment variables
- [ ] Deploy and test

---

## 7. Success Metrics

- [ ] All filters working correctly
- [ ] Results display accurately
- [ ] Page loads in < 3 seconds
- [ ] Mobile responsive
- [ ] Successfully deployed on Vercel

---

## 8. Future Enhancements (V2)

- User accounts and saved favorites
- Personalized recommendations
- Social sharing features
- User reviews and ratings
- Watchlist functionality
- Streaming availability info

---

## 9. Deployment Instructions

### GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit: Let Me Set You Up movie recommendation site"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Vercel Deployment
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Add environment variables (TMDB_API_KEY)
5. Click "Deploy"

---

## 10. Notes

- Ensure TMDB API key is kept secure
- Follow IMDb's visual style but create original design
- Optimize images for web performance
- Consider adding pagination for large result sets
- Implement error boundaries for robust error handling

---

**Status Legend:**
- ✓ Completed
- 🔄 In Progress
- ⏳ Pending
- ❌ Blocked

Last Updated: January 2, 2026








