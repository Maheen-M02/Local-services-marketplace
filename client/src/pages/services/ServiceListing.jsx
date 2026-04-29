
import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Star, Clock, Grid, List,
  SlidersHorizontal, Home, Wrench, Zap,
  Paintbrush, Hammer, Leaf, Bug, Truck, Settings
} from 'lucide-react'
import { servicesAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

/* ── Mock services (shown when API returns empty) ───────────────────────────── */
const MOCK_SERVICES = [
  {
    _id: 'svc-001', id: 'svc-001',
    name: 'Deep Home Cleaning',
    description: 'Full deep-clean of your entire home by certified professionals. Includes kitchen, bathrooms, bedrooms, and living areas.',
    category: 'cleaning', priceType: 'fixed',
    basePrice: 89, duration: { estimated: 180 },
    rating: { average: 4.9, count: 312 },
    images: [{ url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' }],
    features: ['All rooms cleaned', 'Eco-friendly products', 'Insured professionals', 'Satisfaction guarantee'],
    requirements: ['Clear access to all rooms', 'Pets secured during service'],
    serviceArea: { radius: 25 },
  },
  {
    _id: 'svc-002', id: 'svc-002',
    name: 'Plumbing Repair & Installation',
    description: 'Expert plumbing services — leak repairs, pipe installations, drain cleaning, and fixture replacements.',
    category: 'plumbing', priceType: 'hourly',
    basePrice: 99, duration: { estimated: 120 },
    rating: { average: 4.8, count: 198 },
    images: [{ url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80' }],
    features: ['Licensed plumbers', 'Same-day service', 'Parts included', '90-day warranty'],
    requirements: ['Water shutoff accessible', 'Clear workspace around fixtures'],
    serviceArea: { radius: 20 },
  },
  {
    _id: 'svc-003', id: 'svc-003',
    name: 'Electrical Safety Check',
    description: 'Licensed electricians inspect your home wiring, panel, outlets, and fixtures. Repairs and upgrades available.',
    category: 'electrical', priceType: 'fixed',
    basePrice: 149, duration: { estimated: 150 },
    rating: { average: 4.9, count: 145 },
    images: [{ url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80' }],
    features: ['Full panel inspection', 'Outlet testing', 'Safety report', 'Code compliance check'],
    requirements: ['Access to electrical panel', 'Adult present during service'],
    serviceArea: { radius: 30 },
  },
  {
    _id: 'svc-004', id: 'svc-004',
    name: 'Interior Painting',
    description: 'Professional interior painting for any room. We handle prep, priming, painting, and cleanup.',
    category: 'painting', priceType: 'per-room',
    basePrice: 199, duration: { estimated: 300 },
    rating: { average: 4.7, count: 89 },
    images: [{ url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&q=80' }],
    features: ['Premium paints', 'Furniture protection', 'Clean edges', 'Same-day dry'],
    requirements: ['Furniture moved or covered', 'Good ventilation available'],
    serviceArea: { radius: 20 },
  },
  {
    _id: 'svc-005', id: 'svc-005',
    name: 'Carpentry & Furniture Assembly',
    description: 'Custom carpentry, furniture assembly, shelving installation, and minor woodwork repairs.',
    category: 'carpentry', priceType: 'hourly',
    basePrice: 79, duration: { estimated: 120 },
    rating: { average: 4.8, count: 203 },
    images: [{ url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80' }],
    features: ['All tools provided', 'Flat-pack assembly', 'Custom shelving', 'Minor repairs'],
    requirements: ['Parts and hardware available', 'Clear workspace'],
    serviceArea: { radius: 25 },
  },
  {
    _id: 'svc-006', id: 'svc-006',
    name: 'Garden & Lawn Maintenance',
    description: 'Complete garden care — mowing, trimming, weeding, planting, and seasonal cleanup.',
    category: 'gardening', priceType: 'fixed',
    basePrice: 69, duration: { estimated: 120 },
    rating: { average: 4.6, count: 167 },
    images: [{ url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80' }],
    features: ['Lawn mowing', 'Edge trimming', 'Weed removal', 'Seasonal planting'],
    requirements: ['Gate access to garden', 'Water source available'],
    serviceArea: { radius: 15 },
  },
  {
    _id: 'svc-007', id: 'svc-007',
    name: 'Appliance Repair',
    description: 'Fast repair for washing machines, dryers, dishwashers, ovens, fridges, and more.',
    category: 'appliance-repair', priceType: 'fixed',
    basePrice: 119, duration: { estimated: 90 },
    rating: { average: 4.8, count: 241 },
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' }],
    features: ['All major brands', 'Parts on hand', 'Diagnostic included', '6-month warranty'],
    requirements: ['Appliance accessible', 'Model number ready'],
    serviceArea: { radius: 20 },
  },
  {
    _id: 'svc-008', id: 'svc-008',
    name: 'Pest Control Treatment',
    description: 'Safe and effective pest control for ants, cockroaches, rodents, bed bugs, and more.',
    category: 'pest-control', priceType: 'fixed',
    basePrice: 129, duration: { estimated: 90 },
    rating: { average: 4.7, count: 118 },
    images: [{ url: 'https://images.unsplash.com/photo-1632923057155-dd35366009b5?w=600&q=80' }],
    features: ['Child & pet safe', 'Guaranteed results', 'Follow-up visit', 'Preventive treatment'],
    requirements: ['Vacate for 2 hours post-treatment', 'Food stored away'],
    serviceArea: { radius: 30 },
  },
  {
    _id: 'svc-009', id: 'svc-009',
    name: 'Home Moving Service',
    description: 'Professional movers for local and long-distance moves. Packing, loading, transport, and unpacking.',
    category: 'moving', priceType: 'hourly',
    basePrice: 149, duration: { estimated: 240 },
    rating: { average: 4.6, count: 94 },
    images: [{ url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&q=80' }],
    features: ['Packing materials', 'Furniture disassembly', 'Insurance covered', 'On-time guarantee'],
    requirements: ['Parking available', 'Elevator access if applicable'],
    serviceArea: { radius: 50 },
  },
  {
    _id: 'svc-010', id: 'svc-010',
    name: 'HVAC Service & Repair',
    description: 'Air conditioning and heating system maintenance, repair, and installation by certified technicians.',
    category: 'other', priceType: 'fixed',
    basePrice: 179, duration: { estimated: 120 },
    rating: { average: 4.9, count: 156 },
    images: [{ url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' }],
    features: ['All HVAC brands', 'Filter replacement', 'Refrigerant check', 'Energy efficiency report'],
    requirements: ['Access to outdoor unit', 'Thermostat accessible'],
    serviceArea: { radius: 25 },
  },
  {
    _id: 'svc-011', id: 'svc-011',
    name: 'Window & Gutter Cleaning',
    description: 'Streak-free window cleaning inside and out, plus full gutter clearing and flush.',
    category: 'cleaning', priceType: 'fixed',
    basePrice: 79, duration: { estimated: 150 },
    rating: { average: 4.8, count: 187 },
    images: [{ url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80' }],
    features: ['Inside & outside windows', 'Gutter flush', 'Streak-free finish', 'Ladder work included'],
    requirements: ['Safe ladder access', 'Pets secured'],
    serviceArea: { radius: 20 },
  },
  {
    _id: 'svc-012', id: 'svc-012',
    name: 'Exterior Painting',
    description: 'Full exterior painting including walls, trim, doors, and fences. Weather-resistant paints used.',
    category: 'painting', priceType: 'fixed',
    basePrice: 349, duration: { estimated: 480 },
    rating: { average: 4.7, count: 62 },
    images: [{ url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80' }],
    features: ['Weather-resistant paint', 'Surface prep included', 'Masking & protection', '2-year warranty'],
    requirements: ['Clear perimeter access', 'Dry weather forecast'],
    serviceArea: { radius: 15 },
  },
]

const MOCK_CATEGORIES = [
  { name: 'cleaning',       label: 'Cleaning',        count: 2 },
  { name: 'plumbing',       label: 'Plumbing',         count: 1 },
  { name: 'electrical',     label: 'Electrical',       count: 1 },
  { name: 'painting',       label: 'Painting',         count: 2 },
  { name: 'carpentry',      label: 'Carpentry',        count: 1 },
  { name: 'gardening',      label: 'Gardening',        count: 1 },
  { name: 'appliance-repair',label:'Appliance Repair', count: 1 },
  { name: 'pest-control',   label: 'Pest Control',     count: 1 },
  { name: 'moving',         label: 'Moving',           count: 1 },
  { name: 'other',          label: 'Other',            count: 1 },
]

const CAT_ICONS = {
  cleaning:        Home,
  plumbing:        Wrench,
  electrical:      Zap,
  painting:        Paintbrush,
  carpentry:       Hammer,
  gardening:       Leaf,
  'appliance-repair': Settings,
  'pest-control':  Bug,
  moving:          Truck,
  other:           Settings,
}

export default function ServiceListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [apiServices, setApiServices]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [viewMode, setViewMode]         = useState('grid')
  const [showFilters, setShowFilters]   = useState(false)

  const [searchQuery,      setSearchQuery]      = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [priceRange,       setPriceRange]       = useState([0, 500])
  const [minRating,        setMinRating]        = useState(0)
  const [sortBy,           setSortBy]           = useState('rating')
  const [currentPage,      setCurrentPage]      = useState(1)
  const PER_PAGE = 12

  /* Fetch from API, fall back to mock */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const params = { page: currentPage, limit: PER_PAGE, sortBy, sortOrder: 'desc' }
        if (selectedCategory) params.category = selectedCategory
        if (searchQuery)      params.search   = searchQuery
        const res = await servicesAPI.getAll(params)
        setApiServices(res.data?.services || [])
      } catch {
        setApiServices([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [searchParams, currentPage, sortBy])

  /* Derive displayed services — API if available, else filtered mock */
  const services = useMemo(() => {
    if (apiServices.length > 0) return apiServices

    let list = [...MOCK_SERVICES]

    if (selectedCategory) list = list.filter(s => s.category === selectedCategory)
    if (searchQuery)       list = list.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (priceRange[0] > 0)   list = list.filter(s => s.basePrice >= priceRange[0])
    if (priceRange[1] < 500) list = list.filter(s => s.basePrice <= priceRange[1])
    if (minRating > 0)       list = list.filter(s => (s.rating?.average || 0) >= minRating)

    if (sortBy === 'rating')       list.sort((a,b) => (b.rating?.average||0) - (a.rating?.average||0))
    else if (sortBy === 'basePrice') list.sort((a,b) => a.basePrice - b.basePrice)

    return list
  }, [apiServices, selectedCategory, searchQuery, priceRange, minRating, sortBy])

  const totalPages = Math.ceil(services.length / PER_PAGE)
  const paged      = apiServices.length > 0 ? services : services.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE)

  const handleSearch = (e) => {
    e.preventDefault()
    const p = new URLSearchParams(searchParams)
    searchQuery ? p.set('search', searchQuery) : p.delete('search')
    setSearchParams(p)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat)
    const p = new URLSearchParams(searchParams)
    cat ? p.set('category', cat) : p.delete('category')
    setSearchParams(p)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCategory(''); setPriceRange([0,500]); setMinRating(0)
    setSearchParams({}); setCurrentPage(1)
  }

  if (loading && services.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg"/></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Services</h1>
          <p className="text-gray-500">Find the perfect service for your home needs</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 text-base border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm bg-white"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">
                Search
              </Button>
            </div>
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCategoryFilter(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.name ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white text-sm"
              >
                <SlidersHorizontal className="w-4 h-4"/> Filters
              </button>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="basePrice">Price: Low to High</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode==='grid'?'bg-primary-100 text-primary-600':'text-gray-400 hover:text-gray-600'}`}>
                <Grid className="w-5 h-5"/>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode==='list'?'bg-primary-100 text-primary-600':'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-5 h-5"/>
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
              className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <input type="range" min="0" max="500" value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full"/>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>${priceRange[0]}</span><span>${priceRange[1]}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <Button onClick={() => { setCurrentPage(1); setShowFilters(false) }} className="flex-1">Apply</Button>
                  <Button variant="secondary" onClick={clearFilters}>Clear</Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results count */}
        {paged.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">{services.length} service{services.length !== 1 ? 's' : ''} found</p>
        )}

        {/* Grid / List */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}>
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg"/></div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {paged.map((service, index) => {
                const CatIcon = CAT_ICONS[service.category] || Settings
                return (
                  <motion.div key={service._id||service.id}
                    initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:index*0.04}}>
                    <Link to={`/services/${service._id||service.id}`}>
                      <Card className={`h-full group hover:-translate-y-1 transition-all duration-300 ${viewMode==='list'?'flex':''}`}>
                        <div className={viewMode==='list'?'flex w-full':''}>
                          {/* Image */}
                          <div className={`relative overflow-hidden ${viewMode==='list'?'w-48 flex-shrink-0 rounded-l-xl':'aspect-video rounded-t-xl'}`}>
                            <img
                              src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}
                              alt={service.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Category badge */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
                              <CatIcon className="w-3 h-3 text-primary-600"/>
                              <span className="text-xs font-medium text-gray-700 capitalize">{service.category.replace('-',' ')}</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className={`p-5 ${viewMode==='list'?'flex-1':''}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 text-base leading-tight">{service.name}</h3>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>
                                <span className="text-sm font-medium text-gray-700">{service.rating?.average||'4.8'}</span>
                                <span className="text-xs text-gray-400">({service.rating?.count||0})</span>
                              </div>
                            </div>

                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-primary-600">${service.basePrice}</span>
                                <span className="text-gray-400 text-xs ml-1">
                                  {service.priceType === 'hourly' ? '/hr' : service.priceType === 'per-room' ? '/room' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5"/>
                                <span>{Math.round((service.duration?.estimated||120)/60)}h</span>
                              </div>
                            </div>

                            {viewMode === 'list' && (
                              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400">{service.features?.[0]}</span>
                                <Button size="sm">Book Now</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button variant="secondary" disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}>Previous</Button>
            {[...Array(totalPages)].map((_,i) => (
              <button key={i+1} onClick={() => setCurrentPage(i+1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage===i+1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}>
                {i+1}
              </button>
            ))}
            <Button variant="secondary" disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}
