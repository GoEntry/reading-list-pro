import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../lib/api';
import { tagsApi } from './tags';
import type { Tag } from './bookmarks';

let mock: MockAdapter;

beforeEach(() => { mock = new MockAdapter(apiClient); });
afterEach(() => { mock.restore(); });

describe('tagsApi.list', () => {
  it('GET /tags returns array of tags', async () => {
    const tags: Tag[] = [
      { id: 'tag-1', userId: 'u1', name: 'react', color: '#6366f1', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'tag-2', userId: 'u1', name: 'backend', color: '#10b981', createdAt: '2026-01-01T00:00:00Z' },
    ];
    mock.onGet('/tags').reply(200, tags);
    const result = await tagsApi.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('react');
  });

  it('returns empty array when user has no tags', async () => {
    mock.onGet('/tags').reply(200, []);
    const result = await tagsApi.list();
    expect(result).toEqual([]);
  });
});
