import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

function screenshotSaverPlugin() {
  return {
    name: 'screenshot-saver',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use('/api/save-screenshot', async (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer | string) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { filename, dataUrl } = JSON.parse(body);
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const outDir = path.resolve(__dirname, 'docs/graphics/workstation_assets');
              await fs.promises.mkdir(outDir, { recursive: true });
              await fs.promises.writeFile(path.join(outDir, filename), buffer);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, path: filename }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      });

      // Stream incoming asset files from assets_incoming/new without copying to public/
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use('/api/assets-incoming/new', (req: any, res: any) => {
        const cleanUrl = (req.url || '').split('?')[0];
        const filename = path.basename(cleanUrl);
        const filePath = path.resolve(__dirname, 'assets_incoming/new', filename);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.writeHead(200, {
            'Content-Type': 'model/gltf-binary',
            'Access-Control-Allow-Origin': '*',
          });
          fs.createReadStream(filePath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Incoming asset not found: ${filename}` }));
        }
      });

      // Save dev contact sheet images to docs/world/contact-sheets/
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      server.middlewares.use('/api/save-contact-sheet', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer | string) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { filename, dataUrl } = JSON.parse(body);
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const isCharSheet = filename.startsWith('characters/');
              const cleanFilename = isCharSheet ? filename.replace('characters/', '') : filename;
              const outDir = isCharSheet
                ? path.resolve(__dirname, 'docs/characters/contact-sheets')
                : path.resolve(__dirname, 'docs/world/contact-sheets');
              await fs.promises.mkdir(outDir, { recursive: true });
              await fs.promises.writeFile(path.join(outDir, cleanFilename), buffer);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: true, path: filename }));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), screenshotSaverPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts'],
    },
  },
});
