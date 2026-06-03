import { describe, it, expect, beforeEach } from 'vitest';
import { extractMetadata } from './og-extractor';

function setMeta(property: string, value: string, attr = 'property') {
  const el = document.createElement('meta');
  el.setAttribute(attr, property);
  el.setAttribute('content', value);
  document.head.appendChild(el);
}

function setLink(rel: string, href: string) {
  const el = document.createElement('link');
  el.rel = rel;
  el.href = href;
  document.head.appendChild(el);
}

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = '';
});

describe('extractMetadata', () => {
  it('returns document.title', () => {
    document.title = 'Hello World';
    const result = extractMetadata();
    expect(result.title).toBe('Hello World');
  });

  it('reads og:description', () => {
    setMeta('og:description', 'OG description here');
    const result = extractMetadata();
    expect(result.description).toBe('OG description here');
  });

  it('falls back to meta[name=description] when og:description missing', () => {
    setMeta('description', 'Meta description', 'name');
    const result = extractMetadata();
    expect(result.description).toBe('Meta description');
  });

  it('reads og:image', () => {
    setMeta('og:image', 'https://example.com/image.jpg');
    const result = extractMetadata();
    expect(result.previewImage).toBe('https://example.com/image.jpg');
  });

  it('reads favicon from link[rel=icon]', () => {
    setLink('icon', 'https://example.com/favicon.ico');
    const result = extractMetadata();
    expect(result.favicon).toBe('https://example.com/favicon.ico');
  });

  it('falls back to link[rel="shortcut icon"] when icon missing', () => {
    setLink('shortcut icon', 'https://example.com/shortcut.ico');
    const result = extractMetadata();
    expect(result.favicon).toBe('https://example.com/shortcut.ico');
  });

  it('returns empty strings when no meta tags present', () => {
    document.title = 'Only Title';
    const result = extractMetadata();
    expect(result.description).toBe('');
    expect(result.previewImage).toBe('');
    expect(result.favicon).toBe('');
  });
});
