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

app.use(express.json())
app.use(cookieParser())

const allowAll = !process.env.CORS_ORIGINS || process.env.CORS_ORIGINS === '*'
const corsOrigins = allowAll ? true : process.env.CORS_ORIGINS.split(',').map(s=>s.trim())
app.use(cors({ origin: corsOrigins, credentials: true }))

if (process.env.MONGO) {
  mongoose.connect(process.env.MONGO)
    .then(()=>console.log('✅ MongoDB connected'))
    .catch(e=>console.error('❌ MongoDB error:', e.message))
}

app.get('/api/health', (req,res)=>res.json({ ok:true, ts:new Date().toISOString() }))

// TODO: import các router thật của bạn nếu có
try { const { default: auth } = await import('./routes/auth.route.js'); app.use('/api/auth', auth) } catch {}
try { const { default: price } = await import('./routes/price.route.js'); app.use('/api/price', price) } catch {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const feDir = path.join(__dirname, 'public')

app.use(express.static(feDir))
app.get(/^(?!\/api).*/, (req,res)=>res.sendFile(path.join(feDir,'index.html')))

app.listen(PORT, ()=>console.log(`🚀 Server running at http://localhost:${PORT}`))
