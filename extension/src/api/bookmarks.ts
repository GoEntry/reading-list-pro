import { apiClient } from '../lib/api';

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  previewImage: string | null;
  notes: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface BookmarkListResponse {
  items: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateBookmarkPayload {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  previewImage?: string;
  notes?: string;
  tagIds?: string[];
}

export interface UpdateBookmarkPayload {
  notes?: string;
  isRead?: boolean;
  tagIds?: string[];
}

export interface BookmarkListParams {
  search?: string;
  tagIds?: string[];
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export const bookmarksApi = {
  async list(params: BookmarkListParams = {}): Promise<BookmarkListResponse> {
    const axiosParams: Record<string, string | number | boolean> = {};
    if (params.search) axiosParams['search'] = params.search;
    if (params.tagIds?.length) axiosParams['tagIds'] = params.tagIds.join(',');
    if (params.isRead !== undefined) axiosParams['isRead'] = params.isRead;
    if (params.page) axiosParams['page'] = params.page;
    if (params.limit) axiosParams['limit'] = params.limit;
    const { data } = await apiClient.get<BookmarkListResponse>('/bookmarks', { params: axiosParams });
    return data;
  },

  async create(payload: CreateBookmarkPayload): Promise<Bookmark> {
    const { data } = await apiClient.post<Bookmark>('/bookmarks', payload);
    return data;
  },

  async update(id: string, payload: UpdateBookmarkPayload): Promise<Bookmark> {
    const { data } = await apiClient.patch<Bookmark>(`/bookmarks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${id}`);
  },
};
