const STORAGE_KEY = 'reading_list_auth';

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

export const storage = {
  async getAuth(): Promise<AuthData | null> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as AuthData) ?? null;
  },

  async setAuth(data: AuthData): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  },

  async clearAuth(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY);
  },
};
