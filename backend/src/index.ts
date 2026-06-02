// src/index.ts
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.config.js'; 
import { prisma } from './lib/prisma.js';
import authRouter from './modules/auth/auth.route.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      environment: env.NODE_ENV 
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: (error as Error).message });
  }
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 Senior Architect server live on: http://localhost:${env.PORT}`);
});