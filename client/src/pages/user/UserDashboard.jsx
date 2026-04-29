import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, Home, Wrench, Zap, Paintbrush,
  Plus, Calendar, Clock, MapPin, Star,
  ArrowRight, ChevronRight, Settings, Bell,
  BarChart2, Layers, Download, Eye, CheckSquare,
  HelpCircle, MessageCircle, BookOpen, Shield,
  AlertTriangle, Phone
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { bookingsAPI, servicesAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

/* ── Mock data (used when API is empty) ─────────────────────────────────────── */
const MOCK_BOOKINGS = [
  { id:'bk-1', bookingNumber:'SX-1256', service:{name:'Deep Home Cleaning',category:'cleaning'},   status:'completed',   scheduledDate:'2025-04-10', scheduledTime:'10:00', address:{street:'42 Maple Ave, Brooklyn'},    pricing:{totalAmount:124.99}, paid:true  },
  { id:'bk-2', bookingNumber:'SX-1189', service:{name:'Pipe Leak Repair',  category:'plumbing'},   status:'in-progress', scheduledDate:'2025-04-22', scheduledTime:'14:00', address:{street:'7 Oak Street, Manhattan'},   pricing:{totalAmount:89.00},  paid:false },
  { id:'bk-3', bookingNumber:'SX-1102', service:{name:'Electrical Check',  category:'electrical'}, status:'confirmed',   scheduledDate:'2025-04-28', scheduledTime:'09:30', address:{street:'15 Pine Rd, Queens'},        pricing:{totalAmount:149.50}, paid:false },
  { id:'bk-4', bookingNumber:'SX-1044', service:{name:'Interior Painting', category:'painting'},   status:'completed',   scheduledDate:'2025-03-30', scheduledTime:'11:00', address:{street:'88 Cedar Blvd, Bronx'},      pricing:{totalAmount:320.00}, paid:true  },
]
const MOCK_SERVICES = [
  { id:'s1', name:'Home Deep Clean',   category:'cleaning',   basePrice:79,  rating:{average:4.9} },
  { id:'s2', name:'Plumbing Repair',   category:'plumbing',   basePrice:99,  rating:{average:4.8} },
  { id:'s3', name:'Electrical Safety', category:'electrical', basePrice:120, rating:{average:4.7} },
  { id:'s4', name:'Wall Painting',     category:'painting',   basePrice:150, rating:{average:4.9} },
]

const HELP_ITEMS = [
  { icon: BookOpen,      label: 'Help Center',       desc: 'Browse FAQs & guides',          href: '/help',          color: 'text-blue-600',    bg: 'bg-blue-50'    },
  { icon: MessageCircle, label: 'Live Chat',          desc: 'Chat with support now',         href: '/help/chat',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Shield,        label: 'Safety Tips',        desc: 'Stay safe with every booking',  href: '/help/safety',   color: 'text-purple-600',  bg: 'bg-purple-50'  },
  { icon: AlertTriangle, label: 'Report Issue',       desc: 'Flag a problem or dispute',     href: '/help/report',   color: 'text-amber-600',   bg: 'bg-amber-50'   },
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
  cleaning:   { Icon:Home,       grad:'from-blue-400 to-blue-600'    },
  plumbing:   { Icon:Wrench,     grad:'from-emerald-400 to-emerald-600' },
  electrical: { Icon:Zap,        grad:'from-amber-400 to-amber-600'  },
  painting:   { Icon:Paintbrush, grad:'from-purple-400 to-purple-600'},
  default:    { Icon:Layers,     grad:'from-gray-400 to-gray-600'    },
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */
function Ring({ value=52, size=108 }) {
  const r = (size-14)/2, circ = 2*Math.PI*r
  return (
    <div className="relative flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} strokeWidth="7" fill="none" className="stroke-gray-200"/>
        <circle cx={size/2} cy={size/2} r={r} strokeWidth="7" fill="none"
          strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
          className="stroke-blue-500 transition-all duration-1000"/>
      </svg>
      <span className="absolute text-2xl font-bold text-gray-900">{value}</span>
    </div>
  )
}
function Bar({ pct, color='bg-blue-500' }) {
  return (
    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{width:`${pct}%`}}/>
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function UserDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings]   = useState([])
  const [services, setServices]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('BUYER')
  const [selSvc, setSelSvc]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.id) {
          const [bRes, sRes] = await Promise.all([
            bookingsAPI.getByUser(user.id).catch(() => ({data:{bookings:[]}})),
            servicesAPI.getAll({limit:6}).catch(() => ({data:{services:[]}})),
          ])
          const b = bRes.data?.bookings || []
          const s = sRes.data?.services || []
          setBookings(b.length ? b : MOCK_BOOKINGS)
          setServices(s.length ? s : MOCK_SERVICES)
        } else {
          setBookings(MOCK_BOOKINGS)
          setServices(MOCK_SERVICES)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [user])

  const done      = bookings.filter(b => b.status==='completed')
  const spent     = done.reduce((s,b) => s+(b.pricing?.totalAmount||0), 0)
  const avgSpend  = done.length ? spent/done.length : 0
  const score     = Math.min(99, 52+done.length*3)
  const featured  = bookings.find(b=>b.status==='in-progress') || bookings[0]
  const featCat   = CAT_CFG[featured?.service?.category] || CAT_CFG.cleaning

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#faf7f2'}}>
      <LoadingSpinner size="lg"/>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16" style={{background:'linear-gradient(135deg,#faf7f2 0%,#f5ede0 100%)'}}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{background:'#fffdf9',border:'1px solid #e8ddd0'}}>

          {/* TOP NAV */}
          <div className="flex items-center justify-between px-8 py-4" style={{borderBottom:'1px solid #ede5d8'}}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#c2714f'}}>
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-bold text-lg" style={{color:'#2d1f14'}}>ServifyX</span>
              </div>
              <div className="rounded-2xl p-1 flex flex-col text-center w-20 shadow-inner" style={{background:'#f0e8dc'}}>
                {['BUYER','SELLER'].map(t => (
                  <button key={t} onClick={()=>setTab(t)} className="text-xs font-semibold py-1 rounded-xl transition-all"
                    style={tab===t?{background:'#fffdf9',boxShadow:'0 1px 3px rgba(0,0,0,0.1)',color:'#2d1f14'}:{color:'#a08060'}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-5">
              {[Home,Calendar,Clock,Search,BarChart2,Layers].map((Icon,i)=>(
                <button key={i} style={{color:'#b09070'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#c2714f'}
                  onMouseLeave={e=>e.currentTarget.style.color='#b09070'}>
                  <Icon className="w-5 h-5"/>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide" style={{color:'#6b4c35'}}>
                {(user?.firstName||user?.name||'Linda')+' W.'}
              </span>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                style={{background:'linear-gradient(135deg,#c2714f,#e8956d)'}}>
                {(user?.firstName?.[0]||user?.name?.[0]||'L').toUpperCase()}
              </div>
              <button style={{color:'#b09070'}}><Settings className="w-5 h-5"/></button>
            </div>
          </div>

          {/* SEARCH ROW */}
          <div className="flex items-center justify-between px-8 py-3" style={{borderBottom:'1px solid #ede5d8'}}>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'#c4a882'}}/>
              <input type="text" placeholder="Search for a Service"
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
                style={{background:'#f5ede0',border:'1px solid #e0cdb8',color:'#2d1f14'}}/>
            </div>
            <button style={{color:'#b09070'}}><Bell className="w-5 h-5"/></button>
          </div>

          {/* BODY */}
          <div className="p-8 space-y-6">

            {/* ROW 1 — Stats + Score */}
            <div className="grid grid-cols-12 gap-6">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
                className="col-span-12 lg:col-span-8 rounded-2xl p-6 flex items-center justify-between"
                style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{background:'linear-gradient(135deg,#2d1f14,#5c3d26)'}}>
                    <span className="text-white text-xl font-bold">{(user?.firstName?.[0]||user?.name?.[0]||'L').toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{color:'#a08060'}}>This Month</p>
                    <h2 className="text-4xl font-bold tracking-tight leading-none" style={{color:'#2d1f14'}}>
                      ${spent.toLocaleString('en-US',{minimumFractionDigits:2})}
                    </h2>
                    <p className="text-sm mt-1" style={{color:'#8a6a50'}}>
                      {done.length} Completed Bookings
                      {done.length>0&&<> · Avg <span className="font-semibold" style={{color:'#5c3d26'}}>${avgSpend.toFixed(2)}</span></>}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block text-right pr-2">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{color:'#a08060'}}>Your Stats</p>
                  <div className="space-y-1.5 text-sm">
                    {[{label:'Average',val:'4.8 ★'},{label:'Worst',val:'3.9 ★'},{label:'Bookings',val:bookings.length},{label:'Time Saved',val:`${done.length*2}h`}].map(({label,val})=>(
                      <div key={label} className="flex items-center justify-between gap-10">
                        <span style={{color:'#a08060'}}>{label}</span>
                        <span className="font-semibold" style={{color:'#2d1f14'}}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
                className="col-span-12 lg:col-span-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-3"
                style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{color:'#a08060'}}>Service Score</p>
                <div className="relative flex items-center justify-center" style={{width:108,height:108}}>
                  <svg width={108} height={108} className="-rotate-90">
                    <circle cx={54} cy={54} r={47} strokeWidth="7" fill="none" stroke="#e8d5be"/>
                    <circle cx={54} cy={54} r={47} strokeWidth="7" fill="none"
                      strokeDasharray={`${(score/100)*2*Math.PI*47} ${2*Math.PI*47}`}
                      strokeLinecap="round" stroke="#c2714f" className="transition-all duration-1000"/>
                  </svg>
                  <span className="absolute text-2xl font-bold" style={{color:'#2d1f14'}}>{score}</span>
                </div>
                <div className="w-full space-y-2">
                  {[{label:'Quality',pct:88,color:'#c2714f'},{label:'Speed',pct:94,color:'#d4956a'},{label:'Value',pct:80,color:'#e8b48a'}].map(({label,pct,color})=>(
                    <div key={label} className="flex items-center gap-2 text-xs" style={{color:'#a08060'}}>
                      <span className="w-12 shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'#e8d5be'}}>
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/>
                      </div>
                      <span className="w-5 text-right font-semibold" style={{color:'#5c3d26'}}>{pct}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ROW 2 — Featured + Booking + Quick icons */}
            <div className="grid grid-cols-12 gap-6">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
                className="col-span-12 md:col-span-6 lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden text-white h-full min-h-[190px] flex"
                  style={{background:'linear-gradient(135deg,#2d1f14,#5c3d26,#8a5c38)'}}>
                  <div className="relative z-10 flex w-full">
                    <div className="w-32 flex-shrink-0 flex items-center justify-center p-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${featCat.grad} flex items-center justify-center shadow-lg`}>
                        <featCat.Icon className="w-8 h-8 text-white"/>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{color:'#c4a882'}}>{featured?.bookingNumber||'SX-1256'}</p>
                        <h3 className="text-lg font-bold leading-tight">{featured?.service?.name||'Deep Home Cleaning'}</h3>
                        <p className="text-xs mt-1" style={{color:'#c4a882'}}>{featured?.address?.street||'42 Maple Ave, Brooklyn'}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-2xl font-bold">${(featured?.pricing?.totalAmount||124.99).toFixed(2)}</span>
                          <span className="text-xs ml-1" style={{color:'#c4a882'}}>/ session</span>
                        </div>
                        <Link to="/services">
                          <button className="flex items-center gap-1 transition px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{background:'rgba(255,255,255,0.15)'}}>
                            Book Again <ArrowRight className="w-3 h-3"/>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                className="col-span-12 md:col-span-6 lg:col-span-4">
                <div className="rounded-2xl p-6 text-white h-full flex flex-col justify-between min-h-[190px]"
                  style={{background:'linear-gradient(135deg,#c2714f,#e8956d,#f0b090)'}}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color:'rgba(255,255,255,0.7)'}}>Quick Action</p>
                    <h3 className="text-2xl font-bold leading-tight">MAKE A<br/>BOOKING</h3>
                    <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.7)'}}>Browse all services</p>
                  </div>
                  <div className="space-y-2.5 mt-4">
                    <select value={selSvc} onChange={e=>setSelSvc(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none shadow"
                      style={{background:'#fffdf9',color:'#2d1f14'}}>
                      <option value="">Select a service</option>
                      {services.map(s=>(
                        <option key={s.id||s._id} value={s.id||s._id}>{s.name}</option>
                      ))}
                    </select>
                    <Link to={selSvc?`/book/${selSvc}`:'/services'}>
                      <button className="w-full transition rounded-xl py-2.5 text-sm font-bold tracking-wide shadow"
                        style={{background:'linear-gradient(135deg,#2d1f14,#5c3d26)',color:'#f5ede0'}}>
                        CREATE AN ORDER
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
                className="col-span-12 lg:col-span-3">
                <div className="rounded-2xl p-5 h-full" style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{color:'#a08060'}}>Quick Book</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {label:'Cleaning',  href:'/services?category=cleaning',   ...CAT_CFG.cleaning},
                      {label:'Plumbing',  href:'/services?category=plumbing',   ...CAT_CFG.plumbing},
                      {label:'Electrical',href:'/services?category=electrical', ...CAT_CFG.electrical},
                      {label:'Painting',  href:'/services?category=painting',   ...CAT_CFG.painting},
                    ].map(({label,href,Icon,grad})=>(
                      <Link key={label} to={href}>
                        <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.96}}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl transition cursor-pointer shadow-sm"
                          style={{background:'#fffdf9'}}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow`}>
                            <Icon className="w-5 h-5 text-white"/>
                          </div>
                          <span className="text-xs font-medium text-center" style={{color:'#6b4c35'}}>{label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ROW 3 — Orders + Sidebar */}
            <div className="grid grid-cols-12 gap-6">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
                className="col-span-12 lg:col-span-8">
                <div className="rounded-2xl p-6" style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold" style={{color:'#2d1f14'}}>ORDER #{bookings[0]?.bookingNumber?.replace('SX-','')||'1256'}</h3>
                      {bookings[0]?.paid&&<span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:'#f5d78e',color:'#7a5c00'}}>PAID</span>}
                    </div>
                    <Link to="/bookings" className="text-xs font-semibold hover:underline" style={{color:'#c2714f'}}>SEE ALL ORDERS</Link>
                  </div>
                  <div className="space-y-3">
                    {bookings.slice(0,3).map((b,i)=>{
                      const cat=CAT_CFG[b.service?.category]||CAT_CFG.default
                      const st=STATUS_CFG[b.status]||STATUS_CFG.pending
                      return (
                        <motion.div key={b.id||b._id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.35+i*0.06}}
                          className="flex items-center gap-4 rounded-xl p-4 shadow-sm transition" style={{background:'#fffdf9'}}>
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.grad} flex items-center justify-center flex-shrink-0 shadow`}>
                            <cat.Icon className="w-7 h-7 text-white"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-sm truncate" style={{color:'#2d1f14'}}>{b.service?.name||'Service'}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs" style={{color:'#a08060'}}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3"/>
                                {b.scheduledDate?new Date(b.scheduledDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0"/>
                                <span className="truncate">{b.address?.street||'—'}</span>
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-lg flex-shrink-0" style={{color:'#2d1f14'}}>
                            ${(b.pricing?.totalAmount||0).toLocaleString('en-US',{minimumFractionDigits:2})}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-4" style={{borderTop:'1px solid #e0cdb8'}}>
                    {[{Icon:Eye,label:'VIEW DETAILS'},{Icon:CheckSquare,label:'MARK AS DONE'},{Icon:Download,label:'DOWNLOAD'}].map(({Icon,label})=>(
                      <button key={label} className="flex items-center gap-1.5 text-xs font-semibold transition shadow-sm px-4 py-2 rounded-xl"
                        style={{background:'#fffdf9',border:'1px solid #e0cdb8',color:'#6b4c35'}}>
                        <Icon className="w-3.5 h-3.5"/> {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.35}}
                className="col-span-12 lg:col-span-4 space-y-5">

                {/* Disputes */}
                <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold" style={{color:'#2d1f14'}}>DISPUTES</h3>
                    <span className="text-xs font-semibold cursor-pointer hover:underline" style={{color:'#c2714f'}}>SEE ALL</span>
                  </div>
                  <div className="rounded-xl p-4 shadow-sm" style={{background:'#fffdf9'}}>
                    <p className="font-semibold text-sm mb-1" style={{color:'#2d1f14'}}>Order #SX-800</p>
                    <p className="text-xs font-medium mb-1" style={{color:'#c0392b'}}>Status: Under Revision</p>
                    <p className="text-xs mb-1" style={{color:'#a08060'}}>Dispute Started: April 10, 2025</p>
                    <p className="text-xs mb-3" style={{color:'#a08060'}}>CleanPro Services</p>
                    <button className="w-full text-xs font-semibold transition px-4 py-2 rounded-xl"
                      style={{background:'#f0e8dc',color:'#6b4c35'}}>VIEW DETAILS</button>
                  </div>
                </div>

                {/* Popular */}
                <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold" style={{color:'#2d1f14'}}>Popular</h3>
                    <Link to="/services" className="text-xs font-semibold hover:underline" style={{color:'#c2714f'}}>See all</Link>
                  </div>
                  <div className="space-y-2">
                    {services.slice(0,3).map(svc=>{
                      const cat=CAT_CFG[svc.category]||CAT_CFG.default
                      return (
                        <Link key={svc.id||svc._id} to={`/services/${svc.id||svc._id}`}
                          className="flex items-center gap-3 rounded-xl p-3 shadow-sm transition" style={{background:'#fffdf9'}}>
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.grad} flex items-center justify-center flex-shrink-0 shadow`}>
                            <cat.Icon className="w-4 h-4 text-white"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{color:'#2d1f14'}}>{svc.name}</p>
                            <p className="text-xs" style={{color:'#a08060'}}>From ${svc.basePrice}</p>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400"/>
                            <span className="text-xs font-medium" style={{color:'#6b4c35'}}>{svc.rating?.average||'4.8'}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Help & Support */}
                <div className="rounded-2xl p-5" style={{background:'linear-gradient(135deg,#f5ede0,#ede0cc)'}}>
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-4 h-4" style={{color:'#c2714f'}}/>
                    <h3 className="font-bold" style={{color:'#2d1f14'}}>Help & Support</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {HELP_ITEMS.map(({icon:Icon,label,desc,href})=>(
                      <Link key={label} to={href} className="flex flex-col gap-1.5 p-3 rounded-xl shadow-sm transition group"
                        style={{background:'#fffdf9'}}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'#f0e8dc'}}>
                          <Icon className="w-4 h-4" style={{color:'#c2714f'}}/>
                        </div>
                        <p className="text-xs font-semibold leading-tight" style={{color:'#2d1f14'}}>{label}</p>
                        <p className="text-xs font-light leading-tight" style={{color:'#a08060'}}>{desc}</p>
                      </Link>
                    ))}
                  </div>
                  <div className="rounded-xl p-3" style={{background:'linear-gradient(135deg,#f5d5b8,#f0c8a0)',border:'1px solid #e8b88a'}}>
                    <p className="text-xs font-semibold mb-0.5" style={{color:'#5c3d26'}}>Need urgent help?</p>
                    <p className="text-xs font-light mb-2" style={{color:'#8a6a50'}}>Support available 24/7</p>
                    <a href="tel:+18005551234" className="flex items-center gap-1.5 text-xs font-bold" style={{color:'#c2714f'}}>
                      <Phone className="w-3 h-3"/> +1 (800) 555-1234
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
