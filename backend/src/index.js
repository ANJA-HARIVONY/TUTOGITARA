import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import progressRoutes from './routes/progress.js';
import { seedAdmin } from './services/seedAdmin.js';

process.env.MONGO_URI ||= 'mongodb://127.0.0.1:27017/guitare';
process.env.JWT_SECRET ||= 'dev-only-change-me';
process.env.UPLOAD_DIR ||= path.join(process.cwd(), 'uploads');
process.env.PORT ||= '4000';

if (process.env.JWT_SECRET === 'dev-only-change-me') {
  console.warn('JWT_SECRET par défaut : à changer hors de la machine locale.');
}

fs.mkdirSync(process.env.UPLOAD_DIR, { recursive: true });

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use(errorHandler);

let server;

connectDb()
  .then(seedAdmin)
  .then(() => {
    server = app.listen(Number(process.env.PORT), '0.0.0.0', () => {
      console.log(`API en écoute sur le port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error('Connexion MongoDB impossible', error);
    process.exit(1);
  });

async function shutdown() {
  if (server) server.close();
  await mongoose.disconnect();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
