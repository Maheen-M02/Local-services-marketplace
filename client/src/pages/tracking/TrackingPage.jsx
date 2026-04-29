import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Phone, MessageCircle } from 'lucide-react'
import { bookingsAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function TrackingPage() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(bookingId)
      setBooking(response.data.booking)
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Track Your Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Booking #{booking?.bookingNumber}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <Card className="p-6 h-96">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Live tracking map will appear here
                </p>
              </div>
            </div>
          </Card>

          {/* Booking Details */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Service Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Service:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {booking?.service?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {booking?.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Scheduled:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {booking?.scheduledDate && new Date(booking.scheduledDate).toLocaleDateString()} at {booking?.scheduledTime}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Provider Contact
              </h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {booking?.provider?.businessName?.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {booking?.provider?.businessName || 'Service Provider'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Professional Service Provider
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="secondary" size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button variant="secondary" size="sm" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}