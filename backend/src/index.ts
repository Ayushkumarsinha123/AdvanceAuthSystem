import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { prisma } from './lib/prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;


//standard middleware pipeline
app.use(helmet());
app.use(cors({origin : process.env.Frontend_url || 'http://localhost:3000', credentials: true}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', async (req, res) => {
  try {
    // Quick structural query check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      message: 'Server and Database Driver instances are green!' 
    });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: (error as Error).message });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Senior Architect server live on: http://localhost:${PORT}`);
});