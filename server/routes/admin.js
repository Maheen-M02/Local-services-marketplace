const express = require('express')
const { supabaseAdmin } = require('../config/supabase')
const { authenticateToken, authorizeRoles } = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get counts for different entities
    const [
      { count: totalUsers },
      { count: totalProviders },
      { count: totalBookings },
      { count: totalServices }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabaseAdmin.from('providers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true)
    ])

    // Get recent bookings
    const { data: recentBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        users:user_id(first_name, last_name),
        services:service_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (bookingsError) {
      console.error('Recent bookings fetch error:', bookingsError)
    }

    // Calculate monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data: completedBookings, error: revenueError } = await supabaseAdmin
      .from('bookings')
      .select('pricing')
      .eq('status', 'completed')
      .gte('created_at', currentMonth.toISOString())

    let monthlyRevenue = 0
    if (!revenueError && completedBookings) {
      monthlyRevenue = completedBookings.reduce((total, booking) => {
        return total + (booking.pricing?.totalAmount || 0)
      }, 0)
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers || 0,
          totalProviders: totalProviders || 0,
          totalBookings: totalBookings || 0,
          totalServices: totalServices || 0,
          monthlyRevenue: Math.round(monthlyRevenue * 100) / 100
        },
        recentBookings: recentBookings || []
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    })
  }
})

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Private (Admin)
router.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    
    const from = (parseInt(page) - 1) * parseInt(limit)
    const to = from + parseInt(limit) - 1

    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Users fetch error:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      })
    }

    const totalPages = Math.ceil(count / parseInt(limit))

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.is_verified,
          isActive: user.is_active,
          createdAt: user.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    })
  }
})

module.exports = router