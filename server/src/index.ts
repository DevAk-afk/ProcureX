import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { User } from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Auto-seed demo baseline only if database is completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[ProcureX] No users detected. Automatically initializing baseline dataset...');
      await seedDatabase({ clearExisting: false });
    } else {
      console.log(`[ProcureX] Verified database with ${userCount} existing user records. Preserving persistent data.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`[ProcureX Server] 🚀 Running successfully on port ${PORT}`);
      console.log(`[ProcureX Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[ProcureX Server] API Gateway: http://localhost:${PORT}/api/v1`);
      console.log(`[ProcureX Server] Health check: http://localhost:${PORT}/api/v1/health`);
    });

    const shutdown = async () => {
      console.log('\n[ProcureX Server] Gracefully shutting down...');
      server.close(async () => {
        await disconnectDB();
        console.log('[ProcureX Server] All database connections terminated. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err: any) {
    console.error('[ProcureX Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();

// Prevent server crash from unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('[ProcureX] Unhandled Rejection — reason:', reason?.message || reason);
  // Don't exit — let the server keep running
});

process.on('uncaughtException', (err: any) => {
  console.error('[ProcureX] Uncaught Exception:', err.message);
  // Don't exit — let the server keep running
});
