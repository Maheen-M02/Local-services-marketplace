
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  DollarSign, Calendar, Star, Clock,
  Phone, Search, Settings, Bell,
  CheckCircle, Home, Wrench, Zap, Paintbrush,
  Layers, BarChart2, Users, Wifi, WifiOff,
  HelpCircle, MessageCircle, BookOpen, Shield,
  AlertTriangle, ChevronRight, TrendingUp
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

/* ── Mock data ─────────────────────────────────────────────────────────────── */
const MOCK_BOOKINGS = [
  { id:'pb-1', bookingNumber:'SX-2041', service:{name:'Deep House Cleaning', category:'cleaning'},   user:{firstName:'John',  lastName:'Doe',   phone:'+1 (555) 012-3456'}, scheduledDate:'2025-04-29', scheduledTime:'10:00', status:'confirmed',   pricing:{totalAmount:120}, address:{street:'42 Maple Ave, Brooklyn'}    },
  { id:'pb-2', bookingNumber:'SX-2038', service:{name:'Plumbing Repair',     category:'plumbing'},   user:{firstName:'Jane',  lastName:'Smith', phone:'+1 (555) 987-6543'}, scheduledDate:'2025-04-29', scheduledTime:'14:00', status:'pending',     pricing:{totalAmount:150}, address:{street:'7 Oak Street, Manhattan'}   },
  { id:'pb-3', bookingNumber:'SX-2031', service:{name:'Electrical Check',    category:'electrical'}, user:{firstName:'Carlos',lastName:'Ruiz',  phone:'+1 (555) 246-8101'}, scheduledDate:'2025-04-30', scheduledTime:'09:00', status:'in-progress', pricing:{totalAmount:200}, address:{street:'15 Pine Rd, Queens'}        },
  { id:'pb-4', bookingNumber:'SX-2019', service:{name:'Interior Painting',   category:'painting'},   user:{firstName:'Sara',  lastName:'Lee',   phone:'+1 (555) 135-7924'}, scheduledDate:'2025-04-28', scheduledTime:'11:00', status:'completed',   pricing:{totalAmount:320}, address:{street:'88 Cedar Blvd, Bronx'}      },
  { id:'pb-5', bookingNumber:'SX-2008', service:{name:'Garden Maintenance',  category:'cleaning'},   user:{firstName:'Mike',  lastName:'Brown', phone:'+1 (555) 864-2097'}, scheduledDate:'2025-04-27', scheduledTime:'08:30', status:'completed',   pricing:{totalAmount:95},  address:{street:'22 Elm St, Staten Island'} },
]

const MOCK_EARNINGS = [
  { month:'Nov', amount:1600 }, { month:'Dec', amount:2100 },
  { month:'Jan', amount:1800 }, { month:'Feb', amount:2200 },
  { month:'Mar', amount:1950 }, { month:'Apr', amount:2800 },
]

const MOCK_REVIEWS = [
  { id:'r1', user:'John D.',  rating:5, comment:'Excellent work, very thorough and professional!', date:'Apr 28, 2025' },
  { id:'r2', user:'Sara L.',  rating:5, comment:'Arrived on time, left the place spotless.',       date:'Apr 26, 2025' },
  { id:'r3', user:'Mike B.',  rating:4, comment:'Good job overall, minor issues were fixed fast.',  date:'Apr 25, 2025' },
]

const HELP_ITEMS = [
  { icon: BookOpen,      label: 'Provider Guide',    desc: 'Learn how to manage bookings',  href: '/help/provider-guide', color: 'text-blue-600',    bg: 'bg-blue-50'    },
  { icon: MessageCircle, label: 'Live Chat Support', desc: 'Chat with our support team',    href: '/help/chat',           color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield,        label: 'Safety Guidelines', desc: 'Stay safe on every job',        href: '/help/safety',         color: 'text-purple-600',  bg: 'bg-purple-50'  },
  { icon: AlertTriangle, label: 'Report an Issue',   desc: 'Flag a problem with a booking', href: '/help/report',         color: 'text-amber-600',   bg: 'bg-amber-50'   },
]

/* ── Config ─────────────────────────────────────────────────────────────────── */
const STATUS_CFG = {
  pending:       { label:'Pending',     bg:'bg-amber-100',   text:'text-amber-700',   dot:'bg-amber-400'   },
  confirmed:     { label:'Confirmed',   bg:'bg-blue-100',    text:'text-blue-700',    dot:'bg-blue-500'    },
  assigned:      { label:'Assigned',    bg:'bg-indigo-100',  text:'text-indigo-700',  dot:'bg-indigo-400'  },
  'in-progress': { label:'In Progress', bg:'bg-purple-100',  text:'text-purple-700',  dot:'bg-purple-500'  },
  completed:     { label:'Completed',   bg:'bg-emerald-100', text:'text-emerald-700', dot:'bg-emerald-500' },
  cancelled:     { label:'Cancelled',   bg:'bg-red-100',     text:'text-red-700',     dot:'bg-red-400'     },
}
const CAT_CFG = {
  cleaning:   { Icon:Home,       grad:'from-blue-400 to-blue-600'       },
  plumbing:   { Icon:Wrench,     grad:'from-emerald-400 to-emerald-600' },
  electrical: { Icon:Zap,        grad:'from-amber-400 to-amber-600'     },
  painting:   { Icon:Paintbrush, grad:'from-purple-400 to-purple-600'   },
  default:    { Icon:Layers,     grad:'from-gray-400 to-gray-600'       },
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, iconBg, label, value, sub, delay }) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6"/>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.amount))
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map(({ month, amount }) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors duration-200"
            style={{ height: `${(amount/max)*100}%`, minHeight: 4 }}
          />
          <span className="text-xs text-gray-400">{month}</span>
        </div>
      ))}
    </div>
  )
}

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}/>
      ))}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function ProviderDashboard() {
  const { user }  = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [online, setOnline]     = useState(false)
  const [tab, setTab]           = useState('PROVIDER')

  useEffect(() => {
    setTimeout(() => { setBookings(MOCK_BOOKINGS); setLoading(false) }, 400)
  }, [])

  const completed   = bookings.filter(b => b.status === 'completed')
  const pending     = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const totalEarned = completed.reduce((s,b) => s + (b.pricing?.totalAmount||0), 0) || 15320
  const monthEarned = 2800

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0f1a14'}}>
      <LoadingSpinner size="lg"/>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16" style={{background:'linear-gradient(135deg,#0f1a14 0%,#162010 100%)'}}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{background:'#1a2a1e',border:'1px solid #2a3d2e'}}>

          {/* ── TOP NAV ── */}
          <div className="flex items-center justify-between px-8 py-4" style={{borderBottom:'1px solid #2a3d2e'}}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#4a9e6a'}}>
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-lg" style={{color:'#e8f5ec'}}>ServifyX</span>
              </div>
              <div className="rounded-2xl p-1 flex flex-col text-center w-24 shadow-inner" style={{background:'#0f1a14'}}>
                {['PROVIDER','CLIENT'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="text-xs font-semibold py-1 rounded-xl transition-all"
                    style={tab===t ? {background:'#2a3d2e',color:'#e8f5ec',boxShadow:'0 1px 3px rgba(0,0,0,0.4)'} : {color:'#5a7a60'}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-5">
              {[Home,Calendar,Clock,Search,BarChart2,Users].map((Icon,i) => (
                <button key={i} className="transition" style={{color:'#5a7a60'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#4a9e6a'}
                  onMouseLeave={e=>e.currentTarget.style.color='#5a7a60'}>
                  <Icon className="w-5 h-5"/>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOnline(o => !o)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
                style={online ? {background:'#4a9e6a',color:'#fff'} : {background:'#2a3d2e',color:'#8ab890'}}>
                {online ? <Wifi className="w-4 h-4"/> : <WifiOff className="w-4 h-4"/>}
                {online ? 'Online' : 'Go Online'}
              </button>
              <span className="text-sm font-semibold uppercase tracking-wide" style={{color:'#8ab890'}}>
                {(user?.firstName||user?.name||'Tanvi')+' P.'}
              </span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                style={{background:'linear-gradient(135deg,#4a9e6a,#2d7a4f)'}}>
                {(user?.firstName?.[0]||user?.name?.[0]||'T').toUpperCase()}
              </div>
              <button style={{color:'#5a7a60'}}><Settings className="w-5 h-5"/></button>
            </div>
          </div>

          {/* ── SEARCH ROW ── */}
          <div className="flex items-center justify-between px-8 py-3" style={{borderBottom:'1px solid #2a3d2e'}}>
            <div>
              <h2 className="font-bold text-lg" style={{color:'#e8f5ec'}}>Provider Dashboard</h2>
              <p className="text-sm" style={{color:'#5a7a60'}}>Welcome back, {user?.firstName||'Tanvi'}!</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'#5a7a60'}}/>
                <input type="text" placeholder="Search bookings…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
                  style={{background:'#0f1a14',border:'1px solid #2a3d2e',color:'#e8f5ec'}}/>
              </div>
              <button style={{color:'#5a7a60'}}><Bell className="w-5 h-5"/></button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="p-8 space-y-6">

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {icon:DollarSign, bg:'#1e3d28', iconColor:'#4a9e6a', label:'Total Earnings', value:'$'+totalEarned.toLocaleString(), sub:'All time',          delay:0.05},
                {icon:Calendar,   bg:'#1e2d3d', iconColor:'#4a8abe', label:'Total Bookings', value:bookings.length,                  sub:completed.length+' completed', delay:0.1},
                {icon:Star,       bg:'#3d3010', iconColor:'#c8a020', label:'Avg Rating',     value:'4.8 ★',                         sub:'48 reviews',       delay:0.15},
                {icon:Clock,      bg:'#2d1e3d', iconColor:'#9a6abe', label:'Response Time',  value:'12m',                           sub:'Avg this month',   delay:0.2},
              ].map(({icon:Icon,bg,iconColor,label,value,sub,delay}) => (
                <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}}
                  className="rounded-2xl p-5 shadow-sm flex items-center gap-4"
                  style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:bg}}>
                    <Icon className="w-6 h-6" style={{color:iconColor}}/>
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{color:'#5a7a60'}}>{label}</p>
                    <p className="text-2xl font-bold leading-tight" style={{color:'#e8f5ec'}}>{value}</p>
                    {sub && <p className="text-xs mt-0.5" style={{color:'#5a7a60'}}>{sub}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-12 gap-6">

              {/* Recent Bookings */}
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
                className="col-span-12 lg:col-span-7">
                <div className="rounded-2xl p-6" style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold" style={{color:'#e8f5ec'}}>Recent Bookings</h3>
                    <span className="text-xs font-semibold cursor-pointer hover:underline" style={{color:'#4a9e6a'}}>SEE ALL</span>
                  </div>
                  <div className="space-y-3">
                    {bookings.slice(0,4).map((b,i) => {
                      const cat = CAT_CFG[b.service?.category] || CAT_CFG.default
                      const st  = STATUS_CFG[b.status] || STATUS_CFG.pending
                      return (
                        <motion.div key={b.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.06}}
                          className="rounded-xl p-4 shadow-sm transition"
                          style={{background:'#1a2a1e',border:'1px solid #2a3d2e'}}>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.grad} flex items-center justify-center flex-shrink-0 shadow`}>
                              <cat.Icon className="w-6 h-6 text-white"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-sm" style={{color:'#e8f5ec'}}>{b.service?.name}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                                  {st.label}
                                </span>
                              </div>
                              <p className="text-xs font-medium mb-1" style={{color:'#8ab890'}}>{b.user?.firstName} {b.user?.lastName}</p>
                              <div className="flex items-center gap-3 text-xs flex-wrap" style={{color:'#5a7a60'}}>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3"/>
                                  {new Date(b.scheduledDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {b.scheduledTime}
                                </span>
                                <span className="font-bold ml-auto" style={{color:'#e8f5ec'}}>${b.pricing?.totalAmount}</span>
                              </div>
                            </div>
                          </div>
                          {(b.status==='pending'||b.status==='confirmed') && (
                            <div className="flex gap-2 mt-3 pt-3" style={{borderTop:'1px solid #2a3d2e'}}>
                              <a href={'tel:'+b.user?.phone}
                                className="flex items-center gap-1.5 text-xs font-semibold transition px-3 py-1.5 rounded-xl"
                                style={{background:'#2a3d2e',color:'#8ab890'}}>
                                <Phone className="w-3.5 h-3.5"/> Call
                              </a>
                              <button className="flex items-center gap-1.5 text-xs font-bold text-white transition px-4 py-1.5 rounded-xl shadow"
                                style={{background:'#4a9e6a'}}>
                                <CheckCircle className="w-3.5 h-3.5"/> Accept
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Right column */}
              <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.3}}
                className="col-span-12 lg:col-span-5 space-y-5">

                {/* Monthly Earnings */}
                <div className="rounded-2xl p-6" style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold" style={{color:'#e8f5ec'}}>Monthly Earnings</h3>
                    <span className="text-xs font-semibold flex items-center gap-1" style={{color:'#4a9e6a'}}>
                      <TrendingUp className="w-3 h-3"/> +18% vs last month
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold" style={{color:'#e8f5ec'}}>${monthEarned.toLocaleString()}</span>
                    <span className="text-sm ml-2" style={{color:'#5a7a60'}}>this month</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {MOCK_EARNINGS.map(({ month, amount }) => {
                      const max = Math.max(...MOCK_EARNINGS.map(d => d.amount))
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t-lg transition-colors duration-200"
                            style={{ height:`${(amount/max)*100}%`, minHeight:4, background:'#4a9e6a' }}/>
                          <span className="text-xs" style={{color:'#5a7a60'}}>{month}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Performance */}
                <div className="rounded-2xl p-5" style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <h3 className="font-bold mb-4" style={{color:'#e8f5ec'}}>Performance</h3>
                  <div className="space-y-3">
                    {[
                      { label:'Completion Rate', pct:94, color:'#4a9e6a' },
                      { label:'On-Time Arrival',  pct:88, color:'#4a8abe' },
                      { label:'Customer Sat.',    pct:96, color:'#c8a020' },
                    ].map(({label,pct,color}) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{color:'#5a7a60'}}>{label}</span>
                          <span className="font-semibold" style={{color:'#8ab890'}}>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{background:'#2a3d2e'}}>
                          <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending action */}
                <div className="rounded-2xl p-5 text-white"
                  style={{background:'linear-gradient(135deg,#1e4d30,#2d7a4f)'}}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color:'rgba(255,255,255,0.6)'}}>Action Required</p>
                  <h3 className="text-3xl font-bold mb-1">{pending.length} Pending</h3>
                  <p className="text-sm mb-4" style={{color:'rgba(255,255,255,0.6)'}}>bookings awaiting your response</p>
                  <button className="w-full transition rounded-xl py-2.5 text-sm font-bold"
                    style={{background:'rgba(255,255,255,0.15)'}}>
                    Review All
                  </button>
                </div>
              </motion.div>
            </div>

            {/* REVIEWS + HELP ROW */}
            <div className="grid grid-cols-12 gap-6">

              {/* Recent Reviews */}
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
                className="col-span-12 lg:col-span-7">
                <div className="rounded-2xl p-6" style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold" style={{color:'#e8f5ec'}}>Recent Reviews</h3>
                    <span className="text-xs font-semibold cursor-pointer hover:underline" style={{color:'#4a9e6a'}}>SEE ALL</span>
                  </div>
                  <div className="space-y-3">
                    {MOCK_REVIEWS.map((r,i) => (
                      <motion.div key={r.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.45+i*0.06}}
                        className="rounded-xl p-4 shadow-sm" style={{background:'#1a2a1e',border:'1px solid #2a3d2e'}}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{background:'linear-gradient(135deg,#4a9e6a,#2d7a4f)'}}>
                              {r.user[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold" style={{color:'#e8f5ec'}}>{r.user}</p>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(j => (
                                  <Star key={j} className="w-3 h-3"
                                    style={j<=r.rating?{color:'#c8a020',fill:'#c8a020'}:{color:'#2a3d2e',fill:'#2a3d2e'}}/>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs" style={{color:'#5a7a60'}}>{r.date}</span>
                        </div>
                        <p className="text-sm font-light leading-relaxed pl-11" style={{color:'#8ab890'}}>{r.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Help & Support */}
              <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.45}}
                className="col-span-12 lg:col-span-5">
                <div className="rounded-2xl p-6 h-full" style={{background:'#243028',border:'1px solid #2a3d2e'}}>
                  <div className="flex items-center gap-2 mb-5">
                    <HelpCircle className="w-5 h-5" style={{color:'#4a9e6a'}}/>
                    <h3 className="font-bold" style={{color:'#e8f5ec'}}>Help & Support</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {HELP_ITEMS.map(({ icon: Icon, label, desc, href }) => (
                      <Link key={label} to={href}
                        className="flex flex-col gap-2 p-4 rounded-xl shadow-sm transition group"
                        style={{background:'#1a2a1e',border:'1px solid #2a3d2e'}}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'#2a3d2e'}}>
                          <Icon className="w-4 h-4" style={{color:'#4a9e6a'}}/>
                        </div>
                        <p className="text-xs font-semibold" style={{color:'#e8f5ec'}}>{label}</p>
                        <p className="text-xs font-light leading-tight" style={{color:'#5a7a60'}}>{desc}</p>
                      </Link>
                    ))}
                  </div>
                  <div className="rounded-xl p-4" style={{background:'linear-gradient(135deg,#1e4d30,#2d7a4f)',border:'1px solid #3a6a48'}}>
                    <p className="text-xs font-semibold mb-1" style={{color:'#c8f0d8'}}>Need urgent help?</p>
                    <p className="text-xs font-light mb-3" style={{color:'rgba(200,240,216,0.7)'}}>Our support team is available 24/7 for providers.</p>
                    <a href="tel:+18005551234"
                      className="flex items-center gap-2 text-xs font-bold transition" style={{color:'#a8e8c0'}}>
                      <Phone className="w-3.5 h-3.5"/> +1 (800) 555-1234
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
