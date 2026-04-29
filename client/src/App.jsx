import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import UserDashboard from './pages/user/UserDashboard'
import ServiceListing from './pages/services/ServiceListing'
import ServiceDetails from './pages/services/ServiceDetails'
import BookingPage from './pages/booking/BookingPage'
import TrackingPage from './pages/tracking/TrackingPage'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProfilePage from './pages/user/ProfilePage'
import BookingHistory from './pages/user/BookingHistory'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import FluidGlassCursor from './components/ui/FluidGlassCursor'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <FluidGlassCursor />
            <Navigation />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<><LandingPage /><Footer /></>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/services" element={<><ServiceListing /><Footer /></>} />
              <Route path="/services/:id" element={<><ServiceDetails /><Footer /></>} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                  <Footer />
                </ProtectedRoute>
              } />
              
              <Route path="/book/:serviceId" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <BookingPage />
                  <Footer />
                </ProtectedRoute>
              } />
              
              <Route path="/tracking/:bookingId" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <TrackingPage />
                  <Footer />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['user', 'provider']}>
                  <ProfilePage />
                  <Footer />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute allowedRoles={['user']}>
                  <BookingHistory />
                  <Footer />
                </ProtectedRoute>
              } />
              
              {/* Protected Provider Routes */}
              <Route path="/provider/dashboard" element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App