import { apiClient } from '../lib/api';
import type { Tag } from './bookmarks';

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { data } = await apiClient.get<Tag[]>('/tags');
    return data;
  },

  async create(name: string, color: string): Promise<Tag> {
    const { data } = await apiClient.post<Tag>('/tags', { name, color });
    return data;
  },

  async update(id: string, name: string, color: string): Promise<Tag> {
    const { data } = await apiClient.patch<Tag>(`/tags/${id}`, { name, color });
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
