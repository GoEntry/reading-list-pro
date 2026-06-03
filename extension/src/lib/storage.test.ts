import { describe, it, expect, beforeEach } from 'vitest';
import { storage, type AuthData } from './storage';

const mockAuth: AuthData = {
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
  userId: 'user-uuid-123',
  email: 'test@example.com',
};

describe('storage', () => {
  beforeEach(async () => {
    await storage.clearAuth();
  });

  it('returns null when no auth data is stored', async () => {
    const result = await storage.getAuth();
    expect(result).toBeNull();
  });

  it('stores and retrieves auth data', async () => {
    await storage.setAuth(mockAuth);
    const result = await storage.getAuth();
    expect(result).toEqual(mockAuth);
  });

  it('clears stored auth data', async () => {
    await storage.setAuth(mockAuth);
    await storage.clearAuth();
    const result = await storage.getAuth();
    expect(result).toBeNull();
  });

  it('overwrites existing auth data on setAuth', async () => {
    await storage.setAuth(mockAuth);
    const updated: AuthData = { ...mockAuth, accessToken: 'new-token' };
    await storage.setAuth(updated);
    const result = await storage.getAuth();
    expect(result?.accessToken).toBe('new-token');
  });
});
