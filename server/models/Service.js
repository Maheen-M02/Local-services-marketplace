const supabase = require('../config/supabase')

class Service {
  constructor(data) {
    Object.assign(this, data)
  }

  static async create(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return new Service(data)
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? new Service(data) : null
  }

  static async getAll(filters = {}) {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.minPrice) {
      query = query.gte('base_price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('base_price', filters.maxPrice)
    }

    if (filters.rating) {
      query = query.gte('rating_average', filters.rating)
    }

    if (filters.search) {
      query = query.textSearch('name,description', filters.search)
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(sortBy, sortOrder)

    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data.map(service => new Service(service))
  }

  static async count(filters = {}) {
    let query = supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.minPrice) {
      query = query.gte('base_price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('base_price', filters.maxPrice)
    }

    if (filters.rating) {
      query = query.gte('rating_average', filters.rating)
    }

    if (filters.search) {
      query = query.textSearch('name,description', filters.search)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return count
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true)

    if (error) {
      throw new Error(error.message)
    }

    // Count services per category
    const categoryCount = data.reduce((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1
      return acc
    }, {})

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category,
      count
    }))
  }

  static async search(searchQuery, limit = 10) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, category, base_price, rating_average, images')
      .eq('is_active', true)
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return data.map(service => new Service(service))
  }

  static async getSimilar(serviceId, category, limit = 4) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, base_price, rating_average, images, category')
      .eq('category', category)
      .eq('is_active', true)
      .neq('id', serviceId)
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return data.map(service => new Service(service))
  }

  async updateRating(newRating) {
    const totalRating = (this.rating_average * this.rating_count) + newRating
    const newCount = this.rating_count + 1
    const newAverage = Math.round((totalRating / newCount) * 10) / 10

    const { data, error } = await supabase
      .from('services')
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

  async incrementBookingCount() {
    const { data, error } = await supabase
      .from('services')
      .update({
        booking_count: this.booking_count + 1
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

  // Virtual for primary image
  get primaryImage() {
    if (!this.images || this.images.length === 0) return null
    const primary = this.images.find(img => img.isPrimary)
    return primary || this.images[0] || null
  }

  toJSON() {
    return {
      ...this,
      primaryImage: this.primaryImage
    }
  }
}

module.exports = Service