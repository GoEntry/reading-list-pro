// IMPORTANT: injected into the page via chrome.scripting.executeScript.
// Must be self-contained — no imports, no module-scope references inside the body.
export function extractMetadata(): {
  title: string;
  description: string;
  previewImage: string;
  favicon: string;
} {
  const getMeta = (attr: string, value: string): string =>
    document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`)
      ?.getAttribute('content') ?? '';

  const favicon =
    document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ??
    document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')?.href ??
    '';

  return {
    title: document.title,
    description: getMeta('property', 'og:description') || getMeta('name', 'description'),
    previewImage: getMeta('property', 'og:image'),
    favicon,
  };
}
