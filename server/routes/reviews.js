const express = require('express')
const { supabaseAdmin } = require('../config/supabase')

const router = express.Router()

// @route   GET /api/reviews/service/:serviceId
// @desc    Get reviews for a service
// @access  Public
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        users:user_id(id, first_name, last_name, avatar)
      `)
      .eq('service_id', req.params.serviceId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Reviews fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      })
    }

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      user: review.users ? {
        firstName: review.users.first_name,
        lastName: review.users.last_name,
        avatar: review.users.avatar
      } : null
    }))

    res.json({
      success: true,
      data: {
        reviews: formattedReviews
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    })
  }
})

// @route   GET /api/reviews/provider/:providerId
// @desc    Get reviews for a provider
// @access  Public
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        users:user_id(id, first_name, last_name, avatar)
      `)
      .eq('provider_id', req.params.providerId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Reviews fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      })
    }

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      user: review.users ? {
        firstName: review.users.first_name,
        lastName: review.users.last_name,
        avatar: review.users.avatar
      } : null
    }))

    res.json({
      success: true,
      data: {
        reviews: formattedReviews
      }
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    })
  }
})

module.exports = router