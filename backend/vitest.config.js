import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks', // Use process forks instead of worker threads for native addon stability on Windows
  },
});
