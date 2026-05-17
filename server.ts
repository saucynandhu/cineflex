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
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // TMDB Proxy Route
  app.get('/api/tmdb/*', async (req, res) => {
    try {
      const endpoint = req.params[0];
      const queryParams = req.query;
      
      const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
        params: {
          ...queryParams,
          api_key: TMDB_API_KEY,
        },
      });
      
      res.json(response.data);
    } catch (error: any) {
      console.error('TMDB Proxy Error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
    }
  });

  // Vite integration
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
