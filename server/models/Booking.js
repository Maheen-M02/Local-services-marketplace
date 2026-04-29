const supabase = require('../config/supabase')

class Booking {
  constructor(data) {
    Object.assign(this, data)
  }

  static async create(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        user:users(*),
        service:services(*),
        provider:providers(*)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return new Booking(data)
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users(id, first_name, last_name, phone, email),
        service:services(id, name, description, category, base_price, images),
        provider:providers(id, business_name, rating_average, current_location)
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? new Booking(data) : null
  }

  static async getByUser(userId, filters = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, description, category, base_price, images),
        provider:providers(id, business_name, rating_average)
      `)
      .eq('user_id', userId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(booking => new Booking(booking))
  }

  static async getByProvider(providerId, filters = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users(id, first_name, last_name, phone),
        service:services(id, name, description, category, base_price, images)
      `)
      .eq('provider_id', providerId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(booking => new Booking(booking))
  }

  static async getAll(filters = {}) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users(id, first_name, last_name, phone),
        service:services(id, name, description, category),
        provider:providers(id, business_name)
      `)

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(booking => new Booking(booking))
  }

  static async count(filters = {}) {
    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.providerId) {
      query = query.eq('provider_id', filters.providerId)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return count
  }

  async updateStatus(newStatus, updatedBy = null) {
    const updates = { status: newStatus }

    // Set specific timestamps based on status
    switch (newStatus) {
      case 'in-progress':
        updates.actual_start_time = new Date().toISOString()
        break
      case 'completed':
        updates.actual_end_time = new Date().toISOString()
        break
      case 'cancelled':
        updates.cancellation = {
          ...this.cancellation,
          cancelled_by: updatedBy,
          cancelled_at: new Date().toISOString()
        }
        break
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  async addReview(reviewData) {
    const { rating, comment } = reviewData

    // Update booking with review
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .update({
        review: {
          rating,
          comment,
          reviewed_at: new Date().toISOString()
        }
      })
      .eq('id', this.id)
      .select()
      .single()

    if (bookingError) {
      throw new Error(bookingError.message)
    }

    // Create separate review record
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert([{
        booking_id: this.id,
        user_id: this.user_id,
        provider_id: this.provider_id,
        service_id: this.service_id,
        rating,
        comment
      }])

    if (reviewError) {
      throw new Error(reviewError.message)
    }

    Object.assign(this, bookingData)
    return this
  }

  async assignProvider(providerId) {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        provider_id: providerId,
        status: 'assigned'
      })
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  async updateLocation(location) {
    const tracking = {
      ...this.tracking,
      provider_location: {
        lat: location.lat,
        lng: location.lng,
        updated_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ tracking })
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  // Virtual for actual duration
  get actualDuration() {
    if (this.actual_start_time && this.actual_end_time) {
      const start = new Date(this.actual_start_time)
      const end = new Date(this.actual_end_time)
      return Math.round((end - start) / (1000 * 60)) // in minutes
    }
    return null
  }

  toJSON() {
    return {
      ...this,
      actualDuration: this.actualDuration
    }
  }
}

module.exports = Booking