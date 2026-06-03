import { vi } from 'vitest';

const store: Record<string, unknown> = {};

globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn((key: string) =>
        Promise.resolve({ [key]: store[key] })
      ),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(store, items);
        return Promise.resolve();
      }),
      remove: vi.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
    },
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: { addListener: vi.fn() },
  },
  runtime: {
    onInstalled: { addListener: vi.fn() },
  },
} as unknown as typeof chrome;
