const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')

class UserService {
  async createUser(userData) {
    const { email, password, firstName, lastName, phone, role = 'user' } = userData

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      throw new Error(authError.message)
    }

    // Create profile in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        is_verified: true
      })
      .select()
      .single()

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(profileError.message)
    }

    return {
      id: profile.id,
      email: authData.user.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      role: profile.role,
      isVerified: profile.is_verified
    }
  }

  async getUserByEmail(email) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError || !authUser.user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single()

    if (profileError) {
      return null
    }

    return {
      id: profile.id,
      email: authUser.user.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      role: profile.role,
      avatar: profile.avatar_url,
      address: profile.address,
      isVerified: profile.is_verified,
      isActive: profile.is_active,
      preferences: profile.preferences,
      lastLogin: profile.last_login,
      createdAt: profile.created_at
    }
  }

  async getUserById(id) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    // Get email from auth.users
    const { data: authUser } = await supabase.auth.admin.getUserById(id)

    return {
      id: profile.id,
      email: authUser?.user?.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      phone: profile.phone,
      role: profile.role,
      avatar: profile.avatar_url,
      address: profile.address,
      isVerified: profile.is_verified,
      isActive: profile.is_active,
      preferences: profile.preferences,
      lastLogin: profile.last_login,
      createdAt: profile.created_at
    }
  }

  async updateUser(id, updates) {
    const allowedUpdates = ['first_name', 'last_name', 'phone', 'address', 'preferences', 'avatar_url']
    const filteredUpdates = {}
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    })

    const { data, error } = await supabase
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async updateLastLogin(id) {
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating last login:', error)
    }
  }

  async verifyPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return false
    }

    // Sign out immediately as we're just verifying
    await supabase.auth.signOut()
    return true
  }

  async changePassword(id, newPassword) {
    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }

    return true
  }
}

module.exports = new UserService()