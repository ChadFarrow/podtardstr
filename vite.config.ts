import path from "node:path";
import { execSync } from "node:child_process";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import type { ProxyOptions } from "vite";

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
        // Simple proxy for RSS feeds - bypass CORS for any external URL
        '/api/proxy/*': {
          target: 'http://placeholder.com',
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Extract the target URL from the path
              const urlPath = req.url?.replace('/api/proxy/', '') || '';
              const targetUrl = decodeURIComponent(urlPath);
              
              console.log(`🔄 Proxying request to: ${targetUrl}`);
              
              try {
                const url = new URL(targetUrl);
                // Completely replace the request
                proxyReq.protocol = url.protocol;
                proxyReq.host = url.hostname;
                proxyReq.port = url.port || (url.protocol === 'https:' ? 443 : 80);
                proxyReq.path = url.pathname + url.search;
                
                // Set proper headers
                proxyReq.setHeader('Host', url.hostname);
                proxyReq.setHeader('User-Agent', 'Podtardstr/1.0');
                proxyReq.removeHeader('Origin');
                proxyReq.removeHeader('Referer');
              } catch (error) {
                console.error('❌ Invalid proxy URL:', targetUrl, error);
              }
            });
            
            proxy.on('error', (err, req, res) => {
              console.error('❌ Proxy error:', err);
              if (res && !res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Proxy error');
              }
            });
          },
          router: (req: { url?: string }) => {
            const urlPath = req.url?.replace('/api/proxy/', '') || '';
            try {
              const targetUrl = decodeURIComponent(urlPath);
              const url = new URL(targetUrl);
              const target = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
              console.log(`🎯 Routing to: ${target}`);
              return target;
            } catch (error) {
              console.error('❌ Router error:', error);
              return 'https://httpbin.org'; // Fallback
            }
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