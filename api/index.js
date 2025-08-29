// api/index.js
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';

// ==== Routes ====
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import listingRoute from './routes/listing.router.js';
import priceRoute from './routes/price.route.js';
import newsletterRoute from './routes/newsletter.route.js';
import chatRoute from './routes/chat.route.js';
import adminRoute from './routes/admin.route.js';

// ==== Utils ====
import { errorHandler } from './utils/error.js';

// ==== ENV ====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// ==== App / Server ====
const app = express();
const server = http.createServer(app);

// ==== CORS (đa origin qua ENV) ====
// VD: CORS_ORIGINS="https://your-pages.pages.dev,https://yourdomain.com"
const allowOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({ origin: allowOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ==== MongoDB ====
const MONGO = process.env.MONGO;
if (!MONGO) {
  console.warn('⚠️  Missing MONGO env in api/.env');
}
mongoose
  .connect(MONGO, { dbName: process.env.DB_NAME || undefined })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err.message));

// ==== Socket.IO ====
const io = new Server(server, {
  cors: {
    origin: allowOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
io.on('connection', (socket) => {
  console.log('🔌 socket connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 socket disconnected:', socket.id));
  // TODO: đăng ký các event chat của bạn ở đây nếu cần
});

// ==== Routes ====
app.use('/api/newsletter', newsletterRoute);
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/listing', listingRoute);
app.use('/api/price', priceRoute);
app.use('/api/chat', chatRoute);
app.use('/api/admin', adminRoute);

// ==== Health check ====
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev', uptime: process.uptime() });
});

// ==== Global error handler ====
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});

// ==== Start ====
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
