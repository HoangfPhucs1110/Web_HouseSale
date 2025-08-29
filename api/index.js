import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000

// ===== Middlewares chung =====
app.use(express.json())
app.use(cookieParser())

// ===== CORS (có thể bỏ hẳn vì FE & BE cùng origin) =====
const allowAll = !process.env.CORS_ORIGINS || process.env.CORS_ORIGINS === '*'
const corsOrigins = allowAll
  ? true
  : process.env.CORS_ORIGINS.split(',').map(s => s.trim())
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
)

// ===== DB (nếu dùng) =====
if (process.env.MONGO) {
  mongoose
    .connect(process.env.MONGO)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err.message))
}

// ===== Healthcheck =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

// ===== Routers API của bạn =====
// Đổi các đường dẫn dưới cho đúng dự án của bạn:
try {
  const { default: authRouter } = await import('./routes/auth.route.js')
  app.use('/api/auth', authRouter)
} catch {}

try {
  const { default: priceRouter } = await import('./routes/price.route.js')
  app.use('/api/price', priceRouter)
} catch {}

// ===== Serve FE build (copy vào ./public khi build) =====
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const feDir = path.join(__dirname, 'public')

app.use(express.static(feDir)) // phục vụ static từ ./public

// SPA fallback: mọi route KHÔNG bắt đầu bằng /api trả về index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(feDir, 'index.html'))
})

// ===== Start =====
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
