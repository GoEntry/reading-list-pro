import { apiClient } from '../lib/api';

export interface DayCount {
  date: string;
  count: number;
}

export interface DomainCount {
  domain: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  readCount: number;
  unreadCount: number;
  topDomains: DomainCount[];
  byDay: DayCount[];
}

export const statsApi = {
  async fetch(days = 30): Promise<StatsResponse> {
    const { data } = await apiClient.get<StatsResponse>('/stats', { params: { days } });
    return data;
  },
};
