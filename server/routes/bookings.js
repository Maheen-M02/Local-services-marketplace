const express = require('express')
const { body, validationResult } = require('express-validator')
const { supabaseAdmin } = require('../config/supabase')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

// Helper function to format booking data
const formatBooking = (booking) => ({
  _id: booking.id, // Keep _id for frontend compatibility
  id: booking.id,
  bookingNumber: booking.booking_number,
  user: booking.user_id,
  service: booking.service_id,
  provider: booking.provider_id,
  status: booking.status,
  scheduledDate: booking.scheduled_date,
  scheduledTime: booking.scheduled_time,
  estimatedDuration: booking.estimated_duration,
  actualStartTime: booking.actual_start_time,
  actualEndTime: booking.actual_end_time,
  address: booking.address,
  pricing: booking.pricing,
  payment: booking.payment,
  customerNotes: booking.customer_notes,
  providerNotes: booking.provider_notes,
  images: booking.images,
  tracking: booking.tracking,
  review: booking.review,
  cancellation: booking.cancellation,
  createdAt: booking.created_at,
  updatedAt: booking.updated_at
})

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User)
router.post('/', authenticateToken, authorizeRoles('user'), [
  body('serviceId').isUUID().withMessage('Valid service ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('address.coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('address.coordinates.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      customerNotes,
      paymentMethod = 'card'
    } = req.body

    // Verify service exists and is active
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or not available'
      })
    }

    // Check if the scheduled date is in the future
    const bookingDate = new Date(scheduledDate)
    const now = new Date()
    if (bookingDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      })
    }

    // Calculate pricing
    const baseAmount = parseFloat(service.base_price)
    const tax = Math.round(baseAmount * 0.08 * 100) / 100 // 8% tax
    const totalAmount = baseAmount + tax

    // Create booking
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        user_id: req.user.id,
        service_id: serviceId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        estimated_duration: service.duration.estimated,
        address,
        pricing: {
          baseAmount,
          tax,
          totalAmount
        },
        payment: {
          method: paymentMethod,
          status: 'pending'
        },
        customer_notes: customerNotes
      }])
      .select()
      .single()

    if (error) {
      console.error('Booking creation error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to create booking'
      })
    }

    // Emit real-time event for new booking
    const io = req.app.get('io')
    if (io) {
      io.emit('new-booking', {
        bookingId: booking.id,
        serviceCategory: service.category,
        location: address.coordinates
      })
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: formatBooking(booking)
      }
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    })
  }
})

// @route   GET /api/bookings/user/:userId
// @desc    Get bookings for a specific user
// @access  Private (User - own bookings only)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Users can only access their own bookings
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    const { page = 1, limit = 10, status } = req.query
    
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services:service_id(id, name, description, category, base_price, images),
        providers:provider_id(id, business_name, rating)
      `, { count: 'exact' })
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    const from = (parseInt(page) - 1) * parseInt(limit)
    const to = from + parseInt(limit) - 1
    query = query.range(from, to)

    const { data: bookings, error, count } = await query

    if (error) {
      console.error('User bookings fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      })
    }

    const totalPages = Math.ceil(count / parseInt(limit))

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      ...formatBooking(booking),
      service: booking.services ? {
        _id: booking.services.id,
        id: booking.services.id,
        name: booking.services.name,
        description: booking.services.description,
        category: booking.services.category,
        basePrice: parseFloat(booking.services.base_price),
        images: booking.services.images
      } : null,
      provider: booking.providers ? {
        _id: booking.providers.id,
        id: booking.providers.id,
        businessName: booking.providers.business_name,
        rating: booking.providers.rating
      } : null
    }))

    res.json({
      success: true,
      data: {
        bookings: formattedBookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('User bookings fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    })
  }
})

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private (User/Provider/Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services:service_id(id, name, description, category, base_price, images),
        providers:provider_id(id, business_name, rating, current_location),
        users:user_id(id, first_name, last_name, phone)
      `)
      .eq('id', req.params.id)
      .single()

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check access permissions
    const isOwner = booking.user_id === req.user.id
    const isProvider = booking.provider_id && booking.providers && booking.providers.user_id === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Format booking for frontend
    const formattedBooking = {
      ...formatBooking(booking),
      service: booking.services ? {
        _id: booking.services.id,
        id: booking.services.id,
        name: booking.services.name,
        description: booking.services.description,
        category: booking.services.category,
        basePrice: parseFloat(booking.services.base_price),
        images: booking.services.images
      } : null,
      provider: booking.providers ? {
        _id: booking.providers.id,
        id: booking.providers.id,
        businessName: booking.providers.business_name,
        rating: booking.providers.rating,
        currentLocation: booking.providers.current_location
      } : null,
      user: booking.users ? {
        _id: booking.users.id,
        id: booking.users.id,
        firstName: booking.users.first_name,
        lastName: booking.users.last_name,
        phone: booking.users.phone
      } : null
    }

    res.json({
      success: true,
      data: {
        booking: formattedBooking
      }
    })
  } catch (error) {
    console.error('Booking fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    })
  }
})

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Provider/Admin)
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['confirmed', 'assigned', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { status } = req.body
    
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check permissions
    const isProvider = booking.provider_id && booking.provider_id === req.user.id
    const isAdmin = req.user.role === 'admin'

    if (!isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Update booking status
    const updateData = { status }
    
    // Set specific timestamps based on status
    switch (status) {
      case 'in-progress':
        updateData.actual_start_time = new Date().toISOString()
        break
      case 'completed':
        updateData.actual_end_time = new Date().toISOString()
        break
      case 'cancelled':
        updateData.cancellation = {
          ...booking.cancellation,
          cancelledBy: req.user.role,
          cancelledAt: new Date().toISOString()
        }
        break
    }

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      console.error('Booking status update error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      })
    }

    // Emit real-time update
    const io = req.app.get('io')
    if (io) {
      io.to(`booking-${booking.id}`).emit('status-update', {
        bookingId: booking.id,
        status: updatedBooking.status,
        updatedAt: new Date()
      })
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: {
        booking: formatBooking(updatedBooking)
      }
    })
  } catch (error) {
    console.error('Booking status update error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    })
  }
})

// @route   POST /api/bookings/:id/review
// @desc    Add review for completed booking
// @access  Private (User)
router.post('/:id/review', authenticateToken, authorizeRoles('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { rating, comment } = req.body
    
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      })
    }

    // Check if already reviewed
    if (booking.review && booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      })
    }

    // Add review to booking
    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update({
        review: {
          rating,
          comment,
          reviewedAt: new Date().toISOString()
        }
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      console.error('Review creation error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to add review'
      })
    }

    // Also create a separate review record
    await supabaseAdmin
      .from('reviews')
      .insert([{
        booking_id: booking.id,
        user_id: req.user.id,
        service_id: booking.service_id,
        provider_id: booking.provider_id,
        rating,
        comment
      }])

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        review: updatedBooking.review
      }
    })
  } catch (error) {
    console.error('Review creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    })
  }
})

module.exports = router