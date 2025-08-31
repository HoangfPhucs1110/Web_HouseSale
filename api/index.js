// api/index.js
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Routes
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import listingRoute from './routes/listing.router.js';
import priceRoute from './routes/price.route.js';
import newsletterRoute from './routes/newsletter.route.js';
import chatRoute from './routes/chat.route.js';
import adminRoute from './routes/admin.route.js';

// --- Resolve __dirname in ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Load env (không lỗi nếu thiếu .env – Render dùng dashboard env) ---
dotenv.config({ path: path.resolve(__dirname, './.env') });

// --- DB connect ---
if (!process.env.MONGO) {
  console.error('❌ MISSING MONGO CONNECTION STRING IN .env / environment');
  process.exit(1);
}
console.log('[API] Connecting to MongoDB...');
await mongoose.connect(process.env.MONGO);
console.log('✅ Connected to MongoDB');

// --- App & server ---
const app = express();
const server = http.createServer(app);

// --- CORS (mặc định cho phép tất cả; đặt CLIENT_ORIGIN để khóa domain cụ thể) ---
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';
const corsOrigin = CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN;
app.use(cors({ origin: corsOrigin, credentials: true }));

// --- Parsers ---
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- API routes ---
app.use('/api/newsletter', newsletterRoute);
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/listing', listingRoute);
app.use('/api/price', priceRoute);
app.use('/api/chat', chatRoute);
app.use('/api/admin', adminRoute);

// --- Serve frontend (tự phát hiện build) ---
const candidates = [
  path.join(__dirname, 'public'),                 // build đã copy vào api/public
  path.join(__dirname, '..', 'frontend', 'dist'), // fallback: dùng trực tiếp FE/dist
];
let publicDir = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));
if (!publicDir) {
  console.warn('[WARN] Không tìm thấy index.html ở các đường dẫn:', candidates);
  // vẫn set tạm để app không crash; SPA sẽ trả 404 JSON nếu thiếu
  publicDir = path.join(__dirname, 'public');
}
console.log('[WEB] Serving frontend from:', publicDir);
app.use(express.static(publicDir));

// --- SPA catch-all (mọi route không phải /api/*) ---
app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: `ENOENT: index.html not found at ${indexPath}`,
    });
  }
  res.sendFile(indexPath);
});

// --- Socket.IO ---
const io = new Server(server, { cors: { origin: corsOrigin, credentials: true } });
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('identify', (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`➡️ ${socket.id} identified as user:${userId}`);
  });

  socket.on('join', (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  // Phát cho room hội thoại + thông báo vào hộp thư người tham gia
  socket.on('message:send', async ({ conversationId, message }) => {
    if (!conversationId || !message) return;
    socket.to(conversationId).emit('message:new', { conversationId, message });
    try {
      const Conversation = (await import('./models/Conversation.js')).default;
      const convo = await Conversation.findById(conversationId).lean();
      if (convo?.participants?.length) {
        for (const uid of convo.participants) {
          io.to(`user:${uid}`).emit('inbox:new', { conversationId, message });
        }
      }
    } catch (e) {
      // tránh làm rơi kết nối socket nếu DB lỗi
      console.warn('[Socket message:send] warn:', e?.message || e);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// --- Healthcheck ---
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev', uptime: process.uptime() });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});

// --- Start ---
const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
