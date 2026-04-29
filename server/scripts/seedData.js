const mongoose = require('mongoose')
require('dotenv').config()

const User = require('../models/User')
const Service = require('../models/Service')
const Provider = require('../models/Provider')
const Booking = require('../models/Booking')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servifyx')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

const seedUsers = async () => {
  const users = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'user',
      isVerified: true,
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
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+1234567891',
      role: 'user',
      isVerified: true,
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
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike@example.com',
      password: 'password123',
      phone: '+1234567892',
      role: 'provider',
      isVerified: true,
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
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@servifyx.com',
      password: 'admin123',
      phone: '+1234567893',
      role: 'admin',
      isVerified: true
    }
  ]

  await User.deleteMany({})
  const createdUsers = await User.insertMany(users)
  console.log('✅ Users seeded')
  return createdUsers
}

const seedServices = async () => {
  const services = [
    {
      name: 'Deep House Cleaning',
      description: 'Comprehensive deep cleaning service for your entire home. Includes kitchen, bathrooms, bedrooms, and living areas.',
      category: 'cleaning',
      subcategory: 'deep-cleaning',
      basePrice: 120,
      priceType: 'fixed',
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
      serviceArea: {
        cities: ['New York', 'Brooklyn', 'Queens'],
        radius: 25,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      rating: { average: 4.8, count: 156 },
      bookingCount: 156,
      tags: ['cleaning', 'deep-clean', 'house', 'sanitization']
    },
    {
      name: 'Plumbing Repair Service',
      description: 'Professional plumbing repairs and installations. Licensed plumbers available for emergency and scheduled services.',
      category: 'plumbing',
      subcategory: 'repair',
      basePrice: 150,
      priceType: 'hourly',
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
      serviceArea: {
        cities: ['New York', 'Brooklyn', 'Queens', 'Manhattan'],
        radius: 30,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      rating: { average: 4.9, count: 89 },
      bookingCount: 89,
      tags: ['plumbing', 'repair', 'emergency', 'licensed']
    },
    {
      name: 'Electrical Installation & Repair',
      description: 'Certified electricians for all your electrical needs. From simple repairs to complete installations.',
      category: 'electrical',
      subcategory: 'installation',
      basePrice: 180,
      priceType: 'hourly',
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
      serviceArea: {
        cities: ['Los Angeles', 'Beverly Hills', 'Santa Monica'],
        radius: 20,
        coordinates: { lat: 34.0522, lng: -118.2437 }
      },
      rating: { average: 4.7, count: 67 },
      bookingCount: 67,
      tags: ['electrical', 'installation', 'repair', 'certified']
    },
    {
      name: 'Interior Painting Service',
      description: 'Professional interior painting with premium paints. Transform your space with expert painters.',
      category: 'painting',
      subcategory: 'interior',
      basePrice: 200,
      priceType: 'per-room',
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
      serviceArea: {
        cities: ['Chicago', 'Evanston', 'Oak Park'],
        radius: 15,
        coordinates: { lat: 41.8781, lng: -87.6298 }
      },
      rating: { average: 4.6, count: 43 },
      bookingCount: 43,
      tags: ['painting', 'interior', 'premium', 'consultation']
    }
  ]

  await Service.deleteMany({})
  const createdServices = await Service.insertMany(services)
  console.log('✅ Services seeded')
  return createdServices
}

const seedProviders = async (users) => {
  const providerUser = users.find(u => u.role === 'provider')
  
  const provider = {
    user: providerUser._id,
    businessName: 'Mike\'s Home Services',
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
        issuedDate: new Date('2015-01-01'),
        expiryDate: new Date('2025-01-01')
      }
    ],
    documents: {
      license: {
        number: 'PL123456',
        issuedBy: 'State of Illinois',
        expiryDate: new Date('2025-01-01'),
        verified: true
      },
      insurance: {
        provider: 'State Farm',
        policyNumber: 'SF789012',
        expiryDate: new Date('2024-12-31'),
        verified: true
      },
      backgroundCheck: {
        provider: 'CheckrPro',
        completedDate: new Date('2023-01-01'),
        status: 'passed'
      }
    },
    serviceArea: {
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
    isOnline: true,
    currentLocation: { lat: 41.8781, lng: -87.6298, updatedAt: new Date() }
  }

  await Provider.deleteMany({})
  const createdProvider = await Provider.create(provider)
  console.log('✅ Provider seeded')
  return createdProvider
}

const seedBookings = async (users, services, provider) => {
  const userCustomer = users.find(u => u.role === 'user')
  const cleaningService = services.find(s => s.category === 'cleaning')
  
  const bookings = [
    {
      user: userCustomer._id,
      service: cleaningService._id,
      provider: provider._id,
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '10:00',
      estimatedDuration: 180,
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
        paidAt: new Date()
      },
      customerNotes: 'Please focus on the kitchen and bathrooms',
      status: 'confirmed'
    }
  ]

  await Booking.deleteMany({})
  const createdBookings = await Booking.insertMany(bookings)
  console.log('✅ Bookings seeded')
  return createdBookings
}

const seedDatabase = async () => {
  try {
    await connectDB()
    
    console.log('🌱 Starting database seeding...')
    
    const users = await seedUsers()
    const services = await seedServices()
    const provider = await seedProviders(users)
    const bookings = await seedBookings(users, services, provider)
    
    console.log('✅ Database seeding completed successfully!')
    console.log(`Created:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${services.length} services`)
    console.log(`- 1 provider`)
    console.log(`- ${bookings.length} bookings`)
    
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