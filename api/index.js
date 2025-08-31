import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import listingRoute from './routes/listing.router.js';
import priceRoute from './routes/price.route.js';
import newsletterRoute from './routes/newsletter.route.js';
import chatRoute from './routes/chat.route.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import adminRoute from './routes/admin.route.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

if (!process.env.MONGO) {
  console.error('❌ MISSING MONGO CONNECTION STRING IN .env');
  process.exit(1);
}

console.log('[API] Connecting to MongoDB...');
await mongoose.connect(process.env.MONGO);



console.log('✅ Connected to MongoDB');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});



app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/newsletter', newsletterRoute);
app.use('/api/user', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/listing', listingRoute);
app.use('/api/price', priceRoute);
app.use('/api/chat', chatRoute);
app.use('/api/admin', adminRoute);

// Socket.IO log
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('identify', (userId) => {
    if (!userId) return;
    socket.join(`user:${userId}`);
    console.log(`➡️ ${socket.id} identified as user:${userId}`);
  });

  socket.on('join', (conversationId) => {
    socket.join(conversationId);
  });

  // phát cho các client khác trong room + bắn thông báo tới phòng cá nhân từng user
  socket.on('message:send', async ({ conversationId, message }) => {
    socket.to(conversationId).emit('message:new', { conversationId, message });
    try {
      const convo = await (await import('./models/Conversation.js')).default
        .findById(conversationId)
        .lean();
      if (convo?.participants?.length) {
        for (const uid of convo.participants) {
          io.to(`user:${uid}`).emit('inbox:new', { conversationId, message });
        }
      }
    } catch {}
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});




// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev', uptime: process.uptime() });
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
