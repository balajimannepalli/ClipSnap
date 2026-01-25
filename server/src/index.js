import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';

import { connectDB } from './db/connection.js';
import clipRoutes from './routes/clipRoutes.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", FRONTEND_ORIGIN, 'wss:', 'ws:'],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// CORS configuration
app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '150kb' })); // Slightly higher than 100KB to allow for JSON overhead
app.use(express.urlencoded({ extended: true, limit: '150kb' }));

// General rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/clip', clipRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
async function start() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════╗
║           ClipSnap Server Ready            ║
╠════════════════════════════════════════════╣
║  HTTP:   http://localhost:${PORT}             ║
║  WS:     ws://localhost:${PORT}               ║
║  CORS:   ${FRONTEND_ORIGIN}
╚════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

start();

export { app, io };
