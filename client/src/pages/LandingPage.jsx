import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Search, Shield, Clock, Star, ArrowRight,
  Wrench, Paintbrush, Zap, Home, CheckCircle,
  Hammer, Bug, Truck, Leaf, Settings, MoreHorizontal
} from 'lucide-react'
import {
  MdCleaningServices, MdPlumbing, MdElectricalServices,
  MdFormatPaint, MdCarpenter, MdYard, MdBugReport,
  MdLocalShipping, MdBuild, MdStar
} from 'react-icons/md'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LineWaves from '../components/ui/LineWaves'
import ScrollFloat from '../components/ui/ScrollFloat'
import LogoLoop from '../components/ui/LogoLoop'
import PixelTransition from '../components/ui/PixelTransition'
import ElectricBorder from '../components/ui/ElectricBorder'

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const SERVICES = [
  { icon: Home,       name: 'Home Cleaning', description: 'Professional deep cleaning services',    price: 'From $80',  rating: 4.9, reviews: 2847, electricColor: '#3b82f6' },
  { icon: Wrench,     name: 'Plumbing',      description: 'Expert repairs and installations',        price: 'From $120', rating: 4.8, reviews: 1923, electricColor: '#10b981' },
  { icon: Zap,        name: 'Electrical',    description: 'Licensed electrical work and repairs',    price: 'From $150', rating: 4.9, reviews: 1456, electricColor: '#f59e0b' },
  { icon: Paintbrush, name: 'Painting',      description: 'Interior and exterior painting services', price: 'From $200', rating: 4.7, reviews: 987,  electricColor: '#8b5cf6' },
]

/* ─── LogoLoop service pill renderer ────────────────────────────────────────── */
const ServicePill = ({ icon: Icon, label, color, href }) => (
  <a
    href={href}
    className="flex items-center gap-3 px-6 py-3 mx-3 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 no-underline group whitespace-nowrap"
    style={{ textDecoration: 'none' }}
  >
    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </span>
    <span className="font-body font-medium text-gray-700 group-hover:text-primary-600 transition-colors text-sm">
      {label}
    </span>
  </a>
)

const SERVICE_LOGOS_ROW1 = [
  { node: <ServicePill icon={MdCleaningServices}  label="Home Cleaning"    color="bg-blue-100 text-blue-600"    href="/services?category=cleaning"   />, title: 'Home Cleaning'    },
  { node: <ServicePill icon={MdPlumbing}          label="Plumbing"         color="bg-emerald-100 text-emerald-600" href="/services?category=plumbing"    />, title: 'Plumbing'         },
  { node: <ServicePill icon={MdElectricalServices}label="Electrical"       color="bg-amber-100 text-amber-600"  href="/services?category=electrical"  />, title: 'Electrical'       },
  { node: <ServicePill icon={MdFormatPaint}       label="Painting"         color="bg-purple-100 text-purple-600" href="/services?category=painting"    />, title: 'Painting'         },
  { node: <ServicePill icon={MdCarpenter}         label="Carpentry"        color="bg-orange-100 text-orange-600" href="/services?category=carpentry"   />, title: 'Carpentry'        },
  { node: <ServicePill icon={MdYard}              label="Gardening"        color="bg-green-100 text-green-600"  href="/services?category=gardening"   />, title: 'Gardening'        },
  { node: <ServicePill icon={MdBuild}             label="Appliance Repair" color="bg-slate-100 text-slate-600"  href="/services?category=appliance-repair" />, title: 'Appliance Repair' },
]

const SERVICE_LOGOS_ROW2 = [
  { node: <ServicePill icon={MdBugReport}         label="Pest Control"     color="bg-red-100 text-red-600"      href="/services?category=pest-control" />, title: 'Pest Control'     },
  { node: <ServicePill icon={MdLocalShipping}     label="Moving"           color="bg-indigo-100 text-indigo-600" href="/services?category=moving"      />, title: 'Moving'           },
  { node: <ServicePill icon={MdCleaningServices}  label="Deep Cleaning"    color="bg-cyan-100 text-cyan-600"    href="/services?category=cleaning"    />, title: 'Deep Cleaning'    },
  { node: <ServicePill icon={MdElectricalServices}label="Wiring & Rewiring"color="bg-yellow-100 text-yellow-600" href="/services?category=electrical" />, title: 'Wiring'           },
  { node: <ServicePill icon={MdPlumbing}          label="Drain Cleaning"   color="bg-teal-100 text-teal-600"    href="/services?category=plumbing"    />, title: 'Drain Cleaning'   },
  { node: <ServicePill icon={MdFormatPaint}       label="Wallpaper"        color="bg-pink-100 text-pink-600"    href="/services?category=painting"    />, title: 'Wallpaper'        },
  { node: <ServicePill icon={MdBuild}             label="HVAC Service"     color="bg-gray-100 text-gray-600"    href="/services?category=other"       />, title: 'HVAC'             },
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified Professionals',
    description: 'Every provider is background-checked, licensed, and insured before joining our platform.',
    iconBg: '#eff6ff', iconColor: '#2563eb',
    pixelColor: '#2563eb',
    hoverBg: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
  },
  {
    icon: Clock,
    title: 'Same-Day Service',
    description: 'Book and receive service on the same day for urgent home needs — no waiting.',
    iconBg: '#f0fdf4', iconColor: '#16a34a',
    pixelColor: '#16a34a',
    hoverBg: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
  },
  {
    icon: CheckCircle,
    title: 'Quality Guaranteed',
    description: "100% satisfaction guarantee. If you're not happy, we make it right at no extra cost.",
    iconBg: '#faf5ff', iconColor: '#7c3aed',
    pixelColor: '#7c3aed',
    hoverBg: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah Johnson',  role: 'Homeowner',        rating: 5, content: 'ServifyX made finding a reliable cleaner effortless. The service was exceptional and the booking process was completely seamless.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
  { name: 'Michael Chen',   role: 'Property Manager', rating: 5, content: 'We use ServifyX for all our maintenance needs. The quality of work and professionalism is consistently outstanding.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { name: 'Emily Rodriguez', role: 'Busy Parent',     rating: 5, content: 'As a working mom, ServifyX is a lifesaver. I can book services quickly and trust that the job will be done right.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
]

const STATS = [
  { number: '50K+',  label: 'Happy Customers'       },
  { number: '5K+',   label: 'Verified Professionals' },
  { number: '100K+', label: 'Services Completed'     },
  { number: '4.9',   label: 'Average Rating'         },
]

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 400], [0, -60])

  return (
    <div className="overflow-hidden pt-20">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{background:'linear-gradient(160deg,#0d0f1a 0%,#111428 40%,#0a1020 100%)'}}>

        {/* LineWaves */}
        <div className="absolute inset-0 z-0">
          <LineWaves
            speed={0.2} innerLineCount={24} outerLineCount={32}
            warpIntensity={0.8} rotation={-30} edgeFadeWidth={0.1}
            colorCycleSpeed={0.5} brightness={0.18}
            color1="#c8a020" color2="#e8c84a" color3="#f0d878"
            enableMouseInteraction={true} mouseInfluence={3.5}
          />
        </div>

        {/* Ambient blobs */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-24 left-16 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"
            style={{background:'#c8a020'}} />
          <div className="absolute top-48 right-16 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float"
            style={{background:'#4a6abe',animationDelay:'2s'}} />
          <div className="absolute bottom-24 left-1/2 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float"
            style={{background:'#e8c84a',animationDelay:'4s'}} />
        </motion.div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{color:'#c8a020'}}
            >
              Trusted by 50,000+ homeowners
            </motion.p>

            {/* Main headline */}
            <h1 className="text-hero text-5xl md:text-7xl lg:text-8xl mb-6" style={{color:'#f0ead8'}}>
              Premium Home
              <span className="block italic" style={{background:'linear-gradient(135deg,#c8a020,#f0d060)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Services</span>
              <span className="block text-4xl md:text-5xl lg:text-6xl font-display font-normal italic mt-2" style={{color:'rgba(240,234,216,0.5)'}}>
                at your fingertips
              </span>
            </h1>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
              className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-body font-light leading-relaxed"
              style={{color:'rgba(240,234,216,0.65)'}}
            >
              Connect with vetted professionals for every home need —
              from deep cleans to full renovations.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{color:'rgba(200,160,32,0.6)'}} />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-36 py-5 text-base font-body rounded-2xl focus:outline-none"
                  style={{
                    background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(200,160,32,0.3)',
                    color:'#f0ead8',
                    backdropFilter:'blur(12px)',
                    fontFamily:"'DM Sans', sans-serif"
                  }}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 py-3 text-sm font-semibold transition"
                  style={{background:'linear-gradient(135deg,#c8a020,#e8c840)',color:'#0d0f1a'}}
                >
                  Search
                </button>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/services">
                <button className="flex items-center gap-2 text-base px-8 py-4 font-body font-semibold rounded-xl transition"
                  style={{background:'linear-gradient(135deg,#c8a020,#e8c840)',color:'#0d0f1a'}}>
                  Browse Services <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/signup">
                <button className="text-base px-8 py-4 font-body font-medium rounded-xl transition"
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(200,160,32,0.3)',color:'#f0ead8',backdropFilter:'blur(8px)'}}>
                  Become a Provider
                </button>
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-eyebrow mb-4">Why ServifyX</p>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.04}
              containerClassName="justify-center"
              textClassName="text-section-title text-4xl md:text-5xl text-gray-900 font-display"
            >
              Built around your trust
            </ScrollFloat>
            <p className="text-lead max-w-xl mx-auto mt-4">
              Every feature we build starts with one question — does this make life easier for our customers?
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.15 }} viewport={{ once: true }}
                  className="flex justify-center"
                >
                  <PixelTransition
                    gridSize={10}
                    pixelColor={f.pixelColor}
                    animationStepDuration={0.4}
                    aspectRatio="80%"
                    className="w-full"
                    style={{
                      width: '100%',
                      borderRadius: '20px',
                      border: '1.5px solid #e5e7eb',
                      backgroundColor: '#fff',
                    }}
                    firstContent={
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                          style={{ backgroundColor: f.iconBg }}
                        >
                          <Icon className="w-8 h-8" style={{ color: f.iconColor }} />
                        </div>
                        <h3 className="font-display text-xl font-semibold text-gray-900 mb-3"
                          style={{ letterSpacing: '-0.01em' }}>
                          {f.title}
                        </h3>
                        <p className="font-body text-gray-500 text-sm leading-relaxed font-light">
                          {f.description}
                        </p>
                      </div>
                    }
                    secondContent={
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                        style={{ background: f.hoverBg }}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white mb-3"
                          style={{ letterSpacing: '-0.01em' }}>
                          {f.title}
                        </h3>
                        <p className="font-body text-white/80 text-sm leading-relaxed font-light mb-5">
                          {f.description}
                        </p>
                        <Link to="/services">
                          <span className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition text-white text-xs font-semibold px-4 py-2 rounded-full">
                            Learn more <ArrowRight className="w-3 h-3" />
                          </span>
                        </Link>
                      </div>
                    }
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-eyebrow mb-4">What we offer</p>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.04}
              containerClassName="justify-center"
              textClassName="text-section-title text-4xl md:text-5xl text-gray-900 font-display"
            >
              Popular Services
            </ScrollFloat>
            <p className="text-lead max-w-xl mx-auto mt-4">
              Book from our most requested home services — all delivered by certified professionals.
            </p>
          </motion.div>

          {/* ── LogoLoop ticker — row 1 left, row 2 right ── */}
          <div className="mb-16 space-y-5 overflow-hidden">
            {/* Row 1 — scrolls left */}
            <LogoLoop
              logos={SERVICE_LOGOS_ROW1}
              speed={60}
              direction="left"
              logoHeight={56}
              gap={0}
              hoverSpeed={0}
              fadeOut
              fadeOutColor="#f9fafb"
              scaleOnHover
              ariaLabel="Home services row 1"
            />
            {/* Row 2 — scrolls right */}
            <LogoLoop
              logos={SERVICE_LOGOS_ROW2}
              speed={60}
              direction="right"
              logoHeight={56}
              gap={0}
              hoverSpeed={0}
              fadeOut
              fadeOutColor="#f9fafb"
              scaleOnHover
              ariaLabel="Home services row 2"
            />
          </div>

          {/* ── Service cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon
              return (
                <motion.div key={svc.name}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.1 }} viewport={{ once: true }}
                >
                  <ElectricBorder
                    color={svc.electricColor}
                    speed={0.8}
                    chaos={0.1}
                    borderRadius={20}
                    style={{ display: 'block' }}
                  >
                    <div className="bg-white rounded-[20px] p-6 h-full flex flex-col">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                        style={{ backgroundColor: `${svc.electricColor}18` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: svc.electricColor }} />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-gray-900 mb-2" style={{ letterSpacing: '-0.01em' }}>
                        {svc.name}
                      </h3>
                      <p className="font-body text-gray-400 text-sm leading-relaxed font-light mb-5 flex-1">
                        {svc.description}
                      </p>
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-body font-semibold text-sm" style={{ color: svc.electricColor }}>
                          {svc.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-body text-sm font-medium text-gray-700">{svc.rating}</span>
                          <span className="font-body text-xs text-gray-400">({svc.reviews.toLocaleString()})</span>
                        </div>
                      </div>
                      <Button
                        className="w-full font-body text-sm"
                        size="sm"
                        style={{ backgroundColor: svc.electricColor, borderColor: svc.electricColor }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </ElectricBorder>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{background:'linear-gradient(135deg,#0d0f1a,#111428)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div
                  className="font-display font-bold leading-none mb-2"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    background: 'linear-gradient(135deg, #c8a020, #f0d060)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {s.number}
                </div>
                <div
                  className="font-body text-sm font-light tracking-wide uppercase"
                  style={{ letterSpacing: '0.1em', color: 'rgba(240,234,216,0.55)' }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-eyebrow mb-4">Testimonials</p>
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-section-title text-4xl md:text-5xl text-gray-900 font-display"
            >
              What our customers say
            </ScrollFloat>
            <p className="text-lead max-w-xl mx-auto mt-4">
              Real stories from real homeowners who trust ServifyX every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.15 }} viewport={{ once: true }}
              >
                <Card className="p-8 h-full flex flex-col hover:border-primary-200 hover:-translate-y-1 transition-all duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-6">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-quote text-lg flex-1 mb-8">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-body font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="font-body text-xs text-gray-400 font-light">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden min-h-[520px] flex items-center">

        {/* ── Background video ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* ── Dark overlay so text stays readable ── */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
            background: 'linear-gradient(160deg, rgba(13,15,26,0.78) 0%, rgba(17,20,40,0.72) 100%)',
          }}
        />

        {/* ── Gold ambient glow (sits above overlay) ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-3xl opacity-20"
            style={{ background: '#c8a020' }}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ zIndex: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }} viewport={{ once: true }}
          >
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{color:'#c8a020'}}>Get started today</p>
            <div style={{color:'#f0ead8'}}>
              <ScrollFloat
                animationDuration={1.1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.035}
                containerClassName="justify-center"
                textClassName="text-section-title text-4xl md:text-6xl font-display leading-tight"
              >
                Your home deserves
              </ScrollFloat>
            </div>
            <div style={{color:'#e8c840'}}>
              <ScrollFloat
                animationDuration={1.1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=45%"
                scrollEnd="bottom bottom-=35%"
                stagger={0.04}
                containerClassName="justify-center -mt-4"
                textClassName="text-section-title text-4xl md:text-6xl italic font-display"
              >
                the best care.
              </ScrollFloat>
            </div>
            <p className="font-body text-lg font-light leading-relaxed mb-10 max-w-xl mx-auto" style={{color:'rgba(240,234,216,0.55)'}}>
              Join thousands of satisfied customers who trust ServifyX for every home service need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <button className="font-body text-base px-8 py-4 font-semibold rounded-xl transition"
                  style={{background:'linear-gradient(135deg,#c8a020,#e8c840)',color:'#0d0f1a'}}>
                  Browse Services
                </button>
              </Link>
              <Link to="/signup">
                <button className="font-body text-base px-8 py-4 font-medium rounded-xl transition"
                  style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(200,160,32,0.3)',color:'#f0ead8',backdropFilter:'blur(8px)'}}>
                  Sign Up Free
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
