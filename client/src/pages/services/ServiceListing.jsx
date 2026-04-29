
import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Star, Clock, Grid, List, SlidersHorizontal,
  Home, Wrench, Zap, Paintbrush, Hammer, Leaf, Bug,
  Truck, Settings, X, ChevronRight, ArrowRight, Shield,
  CheckCircle, Sparkles
} from 'lucide-react'
import { servicesAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

/* ── Mock data ──────────────────────────────────────────────────────────────── */
const MOCK_SERVICES = [
  { _id:'svc-001',id:'svc-001', name:'Deep Home Cleaning',            category:'cleaning',        priceType:'fixed',    basePrice:89,  duration:{estimated:180}, rating:{average:4.9,count:312}, images:[{url:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=700&q=80'}], features:['All rooms cleaned','Eco-friendly products','Insured professionals','Satisfaction guarantee'], description:'Full deep-clean of your entire home by certified professionals. Includes kitchen, bathrooms, bedrooms, and living areas.' },
  { _id:'svc-002',id:'svc-002', name:'Plumbing Repair & Installation', category:'plumbing',        priceType:'hourly',   basePrice:99,  duration:{estimated:120}, rating:{average:4.8,count:198}, images:[{url:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&q=80'}], features:['Licensed plumbers','Same-day service','Parts included','90-day warranty'], description:'Expert plumbing services — leak repairs, pipe installations, drain cleaning, and fixture replacements.' },
  { _id:'svc-003',id:'svc-003', name:'Electrical Safety Check',        category:'electrical',      priceType:'fixed',    basePrice:149, duration:{estimated:150}, rating:{average:4.9,count:145}, images:[{url:'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=700&q=80'}], features:['Full panel inspection','Outlet testing','Safety report','Code compliance check'], description:'Licensed electricians inspect your home wiring, panel, outlets, and fixtures. Repairs and upgrades available.' },
  { _id:'svc-004',id:'svc-004', name:'Interior Painting',              category:'painting',        priceType:'per-room', basePrice:199, duration:{estimated:300}, rating:{average:4.7,count:89},  images:[{url:'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=700&q=80'}], features:['Premium paints','Furniture protection','Clean edges','Same-day dry'], description:'Professional interior painting for any room. We handle prep, priming, painting, and cleanup.' },
  { _id:'svc-005',id:'svc-005', name:'Carpentry & Furniture Assembly', category:'carpentry',       priceType:'hourly',   basePrice:79,  duration:{estimated:120}, rating:{average:4.8,count:203}, images:[{url:'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=700&q=80'}], features:['All tools provided','Flat-pack assembly','Custom shelving','Minor repairs'], description:'Custom carpentry, furniture assembly, shelving installation, and minor woodwork repairs.' },
  { _id:'svc-006',id:'svc-006', name:'Garden & Lawn Maintenance',      category:'gardening',       priceType:'fixed',    basePrice:69,  duration:{estimated:120}, rating:{average:4.6,count:167}, images:[{url:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=80'}], features:['Lawn mowing','Edge trimming','Weed removal','Seasonal planting'], description:'Complete garden care — mowing, trimming, weeding, planting, and seasonal cleanup.' },
  { _id:'svc-007',id:'svc-007', name:'Appliance Repair',               category:'appliance-repair',priceType:'fixed',    basePrice:119, duration:{estimated:90},  rating:{average:4.8,count:241}, images:[{url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80'}], features:['All major brands','Parts on hand','Diagnostic included','6-month warranty'], description:'Fast repair for washing machines, dryers, dishwashers, ovens, fridges, and more.' },
  { _id:'svc-008',id:'svc-008', name:'Pest Control Treatment',         category:'pest-control',    priceType:'fixed',    basePrice:129, duration:{estimated:90},  rating:{average:4.7,count:118}, images:[{url:'https://images.unsplash.com/photo-1632923057155-dd35366009b5?w=700&q=80'}], features:['Child & pet safe','Guaranteed results','Follow-up visit','Preventive treatment'], description:'Safe and effective pest control for ants, cockroaches, rodents, bed bugs, and more.' },
  { _id:'svc-009',id:'svc-009', name:'Home Moving Service',            category:'moving',          priceType:'hourly',   basePrice:149, duration:{estimated:240}, rating:{average:4.6,count:94},  images:[{url:'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=700&q=80'}], features:['Packing materials','Furniture disassembly','Insurance covered','On-time guarantee'], description:'Professional movers for local and long-distance moves. Packing, loading, transport, and unpacking.' },
  { _id:'svc-010',id:'svc-010', name:'HVAC Service & Repair',          category:'other',           priceType:'fixed',    basePrice:179, duration:{estimated:120}, rating:{average:4.9,count:156}, images:[{url:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80'}], features:['All HVAC brands','Filter replacement','Refrigerant check','Energy efficiency report'], description:'Air conditioning and heating system maintenance, repair, and installation by certified technicians.' },
  { _id:'svc-011',id:'svc-011', name:'Window & Gutter Cleaning',       category:'cleaning',        priceType:'fixed',    basePrice:79,  duration:{estimated:150}, rating:{average:4.8,count:187}, images:[{url:'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=700&q=80'}], features:['Inside & outside windows','Gutter flush','Streak-free finish','Ladder work included'], description:'Streak-free window cleaning inside and out, plus full gutter clearing and flush.' },
  { _id:'svc-012',id:'svc-012', name:'Exterior Painting',              category:'painting',        priceType:'fixed',    basePrice:349, duration:{estimated:480}, rating:{average:4.7,count:62},  images:[{url:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=700&q=80'}], features:['Weather-resistant paint','Surface prep included','Masking & protection','2-year warranty'], description:'Full exterior painting including walls, trim, doors, and fences. Weather-resistant paints used.' },
]

const CATEGORIES = [
  { name:'',               label:'All',             Icon:Sparkles,  color:'#6366f1', bg:'#eef2ff' },
  { name:'cleaning',       label:'Cleaning',        Icon:Home,      color:'#0ea5e9', bg:'#e0f2fe' },
  { name:'plumbing',       label:'Plumbing',        Icon:Wrench,    color:'#10b981', bg:'#d1fae5' },
  { name:'electrical',     label:'Electrical',      Icon:Zap,       color:'#f59e0b', bg:'#fef3c7' },
  { name:'painting',       label:'Painting',        Icon:Paintbrush,color:'#8b5cf6', bg:'#ede9fe' },
  { name:'carpentry',      label:'Carpentry',       Icon:Hammer,    color:'#f97316', bg:'#ffedd5' },
  { name:'gardening',      label:'Gardening',       Icon:Leaf,      color:'#22c55e', bg:'#dcfce7' },
  { name:'appliance-repair',label:'Appliances',     Icon:Settings,  color:'#64748b', bg:'#f1f5f9' },
  { name:'pest-control',   label:'Pest Control',    Icon:Bug,       color:'#ef4444', bg:'#fee2e2' },
  { name:'moving',         label:'Moving',          Icon:Truck,     color:'#3b82f6', bg:'#dbeafe' },
  { name:'other',          label:'Other',           Icon:Settings,  color:'#6b7280', bg:'#f3f4f6' },
]

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.name, c]))

/* ── Service Card ───────────────────────────────────────────────────────────── */
function ServiceCard({ service, index, viewMode }) {
  const cat = CAT_MAP[service.category] || CAT_MAP['']
  const CatIcon = cat.Icon
  const priceLabel = service.priceType === 'hourly' ? '/hr' : service.priceType === 'per-room' ? '/room' : ''
  const hours = Math.round((service.duration?.estimated || 120) / 60)

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
      >
        <Link to={`/services/${service._id || service.id}`}>
          <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex">
            {/* Image */}
            <div className="w-52 flex-shrink-0 relative overflow-hidden">
              <img
                src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: cat.bg, color: cat.color }}>
                      <CatIcon className="w-3 h-3" />
                      {cat.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{service.rating?.average}</span>
                    <span className="text-xs text-amber-500">({service.rating?.count})</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{service.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{service.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {service.features?.slice(0, 3).map(f => (
                    <span key={f} className="flex items-center gap-1 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />{f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${service.basePrice}</span>
                    <span className="text-gray-400 text-sm ml-1">{priceLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />{hours}h
                  </div>
                </div>
                <span className="flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl group-hover:bg-primary-600 transition-colors">
                  Book Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/services/${service._id || service.id}`}>
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden h-full flex flex-col">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm shadow-sm"
                style={{ background: cat.bg + 'ee', color: cat.color }}>
                <CatIcon className="w-3 h-3" />
                {cat.label}
              </span>
            </div>

            {/* Rating badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-800">{service.rating?.average}</span>
              </span>
            </div>

            {/* Hover CTA */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-bold py-2.5 rounded-xl shadow-lg">
                View & Book <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-primary-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
              {service.description}
            </p>

            {/* First feature */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-4">
              <CheckCircle className="w-3.5 h-3.5" />
              {service.features?.[0]}
            </div>

            {/* Price + duration */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xl font-bold text-gray-900">${service.basePrice}</span>
                {priceLabel && <span className="text-gray-400 text-xs ml-1">{priceLabel}</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>{hours}h</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────────── */
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
  const catScrollRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const params = { page: currentPage, limit: PER_PAGE, sortBy, sortOrder: 'desc' }
        if (selectedCategory) params.category = selectedCategory
        if (searchQuery)      params.search   = searchQuery
        const res = await servicesAPI.getAll(params)
        setApiServices(res.data?.services || [])
      } catch { setApiServices([]) }
      finally  { setLoading(false) }
    }
    load()
  }, [searchParams, currentPage, sortBy])

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
  const paged = apiServices.length > 0 ? services : services.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE)

  const handleSearch = (e) => {
    e.preventDefault()
    const p = new URLSearchParams(searchParams)
    searchQuery ? p.set('search', searchQuery) : p.delete('search')
    setSearchParams(p); setCurrentPage(1)
  }

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat)
    const p = new URLSearchParams(searchParams)
    cat ? p.set('category', cat) : p.delete('category')
    setSearchParams(p); setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCategory(''); setPriceRange([0,500]); setMinRating(0)
    setSearchParams({}); setCurrentPage(1)
  }

  const activeFiltersCount = [
    selectedCategory, priceRange[1] < 500, priceRange[0] > 0, minRating > 0
  ].filter(Boolean).length

  if (loading && services.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner size="lg"/></div>
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ── Hero header ── */}
      <div className="relative pt-24 pb-16 overflow-hidden"
        style={{background:'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)'}}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-10 pointer-events-none"
          style={{background:'#6366f1'}}/>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full filter blur-3xl opacity-10 pointer-events-none"
          style={{background:'#0ea5e9'}}/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{color:'#6366f1'}}>
              12 services available
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3" style={{letterSpacing:'-0.02em'}}>
              Find Your Perfect Service
            </h1>
            <p className="text-slate-400 text-lg font-light mb-10 max-w-xl">
              Vetted professionals for every home need — book in minutes, done right.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}>
              <div className="relative max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{color:'rgba(148,163,184,0.7)'}}/>
                <input
                  type="text"
                  placeholder="Search services, e.g. cleaning, plumbing..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-36 py-4 text-base rounded-2xl focus:outline-none focus:ring-2 font-body"
                  style={{
                    background:'rgba(255,255,255,0.07)',
                    border:'1px solid rgba(255,255,255,0.12)',
                    color:'#f1f5f9',
                    backdropFilter:'blur(12px)',
                  }}
                />
                <button type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff'}}>
                  Search
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* ── Category scroll strip ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={catScrollRef} className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => {
              const Icon = cat.Icon
              const isActive = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryFilter(cat.name)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={isActive
                    ? { background: cat.color, color: '#fff', boxShadow: `0 4px 14px ${cat.color}40` }
                    : { background: cat.bg, color: cat.color }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border"
              style={showFilters
                ? {background:'#1e293b',color:'#fff',borderColor:'#1e293b'}
                : {background:'#fff',color:'#374151',borderColor:'#e5e7eb'}
              }
            >
              <SlidersHorizontal className="w-4 h-4"/>
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
            >
              <option value="rating">Highest Rated</option>
              <option value="basePrice">Price: Low to High</option>
            </select>

            {/* Active filter chips */}
            {selectedCategory && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{background: CAT_MAP[selectedCategory]?.bg, color: CAT_MAP[selectedCategory]?.color}}>
                {CAT_MAP[selectedCategory]?.label}
                <button onClick={() => handleCategoryFilter('')}><X className="w-3 h-3"/></button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-medium">{services.length} results</span>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode==='grid'?'bg-gray-900 text-white shadow-sm':'text-gray-400 hover:text-gray-600'}`}>
                <Grid className="w-4 h-4"/>
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode==='list'?'bg-gray-900 text-white shadow-sm':'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4"/>
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                    <input type="range" min="0" max="500" value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-indigo-500"/>
                    <div className="flex justify-between text-sm font-medium text-gray-500 mt-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">${priceRange[0]}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">${priceRange[1]}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Rating</label>
                    <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value={0}>Any Rating</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                      <option value={4.8}>4.8+ Stars</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3">
                    <button onClick={() => { setCurrentPage(1); setShowFilters(false) }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)'}}>
                      Apply Filters
                    </button>
                    <button onClick={clearFilters}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid / List */}
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg"/></div>
        ) : paged.length === 0 ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-gray-300"/>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or clearing filters</p>
            <button onClick={clearFilters}
              className="px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)'}}>
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'space-y-4'
          }>
            {paged.map((service, index) => (
              <ServiceCard key={service._id||service.id} service={service} index={index} viewMode={viewMode}/>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button disabled={currentPage===1} onClick={() => setCurrentPage(p=>p-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Previous
            </button>
            {[...Array(totalPages)].map((_,i) => (
              <button key={i+1} onClick={() => setCurrentPage(i+1)}
                className="w-10 h-10 rounded-xl text-sm font-bold transition-all"
                style={currentPage===i+1
                  ? {background:'linear-gradient(135deg,#6366f1,#4f46e5)',color:'#fff',boxShadow:'0 4px 14px rgba(99,102,241,0.4)'}
                  : {background:'#fff',color:'#374151',border:'1px solid #e5e7eb'}
                }>
                {i+1}
              </button>
            ))}
            <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(p=>p+1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
