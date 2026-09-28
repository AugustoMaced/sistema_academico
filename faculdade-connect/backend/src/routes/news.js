import { Router } from 'express';
import Parser from 'rss-parser';

const router = Router();
const parser = new Parser();

async function readFeed(url, fallbackCategory) {
  if (!url) return [];
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 10).map(item => ({
      title: item.title,
      description: item.contentSnippet || item.content || '',
      link: item.link,
      publishedAt: item.isoDate || item.pubDate || null,
      category: fallbackCategory
    }));
  } catch {
    return [];
  }
}

router.get('/ti', async (_, res) => {
  const news = await readFeed(process.env.TECH_NEWS_URL, 'TI');
  res.json(news);
});

router.get('/regiao', async (_, res) => {
  const news = await readFeed(process.env.REGIONAL_NEWS_URL, 'REGIÃO');
  res.json(news);
});

export default router;
