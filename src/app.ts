import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { requestIdMiddleware } from './middleware/requestId';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { checkDatabaseHealth } from './config/database';
import ingestionRoutes from './modules/ingestion/routes/ingestionRoutes';
import retrievalRoutes from './modules/retrieval/routes/retrievalRoutes';

const app: Application = express();
const startTime = Date.now();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestIdMiddleware);
app.use(loggerMiddleware);

// Phase 1: General Health endpoint
app.get('/v1/health', (_req: Request, res: Response) => {
  const uptimeSeconds = (Date.now() - startTime) / 1000;
  res.status(200).json({
    status: 'ok',
    app: 'resume-rag-backend',
    version: '1.0.0',
    uptime: parseFloat(uptimeSeconds.toFixed(2)),
  });
});

// Phase 2: MongoDB Health endpoint
app.get('/v1/health/db', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  if (dbHealth.connected) {
    res.status(200).json({
      status: 'ok',
      database: 'mongodb',
      connected: true,
      latencyMs: dbHealth.latencyMs,
    });
  } else {
    res.status(500).json({
      status: 'error',
      database: 'mongodb',
      connected: false,
      errorCode: 'DB_CONNECTION_FAILED',
    });
  }
});

// Ingestion & Retrieval Module Routes
app.use('/v1', ingestionRoutes);
app.use('/v1', retrievalRoutes);

app.use(errorHandler);

export default app;
