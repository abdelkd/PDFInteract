import { defineConfig, searchForWorkspaceRoot } from "vite";
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    server: {
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          'src/assets/fonts/'
        ],
      },
    },
});
