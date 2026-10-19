import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Minimal async key-value store, implemented by SecureStore and by tests. */
export type KeyValueStore = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// SecureStore warns above 2048 bytes per value. 600 characters stay below that
// even if every character needs 3 bytes in UTF-8.
export const CHUNK_SIZE = 600;

const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

async function readCount(store: KeyValueStore, key: string): Promise<number> {
  const raw = await store.getItem(countKey(key));
  const n = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Splits values into chunks so a Supabase session (often > 2 KB) fits into the
 * encrypted keychain / keystore. Incomplete data reads as null (signed out).
 */
export function createChunkedStorage(store: KeyValueStore): KeyValueStore {
  return {
    async getItem(key) {
      const n = await readCount(store, key);
      if (n === 0) return null;
      const parts: string[] = [];
      for (let i = 0; i < n; i++) {
        const part = await store.getItem(chunkKey(key, i));
        if (part === null) return null;
        parts.push(part);
      }
      return parts.join('');
    },
    async setItem(key, value) {
      const previous = await readCount(store, key);
      const n = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
      for (let i = 0; i < n; i++) {
        await store.setItem(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
      await store.setItem(countKey(key), String(n));
      for (let i = n; i < previous; i++) {
        await store.removeItem(chunkKey(key, i));
      }
    },
    async removeItem(key) {
      const n = await readCount(store, key);
      await store.removeItem(countKey(key));
      for (let i = 0; i < n; i++) {
        await store.removeItem(chunkKey(key, i));
      }
    },
  };
}

const secureStore: KeyValueStore = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// The web build is only used for UI checks during development; SecureStore
// does not exist there.
const webStore: KeyValueStore = {
  getItem: async (key) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key)),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};

export const sessionStorage: KeyValueStore =
  Platform.OS === 'web' ? webStore : createChunkedStorage(secureStore);
