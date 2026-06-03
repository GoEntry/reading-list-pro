import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../lib/api';
import { bookmarksApi, type Bookmark } from './bookmarks';

let mock: MockAdapter;

beforeEach(() => { mock = new MockAdapter(apiClient); });
afterEach(() => { mock.restore(); });

const tag = { id: 'tag-1', userId: 'u1', name: 'react', color: '#6366f1', createdAt: '2026-01-01T00:00:00Z' };

const bookmark: Bookmark = {
  id: 'bm-1', userId: 'u1', url: 'https://example.com', title: 'Example',
  description: null, favicon: null, previewImage: null, notes: null,
  isRead: false, readAt: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  tags: [tag],
};

describe('bookmarksApi.list', () => {
  it('GET /bookmarks returns paginated response', async () => {
    const response = { items: [bookmark], total: 1, page: 1, limit: 20 };
    mock.onGet('/bookmarks').reply(200, response);
    const result = await bookmarksApi.list();
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('passes search query param', async () => {
    mock.onGet('/bookmarks').reply(200, { items: [], total: 0, page: 1, limit: 20 });
    await bookmarksApi.list({ search: 'react' });
    const req = mock.history['get']?.[0];
    expect(req?.params).toMatchObject({ search: 'react' });
  });

  it('passes tagIds as comma-separated string', async () => {
    mock.onGet('/bookmarks').reply(200, { items: [], total: 0, page: 1, limit: 20 });
    await bookmarksApi.list({ tagIds: ['id-1', 'id-2'] });
    const req = mock.history['get']?.[0];
    expect(req?.params).toMatchObject({ tagIds: 'id-1,id-2' });
  });

  it('passes isRead=false for unread filter', async () => {
    mock.onGet('/bookmarks').reply(200, { items: [], total: 0, page: 1, limit: 20 });
    await bookmarksApi.list({ isRead: false });
    const req = mock.history['get']?.[0];
    expect(req?.params).toMatchObject({ isRead: false });
  });
});

describe('bookmarksApi.create', () => {
  it('POST /bookmarks returns created bookmark', async () => {
    mock.onPost('/bookmarks').reply(201, bookmark);
    const result = await bookmarksApi.create({ url: 'https://example.com', title: 'Example' });
    expect(result.id).toBe('bm-1');
  });
});

describe('bookmarksApi.remove', () => {
  it('DELETE /bookmarks/:id', async () => {
    mock.onDelete('/bookmarks/bm-1').reply(200);
    await expect(bookmarksApi.remove('bm-1')).resolves.toBeUndefined();
  });
});

describe('bookmarksApi.update', () => {
  it('PATCH /bookmarks/:id with isRead', async () => {
    const updated = { ...bookmark, isRead: true, readAt: '2026-01-02T00:00:00Z' };
    mock.onPatch('/bookmarks/bm-1').reply(200, updated);
    const result = await bookmarksApi.update('bm-1', { isRead: true });
    expect(result.isRead).toBe(true);
  });
});
