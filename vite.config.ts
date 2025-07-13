import path from "node:path";
import { execSync } from "node:child_process";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Get the current Git commit hash
  const getGitCommitHash = () => {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  };

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        // Proxy for Podcast Index API
        '/api/podcastindex': {
          target: 'https://api.podcastindex.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/podcastindex/, '/api/1.0'),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        // Proxy for Podcast Index stats
        '/api/podcastindex-stats': {
          target: 'https://stats.podcastindex.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/podcastindex-stats/, ''),
        },
        // Proxy RSS feed requests to local development server
        '/api/rss-proxy': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, res) => {
              console.error('❌ RSS proxy error:', err);
              if (res && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'RSS proxy server unavailable' }));
              }
            });
          },
        },
      },
    },
    plugins: [
      react(),
    ],
        define: {
      'import.meta.env.VITE_GIT_COMMIT_HASH': JSON.stringify(getGitCommitHash()),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      onConsoleLog(log) {
        return !log.includes("React Router Future Flag Warning");
      },
      env: {
        DEBUG_PRINT_LIMIT: '0', // Suppress DOM output that exceeds AI context windows
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});