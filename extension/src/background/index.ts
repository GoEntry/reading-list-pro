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

  const meta: { title: string; description: string; previewImage: string; favicon: string } = {
    title: tab.title ?? '',
    description: '',
    previewImage: '',
    favicon: tab.favIconUrl ?? '',
  };

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: extractMetadata,
    });
    if (results?.[0]?.result) {
      Object.assign(meta, results[0].result);
    }
  } catch {
    // chrome:// страницы блокируют scripting — используем данные вкладки как fallback
  }

  const storage = await chrome.storage.local.get('reading_list_auth');
  const token = (storage['reading_list_auth'] as { accessToken?: string } | undefined)?.accessToken;
  if (!token) return;

  const url = info.linkUrl ?? info.pageUrl ?? tab.url ?? '';
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
    // сетевая ошибка — пользователь повторит вручную
    return;
  }

  chrome.action.setBadgeText({ text: '✓' });
  chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
});
