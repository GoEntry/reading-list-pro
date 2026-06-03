import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '../lib/api';
import { authApi } from './auth';

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe('authApi.login', () => {
  it('POST /auth/login with credentials, returns tokens', async () => {
    const response = {
      accessToken: 'access-abc',
      refreshToken: 'refresh-xyz',
      userId: 'user-123',
      email: 'user@example.com',
    };
    mock.onPost('/auth/login', { email: 'user@example.com', password: 'secret' })
      .reply(200, response);

    const result = await authApi.login('user@example.com', 'secret');

    expect(result).toEqual(response);
  });

  it('throws on 401 invalid credentials', async () => {
    mock.onPost('/auth/login').reply(401, { message: 'Invalid credentials' });

    await expect(authApi.login('bad@example.com', 'wrong')).rejects.toThrow();
  });
});

describe('authApi.register', () => {
  it('POST /auth/register, returns tokens', async () => {
    const response = {
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      userId: 'new-user',
      email: 'new@example.com',
    };
    mock.onPost('/auth/register', { email: 'new@example.com', password: 'pass123' })
      .reply(201, response);

    const result = await authApi.register('new@example.com', 'pass123');

    expect(result).toEqual(response);
  });

  it('throws on 409 email already in use', async () => {
    mock.onPost('/auth/register').reply(409, { message: 'Email already in use' });

    await expect(authApi.register('taken@example.com', 'pass')).rejects.toThrow();
  });
});

describe('authApi.refresh', () => {
  it('POST /auth/refresh with refresh token as Bearer, returns new tokens', async () => {
    const response = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      userId: 'user-123',
      email: 'user@example.com',
    };
    mock.onPost('/auth/refresh').reply(200, response);

    const result = await authApi.refresh('my-refresh-token');

    expect(result).toEqual(response);
    const lastRequest = mock.history['post']?.[0];
    expect(lastRequest?.headers?.['Authorization']).toBe('Bearer my-refresh-token');
  });
});
