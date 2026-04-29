# ServifyX - Premium Home Services Platform

A modern, production-ready full-stack web application for booking home services like cleaning, plumbing, electrical work, and more.

## 🚀 Features

### For Users
- Browse and book home services
- Real-time provider tracking
- Secure payments
- Rating and review system
- Booking history

### For Service Providers
- Profile management
- Accept/reject bookings
- Live location updates
- Earnings dashboard
- Customer reviews

### For Admins
- User and provider management
- Booking oversight
- Analytics dashboard
- Revenue tracking

## 🛠 Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

**Maps & Location:**
- Google Maps API
- Real-time location tracking

## 📦 Installation

1. Clone the repository
2. Install dependencies for all packages:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Add your MongoDB connection string
   - Add Google Maps API key

4. Start the development servers:
   ```bash
   npm run dev
   ```

## 🌐 Environment Setup

### Server (.env)
```
MONGODB_URI=mongodb://localhost:27017/servifyx
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🚀 Deployment

1. Build the client:
   ```bash
   cd client && npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📱 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/services` - Get all services
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/:userId` - Get user bookings
- `PUT /api/bookings/:id/status` - Update booking status

## 🎨 Design System

The application follows a clean, modern design inspired by Airbnb and Stripe, featuring:
- Neutral color palette
- Generous whitespace
- Card-based layouts
- Smooth animations with Framer Motion
- Responsive design

## 📄 License

MIT License - see LICENSE file for details.