const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

// Helper function to format provider data
const formatProvider = (provider) => ({
  _id: provider.id, // Keep _id for frontend compatibility
  id: provider.id,
  userId: provider.user_id,
  businessName: provider.business_name,
  description: provider.description,
  services: provider.services,
  specializations: provider.specializations,
  experience: provider.experience,
  certifications: provider.certifications,
  documents: provider.documents,
  serviceArea: provider.service_area,
  availability: provider.availability,
  pricing: provider.pricing,
  rating: provider.rating,
  stats: provider.stats,
  earnings: provider.earnings,
  bankDetails: provider.bank_details,
  status: provider.status,
  isOnline: provider.is_online,
  lastSeen: provider.last_seen,
  currentLocation: provider.current_location,
  preferences: provider.preferences,
  createdAt: provider.created_at,
  updatedAt: provider.updated_at
})

// @route   GET /api/providers
// @desc    Get all providers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { data: providers, error } = await supabaseAdmin
      .from('providers')
      .select(`
        *,
        users:user_id(id, first_name, last_name, avatar)
      `)
      .eq('status', 'approved')
      .limit(20)

    if (error) {
      console.error('Providers fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch providers'
      })
    }

    // Format providers for frontend
    const formattedProviders = providers.map(provider => ({
      ...formatProvider(provider),
      user: provider.users ? {
        id: provider.users.id,
        firstName: provider.users.first_name,
        lastName: provider.users.last_name,
        avatar: provider.users.avatar
      } : null
    }))

    res.json({
      success: true,
      data: {
        providers: formattedProviders
      }
    })
  } catch (error) {
    console.error('Providers fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch providers'
    })
  }
})

module.exports = router