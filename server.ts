import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn('WARNING: VITE_TMDB_API_KEY is not defined in environment variables.');
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // TMDB Proxy Route
  app.get('/api/tmdb/*', async (req, res) => {
    try {
      const endpoint = req.params[0];
      const queryParams = req.query;
      
      console.log(`[Proxy] TMDB Request: ${endpoint}`);

      if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDB API Key missing on server' });
      }
      
      const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
        params: {
          ...queryParams,
          api_key: TMDB_API_KEY,
        },
        timeout: 10000, // 10s timeout
      });
      
      res.json(response.data);
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data || { error: 'Internal Server Error' };
      
      console.error(`[Proxy] TMDB Error (${status}):`, error.message);
      res.status(status).json(message);
    }
  });

  // Vite integration / Static files
  if (process.env.NODE_ENV !== 'production' && !process.env.BUILD_ONLY) {
    console.log('[Server] Starting in Development mode (Vite Middleware)');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Starting in Production mode (Static Hosting)');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Avoid intercepting API routes
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
