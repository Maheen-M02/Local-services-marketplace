const express = require('express')
const { body, query, validationResult } = require('express-validator')
const { supabaseAdmin } = require('../config/supabase')
const { optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Helper function to format service data
const formatService = (service) => ({
  _id: service.id, // Keep _id for frontend compatibility
  id: service.id,
  name: service.name,
  description: service.description,
  category: service.category,
  subcategory: service.subcategory,
  basePrice: parseFloat(service.base_price),
  priceType: service.price_type,
  duration: service.duration,
  images: service.images,
  features: service.features,
  requirements: service.requirements,
  availability: service.availability,
  serviceArea: service.service_area,
  rating: service.rating,
  bookingCount: service.booking_count,
  isActive: service.is_active,
  tags: service.tags,
  seo: service.seo,
  createdAt: service.created_at,
  updatedAt: service.updated_at
})

// @route   GET /api/services
// @desc    Get all services with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('search').optional().isString().withMessage('Search must be a string')
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
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      rating,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query

    // Build query
    let query = supabaseAdmin
      .from('services')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (minPrice) {
      query = query.gte('base_price', parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte('base_price', parseFloat(maxPrice))
    }

    if (rating) {
      query = query.gte('rating->average', parseFloat(rating))
    }

    if (search) {
      // Use simple text search with OR condition
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    if (sortBy === 'rating') {
      query = query.order('rating->average', { ascending })
    } else if (sortBy === 'basePrice') {
      query = query.order('base_price', { ascending })
    } else if (sortBy === 'bookingCount') {
      query = query.order('booking_count', { ascending })
    } else {
      query = query.order(sortBy === 'createdAt' ? 'created_at' : sortBy, { ascending })
    }

    // Apply pagination
    const from = (parseInt(page) - 1) * parseInt(limit)
    const to = from + parseInt(limit) - 1
    query = query.range(from, to)

    const { data: services, error, count } = await query

    if (error) {
      console.error('Services fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services'
      })
    }

    const totalPages = Math.ceil((count || 0) / parseInt(limit))

    res.json({
      success: true,
      data: {
        services: (services || []).map(formatService),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count || 0,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    })
  } catch (error) {
    console.error('Services fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    })
  }
})

// @route   GET /api/services/categories
// @desc    Get all service categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('services')
      .select('category')
      .eq('is_active', true)

    if (error) {
      console.error('Categories fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      })
    }

    // Count categories
    const categoryCounts = categories.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1
      return acc
    }, {})

    const categoryList = [
      { name: 'cleaning', label: 'Home Cleaning', icon: 'home' },
      { name: 'plumbing', label: 'Plumbing', icon: 'wrench' },
      { name: 'electrical', label: 'Electrical', icon: 'zap' },
      { name: 'painting', label: 'Painting', icon: 'paintbrush' },
      { name: 'carpentry', label: 'Carpentry', icon: 'hammer' },
      { name: 'gardening', label: 'Gardening', icon: 'leaf' },
      { name: 'appliance-repair', label: 'Appliance Repair', icon: 'settings' },
      { name: 'pest-control', label: 'Pest Control', icon: 'bug' },
      { name: 'moving', label: 'Moving', icon: 'truck' },
      { name: 'other', label: 'Other', icon: 'more-horizontal' }
    ]

    // Add counts to categories
    const categoriesWithCounts = categoryList.map(cat => ({
      ...cat,
      count: categoryCounts[cat.name] || 0
    }))

    res.json({
      success: true,
      data: {
        categories: categoriesWithCounts
      }
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    })
  }
})

// @route   GET /api/services/search
// @desc    Search services
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
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

    const { q, limit = 10 } = req.query

    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('id, name, description, category, base_price, rating, images')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(parseInt(limit))

    if (error) {
      console.error('Search error:', error)
      return res.status(500).json({
        success: false,
        message: 'Search failed'
      })
    }

    res.json({
      success: true,
      data: {
        services: services.map(service => ({
          _id: service.id,
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          basePrice: parseFloat(service.base_price),
          rating: service.rating,
          images: service.images
        })),
        query: q
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Search failed'
    })
  }
})

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { data: service, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single()

    if (error || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      })
    }

    res.json({
      success: true,
      data: {
        service: formatService(service)
      }
    })
  } catch (error) {
    console.error('Service fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    })
  }
})

// @route   GET /api/services/:id/similar
// @desc    Get similar services
// @access  Public
router.get('/:id/similar', async (req, res) => {
  try {
    // First get the service to find its category
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('category')
      .eq('id', req.params.id)
      .single()

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      })
    }

    // Get similar services in the same category
    const { data: similarServices, error } = await supabaseAdmin
      .from('services')
      .select('id, name, description, base_price, rating, images, category')
      .eq('category', service.category)
      .eq('is_active', true)
      .neq('id', req.params.id)
      .limit(4)

    if (error) {
      console.error('Similar services fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch similar services'
      })
    }

    res.json({
      success: true,
      data: {
        services: similarServices.map(service => ({
          _id: service.id,
          id: service.id,
          name: service.name,
          description: service.description,
          basePrice: parseFloat(service.base_price),
          rating: service.rating,
          images: service.images,
          category: service.category
        }))
      }
    })
  } catch (error) {
    console.error('Similar services fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar services'
    })
  }
})

module.exports = router