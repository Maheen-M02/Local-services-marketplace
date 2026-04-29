const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Supabase/PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Resource already exists'
        })
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referenced resource not found'
        })
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field missing'
        })
      case '23514': // Check violation
        return res.status(400).json({
          success: false,
          message: 'Invalid data format'
        })
    }
  }

  // Supabase API errors
  if (err.message && err.message.includes('JWT')) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }

  // Validation errors (express-validator)
  if (err.array && typeof err.array === 'function') {
    const errors = err.array()
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler