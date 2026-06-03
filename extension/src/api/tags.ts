import { apiClient } from '../lib/api';
import type { Tag } from './bookmarks';

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { data } = await apiClient.get<Tag[]>('/tags');
    return data;
  },
};
