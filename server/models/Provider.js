const supabase = require('../config/supabase')

class Provider {
  constructor(data) {
    Object.assign(this, data)
  }

  static async create(providerData) {
    const { data, error } = await supabase
      .from('providers')
      .insert([providerData])
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return new Provider(data)
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? new Provider(data) : null
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        user:users(*)
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? new Provider(data) : null
  }

  static async getAll(filters = {}) {
    let query = supabase
      .from('providers')
      .select(`
        *,
        user:users(id, first_name, last_name, avatar_url)
      `)

    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      // Default to approved providers for public listing
      query = query.eq('status', 'approved')
    }

    if (filters.isOnline !== undefined) {
      query = query.eq('is_online', filters.isOnline)
    }

    if (filters.services && filters.services.length > 0) {
      query = query.overlaps('services', filters.services)
    }

    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('rating_average', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(provider => new Provider(provider))
  }

  static async count(filters = {}) {
    let query = supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.isOnline !== undefined) {
      query = query.eq('is_online', filters.isOnline)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return count
  }

  static async getNearby(lat, lng, radiusKm = 25, limit = 10) {
    // Using PostGIS for location-based queries
    const { data, error } = await supabase
      .rpc('get_nearby_providers', {
        lat,
        lng,
        radius_km: radiusKm,
        result_limit: limit
      })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(provider => new Provider(provider))
  }

  async updateRating(newRating) {
    const totalRating = (this.rating_average * this.rating_count) + newRating
    const newCount = this.rating_count + 1
    const newAverage = Math.round((totalRating / newCount) * 10) / 10

    const { data, error } = await supabase
      .from('providers')
      .update({
        rating_average: newAverage,
        rating_count: newCount
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

  async updateLocation(lat, lng) {
    const { data, error } = await supabase
      .from('providers')
      .update({
        current_location: `POINT(${lng} ${lat})`,
        last_seen: new Date().toISOString()
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

  async updateOnlineStatus(isOnline) {
    const { data, error } = await supabase
      .from('providers')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
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

  async updateStatus(newStatus) {
    const { data, error } = await supabase
      .from('providers')
      .update({ status: newStatus })
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  async updateStats(statsUpdate) {
    const newStats = {
      ...this.stats,
      ...statsUpdate
    }

    const { data, error } = await supabase
      .from('providers')
      .update({ stats: newStats })
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  async updateEarnings(earningsUpdate) {
    const newEarnings = {
      ...this.earnings,
      ...earningsUpdate
    }

    const { data, error } = await supabase
      .from('providers')
      .update({ earnings: newEarnings })
      .eq('id', this.id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    Object.assign(this, data)
    return this
  }

  isAvailableAt(date, time) {
    if (!this.availability || !this.availability.schedule) {
      return false
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const daySchedule = this.availability.schedule.find(s => s.day === dayName)
    
    if (!daySchedule || !daySchedule.is_available) {
      return false
    }
    
    // Check if time falls within available slots
    return daySchedule.time_slots && daySchedule.time_slots.some(slot => {
      return time >= slot.start && time <= slot.end && !slot.is_booked
    })
  }

  // Virtual for completion rate
  get completionRate() {
    if (!this.stats || this.stats.total_bookings === 0) return 100
    return Math.round((this.stats.completed_bookings / this.stats.total_bookings) * 100)
  }

  toJSON() {
    return {
      ...this,
      completionRate: this.completionRate
    }
  }
}

module.exports = Provider