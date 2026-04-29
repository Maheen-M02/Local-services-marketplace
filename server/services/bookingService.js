const supabase = require('../config/supabase')

class BookingService {
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select(`
        *,
        service:services(*),
        user:profiles(*),
        provider:providers(*)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getBookingById(id) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        user:profiles(*),
        provider:providers(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getBookingsByUser(userId, filters = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        provider:providers(*)
      `)
      .eq('user_id', userId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const page = parseInt(filters.page) || 1
    const limit = parseInt(filters.limit) || 10
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Get total count
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      bookings: data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    }
  }

  async getBookingsByProvider(providerId, filters = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        user:profiles(*)
      `)
      .eq('provider_id', providerId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async updateBookingStatus(id, status, updatedBy = null) {
    const updates = { status }

    // Set specific timestamps based on status
    switch (status) {
      case 'in-progress':
        updates.actual_start_time = new Date().toISOString()
        break
      case 'completed':
        updates.actual_end_time = new Date().toISOString()
        break
      case 'cancelled':
        updates.cancellation = {
          cancelled_by: updatedBy,
          cancelled_at: new Date().toISOString(),
          reason: 'Cancelled by ' + updatedBy
        }
        break
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        service:services(*),
        user:profiles(*),
        provider:providers(*)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async addBookingReview(bookingId, userId, reviewData) {
    const { rating, comment } = reviewData

    // First, update the booking with review data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({
        review: {
          rating,
          comment,
          reviewed_at: new Date().toISOString()
        }
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('service_id, provider_id')
      .single()

    if (bookingError) {
      throw new Error(bookingError.message)
    }

    // Then, create a review record
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        user_id: userId,
        service_id: booking.service_id,
        provider_id: booking.provider_id,
        rating,
        comment
      })
      .select()
      .single()

    if (reviewError) {
      throw new Error(reviewError.message)
    }

    return review
  }

  async getBookingsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(*),
        user:profiles(*),
        provider:providers(*)
      `)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async updateBookingLocation(bookingId, location) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        tracking: {
          provider_location: {
            lat: location.lat,
            lng: location.lng,
            updated_at: new Date().toISOString()
          }
        }
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }
}

module.exports = new BookingService()