import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, User, Wrench, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FaultyTerminal from '../../components/ui/FaultyTerminal'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType]         = useState('user')
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await registerUser({ ...data, role: userType })
      navigate('/dashboard')
    } catch {}
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — FaultyTerminal ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-shrink-0"
        style={{ background: '#050810' }}>

        {/* WebGL background */}
        <div className="absolute inset-0">
          <FaultyTerminal
            scale={1.3}
            gridMul={[2, 1]}
            digitSize={1.4}
            timeScale={0.35}
            scanlineIntensity={0.4}
            glitchAmount={1.1}
            flickerAmount={0.9}
            noiseAmp={0.5}
            chromaticAberration={2}
            dither={0.2}
            curvature={0.12}
            tint="#a78bfa"
            mouseReact={true}
            mouseStrength={0.35}
            pageLoadAnimation={true}
            brightness={0.85}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{background:'linear-gradient(135deg,rgba(5,8,16,0.25) 0%,rgba(30,15,60,0.55) 100%)'}}/>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)'}}>
              <Zap className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ServifyX</span>
          </Link>

          <div>
            <motion.h2
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.8}}
              className="font-display text-4xl font-bold text-white mb-4 leading-tight"
              style={{letterSpacing:'-0.02em'}}>
              Join thousands of<br/>
              <span style={{color:'#c4b5fd'}}>happy homeowners.</span>
            </motion.h2>
            <motion.p
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.7}}
              className="text-slate-400 text-base font-light leading-relaxed max-w-xs">
              Book trusted professionals in minutes. Quality guaranteed on every service.
            </motion.p>

            {/* Feature list */}
            <motion.div
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.7,duration:0.6}}
              className="mt-8 space-y-3">
              {[
                'Background-checked professionals',
                'Same-day service available',
                '100% satisfaction guarantee',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{background:'rgba(167,139,250,0.2)'}}>
                    <div className="w-2 h-2 rounded-full" style={{background:'#a78bfa'}}/>
                  </div>
                  <span className="text-sm text-slate-400">{f}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="w-full lg:flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20 overflow-y-auto"
        style={{background:'#ffffff'}}>

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8 self-start">
          <ArrowLeft className="w-4 h-4"/> Back to home
        </Link>

        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)'}}>
              <Zap className="w-4 h-4 text-white"/>
            </div>
            <span className="text-lg font-bold text-gray-900">ServifyX</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1" style={{letterSpacing:'-0.02em'}}>
            Create your account
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-500 transition-colors">
              Sign in
            </Link>
          </p>

          {/* User type toggle */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">I want to</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type:'user',     Icon:User,   title:'Book Services',    sub:'Find professionals' },
                { type:'provider', Icon:Wrench, title:'Provide Services', sub:'Earn money'         },
              ].map(({ type, Icon, title, sub }) => (
                <button key={type} type="button" onClick={() => setUserType(type)}
                  className="p-4 rounded-xl border-2 transition-all duration-200 text-left"
                  style={userType === type
                    ? { borderColor:'#8b5cf6', background:'#faf5ff' }
                    : { borderColor:'#e5e7eb', background:'#fff' }
                  }>
                  <Icon className="w-5 h-5 mb-2" style={{color: userType===type ? '#8b5cf6' : '#9ca3af'}}/>
                  <div className="text-sm font-semibold" style={{color: userType===type ? '#6d28d9' : '#374151'}}>{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" autoComplete="given-name"
                {...register('firstName', { required: 'Required' })}
                error={errors.firstName?.message}/>
              <Input label="Last name" autoComplete="family-name"
                {...register('lastName', { required: 'Required' })}
                error={errors.lastName?.message}/>
            </div>

            <Input label="Email address" type="email" autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
              })}
              error={errors.email?.message}/>

            <Input label="Phone number" type="tel" autoComplete="tel"
              {...register('phone', {
                required: 'Phone is required',
                pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Invalid phone number' }
              })}
              error={errors.phone?.message}/>

            <div className="relative">
              <Input label="Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'At least 8 characters' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase & number' }
                })}
                error={errors.password?.message}/>
              <button type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </button>
            </div>

            <Input label="Confirm password" type="password" autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: v => v === password || 'Passwords do not match'
              })}
              error={errors.confirmPassword?.message}/>

            <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 flex-shrink-0"
                {...register('agreeTerms', { required: 'You must agree to the terms' })}/>
              <span>
                I agree to the{' '}
                <Link to="/terms" className="text-violet-600 hover:text-violet-500 font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-violet-600 hover:text-violet-500 font-medium">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 mt-2"
              style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',boxShadow:'0 4px 14px rgba(139,92,246,0.4)'}}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Google', icon: <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
              { label:'Twitter', icon: <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg> },
            ].map(({ label, icon }) => (
              <button key={label}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                {icon}{label}
              </button>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  )
}
