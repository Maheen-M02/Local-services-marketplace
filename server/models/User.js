const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')

class User {
  constructor(data) {
    Object.assign(this, data)
  }

  static async create(userData) {
    const { email, password, firstName, lastName, phone, role = 'user' } = userData

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
        role
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return new User(data)
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(error.message)
    }

    return data ? new User(data) : null
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? new User(data) : null
  }

  static async updateById(id, updates) {
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    )

    const { data, error } = await supabase
      .from('users')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return new User(data)
  }

  static async updateLastLogin(id) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash)
  }

  async updatePassword(newPassword) {
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(newPassword, saltRounds)

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', this.id)

    if (error) {
      throw new Error(error.message)
    }

    this.password_hash = passwordHash
  }

  // Virtual properties
  get name() {
    return `${this.first_name} ${this.last_name}`
  }

  // Remove sensitive data when converting to JSON
  toJSON() {
    const { password_hash, ...user } = this
    return {
      ...user,
      name: this.name
    }
  }

  // Static methods for admin operations
  static async getAll(filters = {}) {
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true)

    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data.map(user => new User(user))
  }

  static async count(filters = {}) {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (filters.role) {
      query = query.eq('role', filters.role)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return count
  }
}

module.exports = User