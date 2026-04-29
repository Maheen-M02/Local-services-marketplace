import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, 
  Clock, 
  MapPin, 
  Shield, 
  CheckCircle,
  Calendar,
  ArrowLeft,
  Heart,
  Share2
} from 'lucide-react'
import { servicesAPI, reviewsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function ServiceDetails() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [similarServices, setSimilarServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    fetchServiceDetails()
  }, [id])

  const fetchServiceDetails = async () => {
    try {
      setLoading(true)
      const [serviceRes, reviewsRes, similarRes] = await Promise.all([
        servicesAPI.getById(id),
        reviewsAPI.getByService(id),
        servicesAPI.getById(id).then(res => 
          servicesAPI.getAll({ category: res.data.service.category, limit: 4 })
        ).catch(() => ({ data: { services: [] } }))
      ])

      setService(serviceRes.data.service)
      setReviews(reviewsRes.data.reviews || [])
      setSimilarServices(similarRes.data.services || [])
    } catch (error) {
      console.error('Error fetching service details:', error)
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

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Service not found
          </h2>
          <Link to="/services">
            <Button>Browse Services</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/services"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                <img
                  src={service.images?.[activeImageIndex]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {service.images && service.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {service.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImageIndex === index
                          ? 'border-primary-500'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Service Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 mb-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {service.rating?.average || '4.8'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({service.rating?.count || 0} reviews)
                        </span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-6 h-6" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                  {service.description}
                </p>

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      What's Included
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {service.requirements && service.requirements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {service.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900 dark:text-white">Duration</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {Math.round(service.duration?.estimated / 60)} hours
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900 dark:text-white">Service Area</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {service.serviceArea?.radius}km radius
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <div className="font-semibold text-gray-900 dark:text-white">Guarantee</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      100% Satisfaction
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Customer Reviews
                </h3>
                
                {reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No reviews yet. Be the first to review this service!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {review.user?.firstName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {review.user?.firstName} {review.user?.lastName}
                              </span>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {review.comment && (
                              <p className="text-gray-600 dark:text-gray-300">
                                {review.comment}
                              </p>
                            )}
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-8"
            >
              <Card className="p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${service.basePrice}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {service.priceType === 'hourly' ? 'per hour' : 'fixed price'}
                  </div>
                </div>

                {isAuthenticated ? (
                  <Link to={`/book/${service._id}`}>
                    <Button className="w-full mb-4" size="lg">
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button className="w-full mb-4" size="lg">
                      Sign in to Book
                    </Button>
                  </Link>
                )}

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Free cancellation up to 24 hours before service
                </div>
              </Card>

              {/* Similar Services */}
              {similarServices.length > 0 && (
                <Card className="p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Similar Services
                  </h4>
                  <div className="space-y-4">
                    {similarServices.slice(0, 3).map((similarService) => (
                      <Link
                        key={similarService._id}
                        to={`/services/${similarService._id}`}
                        className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={similarService.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100'}
                            alt={similarService.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {similarService.name}
                            </div>
                            <div className="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                              ${similarService.basePrice}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}