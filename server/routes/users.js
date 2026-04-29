const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

// Helper function to format user data
const formatUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  name: `${user.first_name} ${user.last_name}`,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  address: user.address,
  isVerified: user.is_verified,
  isActive: user.is_active,
  preferences: user.preferences,
  lastLogin: user.last_login,
  createdAt: user.created_at,
  updatedAt: user.updated_at
})

// @route   GET /api/users/profile
// @desc    Get current user profile (alias for auth/profile)
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      data: {
        user: formatUser(user)
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    })
  }
})

module.exports = router