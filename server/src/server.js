import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`LearnSphere API listening on http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`\n${signal} received. Closing LearnSphere API...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Unable to start LearnSphere API:', error);
  process.exit(1);
});
