-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'provider', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'cash', 'wallet');
CREATE TYPE provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE service_category AS ENUM ('cleaning', 'plumbing', 'electrical', 'painting', 'carpentry', 'gardening', 'appliance-repair', 'pest-control', 'moving', 'other');
CREATE TYPE price_type AS ENUM ('fixed', 'hourly', 'per-room', 'per-sqft');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role user_role DEFAULT 'user',
    avatar TEXT,
    address JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category service_category NOT NULL,
    subcategory VARCHAR(100),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    price_type price_type DEFAULT 'fixed',
    duration JSONB NOT NULL DEFAULT '{"estimated": 120, "minimum": 60}',
    images JSONB DEFAULT '[]',
    features TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    service_area JSONB DEFAULT '{}',
    rating JSONB DEFAULT '{"average": 0, "count": 0}',
    booking_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    seo JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    description TEXT,
    services UUID[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    documents JSONB DEFAULT '{}',
    service_area JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    pricing JSONB DEFAULT '{}',
    rating JSONB DEFAULT '{"average": 0, "count": 0}',
    stats JSONB DEFAULT '{}',
    earnings JSONB DEFAULT '{"total_earned": 0, "current_balance": 0}',
    bank_details JSONB DEFAULT '{}',
    status provider_status DEFAULT 'pending',
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_location JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    status booking_status DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INTEGER NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    address JSONB NOT NULL,
    pricing JSONB NOT NULL,
    payment JSONB DEFAULT '{}',
    customer_notes TEXT,
    provider_notes TEXT,
    images JSONB DEFAULT '[]',
    tracking JSONB DEFAULT '{}',
    review JSONB DEFAULT '{}',
    cancellation JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (for easier querying)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_rating ON services((rating->>'average'));
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_reviews_service_id ON reviews(service_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);

-- Create full-text search index for services
-- Note: We'll create this index after inserting data, or use a simpler approach
-- CREATE INDEX idx_services_search ON services USING gin(to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- Alternative: Create separate indexes for better performance
CREATE INDEX idx_services_name_search ON services USING gin(to_tsvector('english', name));
CREATE INDEX idx_services_description_search ON services USING gin(to_tsvector('english', description));

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking numbers
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := 'SX' || EXTRACT(EPOCH FROM NOW())::bigint || LPAD((SELECT COUNT(*) + 1 FROM bookings)::text, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for booking number generation
CREATE TRIGGER generate_booking_number_trigger BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Services are publicly readable
CREATE POLICY "Services are publicly readable" ON services FOR SELECT USING (is_active = true);

-- Providers can read/update their own data
CREATE POLICY "Providers can read own data" ON providers FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Providers can update own data" ON providers FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Bookings policies
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Providers can read assigned bookings" ON bookings FOR SELECT USING (auth.uid()::text IN (SELECT user_id::text FROM providers WHERE id = provider_id));
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Users can create reviews for their bookings" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);