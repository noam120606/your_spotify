import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  dev: {
    writeToDisk: true,
  },
  output: {
    distPath: "./build",
    target: 'node',
  },
});
