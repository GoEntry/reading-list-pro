import { Injectable, BadRequestException } from '@nestjs/common';
import * as cheerio from 'cheerio';

export interface OgData {
  title: string;
  description: string;
  previewImage: string;
  favicon: string;
}

@Injectable()
export class OgScraperService {
  async scrape(url: string): Promise<OgData> {
    let html: string;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 ReadingListPro/1.0 (+https://github.com/reading-list-pro)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      html = await res.text();
    } catch (e) {
      throw new BadRequestException(`Cannot fetch URL: ${(e as Error).message}`);
    }

    const $ = cheerio.load(html);
    const getMeta = (attr: string, value: string) =>
      $(`meta[${attr}="${value}"]`).attr('content') ?? '';

    let faviconHref =
      $('link[rel="icon"]').attr('href') ??
      $('link[rel="shortcut icon"]').attr('href') ??
      '/favicon.ico';

    try {
      const base = new URL(url);
      if (!faviconHref.startsWith('http')) {
        faviconHref = faviconHref.startsWith('/')
          ? `${base.origin}${faviconHref}`
          : `${base.origin}/${faviconHref}`;
      }
    } catch {
      // malformed URL — leave faviconHref as-is
    }

    return {
      title: getMeta('property', 'og:title') || $('title').text().trim(),
      description: getMeta('property', 'og:description') || getMeta('name', 'description'),
      previewImage: getMeta('property', 'og:image'),
      favicon: faviconHref,
    };
  }
}
