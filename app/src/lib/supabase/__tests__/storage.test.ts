import { CHUNK_SIZE, createChunkedStorage, type KeyValueStore } from '../storage';

function memoryStore() {
  const data = new Map<string, string>();
  const store: KeyValueStore = {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => void data.set(key, value),
    removeItem: async (key) => void data.delete(key),
  };
  return { data, store };
}

test('round-trips a value larger than one chunk', async () => {
  const { data, store } = memoryStore();
  const storage = createChunkedStorage(store);
  const value = 'ä'.repeat(CHUNK_SIZE * 2 + 17);
  await storage.setItem('sb-auth', value);
  expect(await storage.getItem('sb-auth')).toBe(value);
  expect(data.get('sb-auth.n')).toBe('3');
});

test('keeps every chunk below the SecureStore limit of 2048 bytes', async () => {
  const { data, store } = memoryStore();
  await createChunkedStorage(store).setItem('k', '€'.repeat(5000));
  for (const [key, value] of data) {
    if (key !== 'k.n') expect(new TextEncoder().encode(value).length).toBeLessThan(2048);
  }
});

test('shrinking a value removes stale chunks', async () => {
  const { data, store } = memoryStore();
  const storage = createChunkedStorage(store);
  await storage.setItem('k', 'x'.repeat(CHUNK_SIZE * 3));
  await storage.setItem('k', 'short');
  expect(await storage.getItem('k')).toBe('short');
  expect([...data.keys()].sort()).toEqual(['k.0', 'k.n']);
});

test('remove deletes all chunks and missing data reads as null', async () => {
  const { data, store } = memoryStore();
  const storage = createChunkedStorage(store);
  expect(await storage.getItem('k')).toBeNull();
  await storage.setItem('k', 'x'.repeat(CHUNK_SIZE + 1));
  await storage.removeItem('k');
  expect(data.size).toBe(0);
  expect(await storage.getItem('k')).toBeNull();
});

test('an incomplete value reads as null instead of a broken session', async () => {
  const { data, store } = memoryStore();
  const storage = createChunkedStorage(store);
  await storage.setItem('k', 'x'.repeat(CHUNK_SIZE + 1));
  data.delete('k.1');
  expect(await storage.getItem('k')).toBeNull();
});
