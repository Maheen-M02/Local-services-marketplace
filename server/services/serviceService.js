const supabase = require('../config/supabase')

class ServiceService {
  async getAllServices(filters = {}) {
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
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder === 'asc' ? true : false
    query = query.order(sortBy, { ascending: sortOrder })

    // Apply pagination
    const page = parseInt(filters.page) || 1
    const limit = parseInt(filters.limit) || 12
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return {
      services: data || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    }
  }

  async getServiceById(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async getServiceCategories() {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true)

    if (error) {
      throw new Error(error.message)
    }

    // Count services by category
    const categoryCounts = {}
    data.forEach(service => {
      categoryCounts[service.category] = (categoryCounts[service.category] || 0) + 1
    })

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

    return categoryList.map(cat => ({
      ...cat,
      count: categoryCounts[cat.name] || 0
    }))
  }

  async searchServices(query, limit = 10) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, category, base_price, rating_average, images')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  }

  async getSimilarServices(serviceId, category, limit = 4) {
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

    return data || []
  }

  async createService(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async updateService(id, updates) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async updateServiceRating(serviceId, newRating) {
    // This is handled by database triggers, but we can also do it manually
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('service_id', serviceId)

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length
      
      await supabase
        .from('services')
        .update({
          rating_average: Math.round(averageRating * 10) / 10,
          rating_count: reviews.length
        })
        .eq('id', serviceId)
    }
  }
}

module.exports = new ServiceService()