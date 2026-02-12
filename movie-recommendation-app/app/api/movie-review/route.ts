import { fetchFromTMDB, getMovieAwards, getMovieDetails } from '../../lib/tmdb';

type ReviewRequestBody = {
  movieId?: number;
  spoilers?: boolean;
  purpose?: 'review' | 'explained';
};

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function findWikipediaPageTitle(query: string): Promise<string | null> {
  // OpenSearch is a lightweight way to find a likely page title.
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'opensearch');
  url.searchParams.set('search', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('namespace', '0');
  url.searchParams.set('format', 'json');
  url.searchParams.set('redirects', 'resolve');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'let-me-set-you-up (movie review feature)' },
      // Avoid caching stale reviews in serverless environments.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const titles: string[] = Array.isArray(data?.[1]) ? data[1] : [];
    return titles[0] ?? null;
  } catch (e) {
    console.warn('[movie-review] Wikipedia OpenSearch failed; continuing without Wikipedia.', e);
    return null;
  }
}

async function getWikipediaSummary(title: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const extract: string | undefined = data?.extract;
    return typeof extract === 'string' && extract.trim().length > 0 ? extract.trim() : null;
  } catch (e) {
    console.warn('[movie-review] Wikipedia summary fetch failed; continuing without Wikipedia.', e);
    return null;
  }
}

async function getWikipediaSectionText(title: string, sectionName: string): Promise<string | null> {
  try {
    // 1) Get sections list
    const sectionsUrl = new URL('https://en.wikipedia.org/w/api.php');
    sectionsUrl.searchParams.set('action', 'parse');
    sectionsUrl.searchParams.set('page', title);
    sectionsUrl.searchParams.set('prop', 'sections');
    sectionsUrl.searchParams.set('format', 'json');
    sectionsUrl.searchParams.set('redirects', '1');

    const sectionsRes = await fetch(sectionsUrl.toString(), { cache: 'no-store' });
    if (!sectionsRes.ok) return null;
    const sectionsJson = (await sectionsRes.json()) as any;
    const sections: any[] = Array.isArray(sectionsJson?.parse?.sections) ? sectionsJson.parse.sections : [];
    const target = sections.find(
      (s) => typeof s?.line === 'string' && s.line.toLowerCase() === sectionName.toLowerCase()
    );
    const sectionIndex = target?.index;
    if (!sectionIndex) return null;

    // 2) Fetch that section HTML
    const textUrl = new URL('https://en.wikipedia.org/w/api.php');
    textUrl.searchParams.set('action', 'parse');
    textUrl.searchParams.set('page', title);
    textUrl.searchParams.set('prop', 'text');
    textUrl.searchParams.set('section', String(sectionIndex));
    textUrl.searchParams.set('format', 'json');
    textUrl.searchParams.set('redirects', '1');

    const textRes = await fetch(textUrl.toString(), { cache: 'no-store' });
    if (!textRes.ok) return null;
    const textJson = (await textRes.json()) as any;
    const html: string | undefined = textJson?.parse?.text?.['*'];
    if (typeof html !== 'string' || html.trim().length === 0) return null;

    const cleaned = stripHtml(html);
    if (cleaned.length < 40) return null;
    return cleaned;
  } catch (e) {
    console.warn('[movie-review] Wikipedia section fetch failed; continuing without Wikipedia.', e);
    return null;
  }
}

async function getWikipediaFirstSectionText(title: string, sectionNames: string[]): Promise<{ name: string; text: string } | null> {
  for (const name of sectionNames) {
    const text = await getWikipediaSectionText(title, name);
    if (text) return { name, text };
  }
  return null;
}

function formatReview(params: {
  title: string;
  year?: number;
  spoilers: boolean;
  purpose: 'review' | 'explained';
  director?: string | null;
  cast?: string[];
  genres?: string[];
  runtimeMinutes?: number | null;
  tagline?: string | null;
  tmdbOverview?: string | null;
  wikiSummary?: string | null;
  wikiPlot?: string | null;
  wikiPlotSectionName?: string | null;
  keywords?: string[];
  awards?: string[];
  reviewSnippets?: string[];
  sources?: string[];
}) {
  const {
    title,
    year,
    spoilers,
    purpose,
    director,
    cast,
    genres,
    runtimeMinutes,
    tagline,
    tmdbOverview,
    wikiSummary,
    wikiPlot,
    wikiPlotSectionName,
    keywords,
    awards,
    reviewSnippets,
    sources,
  } = params;

  const header = `${title}${year ? ` (${year})` : ''}`;
  const lines: string[] = [];
  lines.push(header);
  lines.push('');

  if (tagline) {
    lines.push(`Tagline: ${tagline}`);
    lines.push('');
  }

  if (genres?.length) lines.push(`Genres: ${genres.join(', ')}`);
  if (typeof runtimeMinutes === 'number' && runtimeMinutes > 0) lines.push(`Runtime: ${runtimeMinutes} min`);
  if (director) lines.push(`Director: ${director}`);
  if (cast?.length) lines.push(`Leading actors: ${cast.join(', ')}`);
  if (genres?.length || director || cast?.length || runtimeMinutes) lines.push('');

  const premiseSource = spoilers ? (wikiSummary || tmdbOverview) : (tmdbOverview || wikiSummary);
  if (premiseSource) {
    lines.push(spoilers ? 'Premise (spoilers allowed):' : 'Premise (spoiler-free):');
    lines.push(`- ${premiseSource}`);
    lines.push('');
  }

  if (!spoilers) {
    lines.push('What to expect (Gemini-style quick guide):');
    if (genres?.length) lines.push(`- Vibe/genre blend: ${genres.slice(0, 3).join(', ')}${genres.length > 3 ? ', …' : ''}`);
    lines.push('- Best for: viewers who want a clear sense of tone, themes, and standout performances (without plot reveals).');
    lines.push('- Heads-up: avoid reading detailed plot sections if you want to go in blind.');
    lines.push('');
  } else {
    lines.push(purpose === 'explained' ? 'Movie explained:' : 'Spoiler review:');
    lines.push('- WARNING: the next section may reveal major plot points and the ending.');
    lines.push('');

    if (purpose === 'explained') {
      lines.push('Core ideas / themes (signal-based, not authoritative):');
      if (tagline) lines.push(`- Tagline hint: ${tagline}`);
      if (keywords?.length) lines.push(`- Keywords: ${keywords.slice(0, 12).join(', ')}${keywords.length > 12 ? ', …' : ''}`);
      if (genres?.length) lines.push(`- Genre lens: ${genres.slice(0, 4).join(', ')}${genres.length > 4 ? ', …' : ''}`);
      lines.push('- Interpretation: look for repeated conflicts, what the story rewards/punishes, and what changes by the end.');
      lines.push('');
    }

    if (wikiPlot) {
      lines.push(`Plot (${wikiPlotSectionName ? `Wikipedia: ${wikiPlotSectionName}` : 'from Wikipedia'}, cleaned):`);
      lines.push(wikiPlot);
      lines.push('');
    } else {
      lines.push('Plot: (Could not extract a dedicated plot section from Wikipedia for this title.)');
      lines.push('');
    }
  }

  if (awards?.length) {
    lines.push('Main awards / recognition:');
    awards.slice(0, 6).forEach((a) => lines.push(`- ${a}`));
    lines.push('');
  }

  if (reviewSnippets?.length) {
    lines.push('What people said (TMDB review snippets):');
    reviewSnippets.slice(0, 3).forEach((s) => lines.push(`- ${s}`));
    lines.push('');
  }

  if (sources?.length) {
    lines.push('Sources used:');
    sources.forEach((s) => lines.push(`- ${s}`));
  }

  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as ReviewRequestBody;
    const movieId = body.movieId;
    const spoilers = Boolean(body.spoilers);
    const purpose: 'review' | 'explained' = body.purpose === 'explained' ? 'explained' : 'review';

    if (typeof movieId !== 'number' || !Number.isFinite(movieId)) {
      return Response.json({ error: 'movieId must be a number' }, { status: 400 });
    }

    const details = await getMovieDetails(movieId);
    const title: string = details?.title || details?.original_title || 'Unknown title';
    const releaseDate: string | undefined = details?.release_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;

    const directorInfo = details?.credits?.crew?.find((m: any) => m?.job === 'Director');
    const director: string | null = directorInfo?.name ?? null;
    const topCast: string[] = Array.isArray(details?.credits?.cast)
      ? details.credits.cast.slice(0, 6).map((c: any) => c?.name).filter(Boolean)
      : [];

    const genres: string[] = Array.isArray(details?.genres) ? details.genres.map((g: any) => g?.name).filter(Boolean) : [];
    const runtimeMinutes: number | null = typeof details?.runtime === 'number' ? details.runtime : null;
    const tagline: string | null = typeof details?.tagline === 'string' && details.tagline.trim() ? details.tagline.trim() : null;
    const tmdbOverview: string | null = typeof details?.overview === 'string' && details.overview.trim() ? details.overview.trim() : null;

    const awards = await getMovieAwards(movieId);
    const awardNames = (awards ?? []).map((a) => a?.name).filter(Boolean) as string[];

    // TMDB review snippets
    let reviewSnippets: string[] = [];
    try {
      const reviews = await fetchFromTMDB(`/movie/${movieId}/reviews`, { page: 1 });
      reviewSnippets = Array.isArray(reviews?.results)
        ? reviews.results
            .slice(0, purpose === 'explained' ? 5 : 3)
            .map((r: any) => (typeof r?.content === 'string' ? stripHtml(r.content) : ''))
            .filter((s: string) => s.length > 40)
        : [];
    } catch {
      // Non-critical
    }

    // TMDB keywords (good signal for "explained" mode)
    let keywords: string[] = [];
    try {
      const kw = await fetchFromTMDB(`/movie/${movieId}/keywords`);
      const list = kw?.keywords ?? kw?.results ?? [];
      keywords = Array.isArray(list) ? list.map((k: any) => k?.name).filter(Boolean) : [];
    } catch {
      // Non-critical
    }

    // Wikipedia gather
    const wikiQuery = `${title} ${year ? `${year} film` : 'film'}`;
    const wikiTitle = await findWikipediaPageTitle(wikiQuery);
    const wikiSummary = wikiTitle ? await getWikipediaSummary(wikiTitle) : null;
    const wikiPlotSection =
      spoilers && wikiTitle
        ? await getWikipediaFirstSectionText(wikiTitle, ['Plot', 'Plot summary', 'Synopsis', 'Summary'])
        : null;
    const wikiPlot = wikiPlotSection?.text ?? null;
    const wikiPlotSectionName = wikiPlotSection?.name ?? null;

    const sources: string[] = [];
    sources.push('TMDB (The Movie Database)');
    if (wikiTitle) sources.push(`Wikipedia: ${wikiTitle}`);

    const review = formatReview({
      title,
      year,
      spoilers,
      purpose,
      director,
      cast: topCast,
      genres,
      runtimeMinutes,
      tagline,
      tmdbOverview,
      wikiSummary,
      wikiPlot,
      wikiPlotSectionName,
      keywords,
      awards: awardNames,
      reviewSnippets,
      sources,
    });

    return Response.json({ review }, { status: 200 });
  } catch (e: any) {
    console.error('movie-review route error:', e);
    return Response.json({ error: 'Failed to generate review' }, { status: 500 });
  }
}

