const bcrypt = require('bcryptjs')
require('dotenv').config()

const { supabaseAdmin } = require('../config/supabase')

const seedUsers = async () => {
  console.log('🌱 Seeding users...')
  
  const users = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'user',
      is_verified: true,
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+1234567891',
      role: 'user',
      is_verified: true,
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
        coordinates: { lat: 34.0522, lng: -118.2437 }
      }
    },
    {
      first_name: 'Mike',
      last_name: 'Johnson',
      email: 'mike@example.com',
      password: 'password123',
      phone: '+1234567892',
      role: 'provider',
      is_verified: true,
      address: {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'US',
        coordinates: { lat: 41.8781, lng: -87.6298 }
      }
    },
    {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@servifyx.com',
      password: 'admin123',
      phone: '+1234567893',
      role: 'admin',
      is_verified: true
    }
  ]

  // Hash passwords and insert users
  const hashedUsers = await Promise.all(
    users.map(async (user) => {
      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(user.password, salt)
      
      return {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password_hash: passwordHash,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        address: user.address || {}
      }
    })
  )

  const { data: createdUsers, error } = await supabaseAdmin
    .from('users')
    .insert(hashedUsers)
    .select()

  if (error) {
    console.error('Error seeding users:', error)
    throw error
  }

  console.log(`✅ Created ${createdUsers.length} users`)
  return createdUsers
}

const seedServices = async () => {
  console.log('🌱 Seeding services...')
  
  const services = [
    {
      name: 'Deep House Cleaning',
      description: 'Comprehensive deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, and living areas.',
      category: 'cleaning',
      subcategory: 'deep-cleaning',
      base_price: 120.00,
      price_type: 'fixed',
      duration: { estimated: 180, minimum: 120 },
      images: [
        { url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500', alt: 'House cleaning', isPrimary: true }
      ],
      features: ['All rooms cleaned', 'Kitchen deep clean', 'Bathroom sanitization', 'Vacuum and mop'],
      requirements: ['Access to all rooms', 'Basic cleaning supplies provided'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        timeSlots: [{ start: '08:00', end: '18:00' }]
      },
      service_area: {
        cities: ['New York', 'Brooklyn', 'Queens'],
        radius: 25,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      rating: { average: 4.8, count: 156 },
      booking_count: 156,
      tags: ['cleaning', 'deep-clean', 'house', 'sanitization']
    },
    {
      name: 'Plumbing Repair Service',
      description: 'Professional plumbing repairs and installations. Licensed plumbers available for emergency and scheduled services.',
      category: 'plumbing',
      subcategory: 'repair',
      base_price: 150.00,
      price_type: 'hourly',
      duration: { estimated: 120, minimum: 60 },
      images: [
        { url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500', alt: 'Plumbing repair', isPrimary: true }
      ],
      features: ['Licensed plumber', 'Emergency service', 'Parts included', '1-year warranty'],
      requirements: ['Access to plumbing area', 'Water shut-off knowledge'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        timeSlots: [{ start: '07:00', end: '20:00' }]
      },
      service_area: {
        cities: ['New York', 'Brooklyn', 'Queens', 'Manhattan'],
        radius: 30,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      rating: { average: 4.9, count: 89 },
      booking_count: 89,
      tags: ['plumbing', 'repair', 'emergency', 'licensed']
    },
    {
      name: 'Electrical Installation & Repair',
      description: 'Certified electricians for all your electrical needs. From simple repairs to complete installations.',
      category: 'electrical',
      subcategory: 'installation',
      base_price: 180.00,
      price_type: 'hourly',
      duration: { estimated: 90, minimum: 60 },
      images: [
        { url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500', alt: 'Electrical work', isPrimary: true }
      ],
      features: ['Certified electrician', 'Safety inspection', 'Code compliance', 'Emergency service'],
      requirements: ['Access to electrical panel', 'Clear work area'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        timeSlots: [{ start: '08:00', end: '17:00' }]
      },
      service_area: {
        cities: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
        radius: 20,
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      rating: { average: 4.7, count: 67 },
      booking_count: 67,
      tags: ['electrical', 'installation', 'repair', 'certified']
    },
    {
      name: 'Interior Painting Service',
      description: 'Professional interior painting with premium paints. Transform your space with expert painters.',
      category: 'painting',
      subcategory: 'interior',
      base_price: 200.00,
      price_type: 'per-room',
      duration: { estimated: 480, minimum: 240 },
      images: [
        { url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500', alt: 'Interior painting', isPrimary: true }
      ],
      features: ['Premium paint included', 'Color consultation', 'Furniture protection', 'Clean-up included'],
      requirements: ['Room preparation', 'Furniture moved'],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: [{ start: '08:00', end: '16:00' }]
      },
      service_area: {
        cities: ['Chicago', 'Evanston', 'Oak Park'],
        radius: 15,
        coordinates: { lat: 41.8781, lng: -87.6298 }
      },
      rating: { average: 4.6, count: 43 },
      booking_count: 43,
      tags: ['painting', 'interior', 'premium', 'consultation']
    }
  ]

  const { data: createdServices, error } = await supabaseAdmin
    .from('services')
    .insert(services)
    .select()

  if (error) {
    console.error('Error seeding services:', error)
    throw error
  }

  console.log(`✅ Created ${createdServices.length} services`)
  return createdServices
}

const seedProviders = async (users) => {
  console.log('🌱 Seeding providers...')
  
  const providerUser = users.find(u => u.role === 'provider')
  
  const provider = {
    user_id: providerUser.id,
    business_name: 'Mike\'s Home Services',
    description: 'Professional home services with over 10 years of experience. Specializing in plumbing and electrical work.',
    specializations: ['Plumbing', 'Electrical', 'General Repairs'],
    experience: {
      years: 10,
      description: 'Certified plumber and electrician with extensive residential experience'
    },
    certifications: [
      {
        name: 'Master Plumber License',
        issuedBy: 'State of Illinois',
        issuedDate: '2015-01-01',
        expiryDate: '2025-01-01'
      }
    ],
    documents: {
      license: {
        number: 'PL123456',
        issuedBy: 'State of Illinois',
        expiryDate: '2025-01-01',
        verified: true
      },
      insurance: {
        provider: 'State Farm',
        policyNumber: 'SF789012',
        expiryDate: '2024-12-31',
        verified: true
      },
      backgroundCheck: {
        provider: 'CheckrPro',
        completedDate: '2023-01-01',
        status: 'passed'
      }
    },
    service_area: {
      cities: ['Chicago', 'Evanston', 'Oak Park'],
      radius: 25,
      coordinates: { lat: 41.8781, lng: -87.6298 }
    },
    availability: {
      schedule: [
        {
          day: 'monday',
          isAvailable: true,
          timeSlots: [{ start: '08:00', end: '17:00', isBooked: false }]
        },
        {
          day: 'tuesday',
          isAvailable: true,
          timeSlots: [{ start: '08:00', end: '17:00', isBooked: false }]
        },
        {
          day: 'wednesday',
          isAvailable: true,
          timeSlots: [{ start: '08:00', end: '17:00', isBooked: false }]
        },
        {
          day: 'thursday',
          isAvailable: true,
          timeSlots: [{ start: '08:00', end: '17:00', isBooked: false }]
        },
        {
          day: 'friday',
          isAvailable: true,
          timeSlots: [{ start: '08:00', end: '17:00', isBooked: false }]
        },
        {
          day: 'saturday',
          isAvailable: true,
          timeSlots: [{ start: '09:00', end: '15:00', isBooked: false }]
        }
      ]
    },
    pricing: {
      hourlyRate: 75,
      minimumCharge: 100,
      travelFee: 25,
      emergencyRate: 125
    },
    rating: { average: 4.8, count: 45 },
    stats: {
      totalBookings: 50,
      completedBookings: 45,
      cancelledBookings: 2,
      responseTime: 15,
      onTimePercentage: 96
    },
    earnings: {
      totalEarned: 15000,
      currentBalance: 2500
    },
    status: 'approved',
    is_online: true,
    current_location: { lat: 41.8781, lng: -87.6298, updatedAt: new Date().toISOString() }
  }

  const { data: createdProvider, error } = await supabaseAdmin
    .from('providers')
    .insert([provider])
    .select()
    .single()

  if (error) {
    console.error('Error seeding provider:', error)
    throw error
  }

  console.log('✅ Created 1 provider')
  return createdProvider
}

const seedBookings = async (users, services, provider) => {
  console.log('🌱 Seeding bookings...')
  
  const userCustomer = users.find(u => u.role === 'user')
  const cleaningService = services.find(s => s.category === 'cleaning')
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const booking = {
    user_id: userCustomer.id,
    service_id: cleaningService.id,
    provider_id: provider.id,
    scheduled_date: tomorrow.toISOString().split('T')[0],
    scheduled_time: '10:00',
    estimated_duration: 180,
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      instructions: 'Ring doorbell twice'
    },
    pricing: {
      baseAmount: 120,
      tax: 9.6,
      totalAmount: 129.6
    },
    payment: {
      method: 'card',
      status: 'paid',
      transactionId: 'txn_123456789',
      paidAt: new Date().toISOString()
    },
    customer_notes: 'Please focus on the kitchen and bathrooms',
    status: 'confirmed'
  }

  const { data: createdBooking, error } = await supabaseAdmin
    .from('bookings')
    .insert([booking])
    .select()
    .single()

  if (error) {
    console.error('Error seeding booking:', error)
    throw error
  }

  console.log('✅ Created 1 booking')
  return createdBooking
}

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Supabase database seeding...')
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...')
    await supabaseAdmin.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const users = await seedUsers()
    const services = await seedServices()
    const provider = await seedProviders(users)
    const booking = await seedBookings(users, services, provider)
    
    console.log('✅ Supabase database seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${services.length} services`)
    console.log(`- 1 provider`)
    console.log(`- 1 booking`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }