import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': resolve(rootDir, '.'),
    },
    include: ['tests/unit/**/*.test.ts'],
  },
});
