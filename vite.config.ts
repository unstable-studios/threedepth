import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { cloudflare } from '@cloudflare/vite-plugin';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), cloudflare(), tailwindcss(), svgr()],
	build: {
		chunkSizeWarningLimit: 750, // Three.js is large, but it's split and gzipped well
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Only apply manual chunks for client-side modules
					if (id.includes('node_modules')) {
						if (id.includes('three') && !id.includes('@react-three')) {
							return 'three';
						}
						if (id.includes('@react-three')) {
							return 'three-fiber';
						}
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
							return 'react-vendor';
						}
						if (id.includes('react-icons')) {
							return 'icons';
						}
					}
				},
			},
		},
	},
});
