import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react'
import { servicesAPI, bookingsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function BookingPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      coordinates: user?.address?.coordinates || { lat: 0, lng: 0 },
      instructions: ''
    },
    customerNotes: '',
    paymentMethod: 'card'
  })

  useEffect(() => {
    fetchService()
  }, [serviceId])

  const fetchService = async () => {
    try {
      // Try API first
      const response = await servicesAPI.getById(serviceId)
      setService(response.data.service)
    } catch (error) {
      // Fall back to mock data for mock service IDs
      const MOCK = [
        { _id:'svc-001',id:'svc-001', name:'Deep Home Cleaning',          category:'cleaning',       priceType:'fixed',    basePrice:89,  duration:{estimated:180}, images:[{url:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}] },
        { _id:'svc-002',id:'svc-002', name:'Plumbing Repair & Installation',category:'plumbing',     priceType:'hourly',   basePrice:99,  duration:{estimated:120}, images:[{url:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'}] },
        { _id:'svc-003',id:'svc-003', name:'Electrical Safety Check',      category:'electrical',    priceType:'fixed',    basePrice:149, duration:{estimated:150}, images:[{url:'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400'}] },
        { _id:'svc-004',id:'svc-004', name:'Interior Painting',            category:'painting',      priceType:'per-room', basePrice:199, duration:{estimated:300}, images:[{url:'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400'}] },
        { _id:'svc-005',id:'svc-005', name:'Carpentry & Furniture Assembly',category:'carpentry',    priceType:'hourly',   basePrice:79,  duration:{estimated:120}, images:[{url:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'}] },
        { _id:'svc-006',id:'svc-006', name:'Garden & Lawn Maintenance',    category:'gardening',     priceType:'fixed',    basePrice:69,  duration:{estimated:120}, images:[{url:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'}] },
        { _id:'svc-007',id:'svc-007', name:'Appliance Repair',             category:'appliance-repair',priceType:'fixed',  basePrice:119, duration:{estimated:90},  images:[{url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}] },
        { _id:'svc-008',id:'svc-008', name:'Pest Control Treatment',       category:'pest-control',  priceType:'fixed',    basePrice:129, duration:{estimated:90},  images:[{url:'https://images.unsplash.com/photo-1632923057155-dd35366009b5?w=400'}] },
        { _id:'svc-009',id:'svc-009', name:'Home Moving Service',          category:'moving',        priceType:'hourly',   basePrice:149, duration:{estimated:240}, images:[{url:'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400'}] },
        { _id:'svc-010',id:'svc-010', name:'HVAC Service & Repair',        category:'other',         priceType:'fixed',    basePrice:179, duration:{estimated:120}, images:[{url:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400'}] },
        { _id:'svc-011',id:'svc-011', name:'Window & Gutter Cleaning',     category:'cleaning',      priceType:'fixed',    basePrice:79,  duration:{estimated:150}, images:[{url:'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400'}] },
        { _id:'svc-012',id:'svc-012', name:'Exterior Painting',            category:'painting',      priceType:'fixed',    basePrice:349, duration:{estimated:480}, images:[{url:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400'}] },
      ]
      const mock = MOCK.find(s => s._id === serviceId || s.id === serviceId)
      if (mock) {
        setService(mock)
      } else {
        console.error('Service not found:', error)
        toast.error('Service not found')
        navigate('/services')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // For mock services, simulate a successful booking
      const isMockService = serviceId.startsWith('svc-')
      if (isMockService) {
        await new Promise(r => setTimeout(r, 800)) // simulate network delay
        toast.success('Booking confirmed! (Demo mode)')
        navigate('/dashboard')
        return
      }

      const response = await bookingsAPI.create({ serviceId, ...bookingData })
      toast.success('Booking created successfully!')
      navigate(`/tracking/${response.data.booking._id}`)
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service not found
          </h2>
          <Button onClick={() => navigate('/services')}>
            Browse Services
          </Button>
        </div>
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
            Book {service.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule your service and provide booking details
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date & Time */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Date & Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Date"
                    type="date"
                    value={bookingData.scheduledDate}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      scheduledDate: e.target.value
                    })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  
                  <Input
                    label="Preferred Time"
                    type="time"
                    value={bookingData.scheduledTime}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      scheduledTime: e.target.value
                    })}
                    required
                  />
                </div>
              </Card>

              {/* Address */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Service Address
                </h3>
                
                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    value={bookingData.address.street}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      address: { ...bookingData.address, street: e.target.value }
                    })}
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={bookingData.address.city}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, city: e.target.value }
                      })}
                      required
                    />
                    
                    <Input
                      label="State"
                      value={bookingData.address.state}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, state: e.target.value }
                      })}
                      required
                    />
                    
                    <Input
                      label="Zip Code"
                      value={bookingData.address.zipCode}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, zipCode: e.target.value }
                      })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={bookingData.address.instructions}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        address: { ...bookingData.address, instructions: e.target.value }
                      })}
                      rows={3}
                      className="input-field"
                      placeholder="Any special instructions for the service provider..."
                    />
                  </div>
                </div>
              </Card>

              {/* Additional Notes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Additional Notes
                </h3>
                
                <textarea
                  value={bookingData.customerNotes}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    customerNotes: e.target.value
                  })}
                  rows={4}
                  className="input-field"
                  placeholder="Any specific requirements or preferences..."
                />
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={bookingData.paymentMethod === 'card'}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        paymentMethod: e.target.value
                      })}
                      className="text-primary-600"
                    />
                    <span className="text-gray-900 dark:text-white">Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={bookingData.paymentMethod === 'cash'}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        paymentMethod: e.target.value
                      })}
                      className="text-primary-600"
                    />
                    <span className="text-gray-900 dark:text-white">Cash on Service</span>
                  </label>
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Booking Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                      alt={service.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {service.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Service Price</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${service.basePrice}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${Math.round(service.basePrice * 0.08 * 100) / 100}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                          ${service.basePrice + Math.round(service.basePrice * 0.08 * 100) / 100}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={submitting}
                  >
                    Confirm Booking
                  </Button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    By booking, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}