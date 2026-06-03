import { extractMetadata } from '../lib/og-extractor';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.contextMenus.create({
      id: 'save-to-reading-list',
      title: 'Save to Reading List Pro',
      contexts: ['page', 'link'],
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab) return;

  // 1. Pre-populate meta from tab data (fallback if executeScript fails)
  const meta: { title: string; description: string; previewImage: string; favicon: string } = {
    title: tab.title ?? '',
    description: '',
    previewImage: '',
    favicon: tab.favIconUrl ?? '',
  };

  // 2. Try to extract richer OG metadata from the page
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: extractMetadata,
    });
    if (results?.[0]?.result) {
      Object.assign(meta, results[0].result);
    }
  } catch {
    // chrome:// or chrome-extension:// pages — tab data fallback is already set above
  }

  // 3. Get access token from storage
  const storage = await chrome.storage.local.get('reading_list_auth');
  const token = (storage['reading_list_auth'] as { accessToken?: string } | undefined)?.accessToken;
  if (!token) return; // not logged in — silently skip

  // 4. POST to API
  const url = info.pageUrl ?? tab.url ?? '';
  if (!url) return;

  try {
    await fetch(`${API_BASE_URL}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, ...meta }),
    });
  } catch {
    // Network error — badge shows nothing, user retries manually
    return;
  }

  // 5. Badge confirmation: green checkmark for 2 seconds
  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
});
