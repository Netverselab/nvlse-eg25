import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import rateLimiter from '@/utils/rateLimiter';

interface CrawlResult {
  url: string;
  title: string;
  description: string;
  links: string[];
  lastCrawled: Date;
}

class Crawler {
  private visited: Set<string> = new Set();
  private queue: string[] = [];
  private results: Map<string, CrawlResult> = new Map();
  private readonly maxDepth: number;
  private readonly maxPages: number;
  private readonly delay: number; // Delay between requests in ms

  constructor(maxDepth: number = 2, maxPages: number = 100, delay: number = 1000) {
    this.maxDepth = maxDepth;
    this.maxPages = maxPages;
    this.delay = delay;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.href.replace(/\/$/, '');
    } catch {
      return url;
    }
  }

  private async crawlPage(url: string): Promise<CrawlResult | null> {
    try {
      const fetchWithRateLimit = () => axios.get(url, {
        headers: {
          'User-Agent': 'NetverseLab-Crawler/1.0',
          'Accept': 'text/html'
        }
      });

      const response = await rateLimiter.executeWithRateLimit(
        'crawler',
        fetchWithRateLimit
      );

      const $ = cheerio.load(response.data);
      const title = $('title').text().trim() || url;
      const description = $('meta[name="description"]').attr('content') ||
        $('p').first().text().trim().substring(0, 200);

      const links = new Set<string>();
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && this.isValidUrl(href)) {
          links.add(this.normalizeUrl(href));
        }
      });

      return {
        url,
        title,
        description,
        links: Array.from(links),
        lastCrawled: new Date()
      };
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      return null;
    }
  }

  public async crawl(startUrl: string): Promise<Map<string, CrawlResult>> {
    this.queue.push(this.normalizeUrl(startUrl));

    while (this.queue.length > 0 && this.visited.size < this.maxPages) {
      const url = this.queue.shift()!;
      
      if (this.visited.has(url)) continue;
      this.visited.add(url);

      const result = await this.crawlPage(url);
      if (result) {
        this.results.set(url, result);

        // Add new URLs to queue if we haven't reached max depth
        if (this.visited.size < this.maxDepth) {
          for (const link of result.links) {
            if (!this.visited.has(link)) {
              this.queue.push(link);
            }
          }
        }
      }

      await this.sleep(this.delay);
    }

    return this.results;
  }

  public getResults(): Map<string, CrawlResult> {
    return this.results;
  }
}

export default Crawler;
export type { CrawlResult };