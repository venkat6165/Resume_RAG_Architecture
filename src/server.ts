import app from './app';
import { env } from './config/env';
import { connectDatabase, closeDatabase } from './config/database';

async function startServer() {
  try {
    // Attempt database connection on startup
    await connectDatabase().catch((err) => {
      console.warn('[Server] Note: MongoDB connection warning on startup:', err.message);
    });

    const server = app.listen(env.port, () => {
      console.log(`[Server] Resume RAG Backend running on port ${env.port} (${env.nodeEnv})`);
      console.log(`[Server] Health check: http://localhost:${env.port}/v1/health`);
      console.log(`[Server] DB Health check: http://localhost:${env.port}/v1/health/db`);
    });

    const gracefulShutdown = async () => {
      console.log('[Server] Graceful shutdown initiated...');
      await closeDatabase();
      server.close(() => {
        console.log('[Server] Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  }
}

startServer();
