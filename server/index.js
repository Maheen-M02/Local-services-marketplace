const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const compression = require('compression')
const rateLimit  = require('express-rate-limit')
require('dotenv').config()

// Import Supabase config
const { supabase, supabaseAdmin } = require('./config/supabase')

// Import routes
const authRoutes     = require('./routes/auth')
const userRoutes     = require('./routes/users')
const serviceRoutes  = require('./routes/services')
const bookingRoutes  = require('./routes/bookings')
const providerRoutes = require('./routes/providers')
const reviewRoutes   = require('./routes/reviews')
const adminRoutes    = require('./routes/admin')

// Import middleware
const errorHandler = require('./middleware/errorHandler')

const app = express()

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Make Supabase available to routes ─────────────────────────────────────────
app.set('supabase', supabase)
app.set('supabaseAdmin', supabaseAdmin)
// io is null in serverless — routes check before using it
app.set('io', null)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Supabase PostgreSQL',
  })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/services',  serviceRoutes)
app.use('/api/bookings',  bookingRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api/reviews',   reviewRoutes)
app.use('/api/admin',     adminRoutes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Local dev server (not used on Vercel) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const { createServer } = require('http')
  const { Server }       = require('socket.io')

  const httpServer = createServer(app)
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  })

  app.set('io', io)

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join-booking', (bookingId) => {
      socket.join(`booking-${bookingId}`)
    })
    socket.on('provider-location-update', (data) => {
      socket.to(`booking-${data.bookingId}`).emit('location-update', data)
    })
    socket.on('booking-status-update', (data) => {
      socket.to(`booking-${data.bookingId}`).emit('status-update', data)
    })
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  const PORT = process.env.PORT || 5000
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🗄️  Database: Supabase PostgreSQL`)
  })

  // Test Supabase connection on startup
  supabase.from('users').select('count').limit(1).then(({ error }) => {
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Supabase tables may not exist yet — run schema.sql')
    } else {
      console.log('✅ Connected to Supabase')
    }
  }).catch(err => console.error('❌ Supabase error:', err.message))
}

// ── Export for Vercel serverless ──────────────────────────────────────────────
module.exports = app
