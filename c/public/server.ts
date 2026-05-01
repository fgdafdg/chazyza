import express from 'express';
import { createServer } from 'node:http';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  const app = express();
  const server = createServer();
  const bare = createBareServer('/bare/');
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/status', (req, res) => {
    res.json({ status: 'online', service: "Chazaya's Place Proxy" });
  });

  // Mock File Sharing
  const sharedFiles = new Map();
  app.post('/api/share', (req, res) => {
    const { content, name } = req.body;
    const id = Math.random().toString(36).substring(7);
    sharedFiles.set(id, { content, name, timestamp: Date.now() });
    res.json({ id });
  });

  app.get('/api/share/:id', (req, res) => {
    const file = sharedFiles.get(req.params.id);
    if (!file) return res.status(404).send('File not found');
    res.json(file);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.on('request', (req, res) => {
    if (bare.shouldRoute(req)) {
      bare.routeRequest(req, res);
    } else {
      app(req, res);
    }
  });

  server.on('upgrade', (req, socket, head) => {
    if (bare.shouldRoute(req)) {
      bare.routeUpgrade(req, socket, head);
    } else {
      socket.end();
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
