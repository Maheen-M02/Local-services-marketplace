import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import FaultyTerminal from '../../components/ui/FaultyTerminal'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — FaultyTerminal ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: '#050810' }}>

        {/* WebGL background */}
        <div className="absolute inset-0">
          <FaultyTerminal
            scale={1.2}
            gridMul={[2, 1]}
            digitSize={1.3}
            timeScale={0.4}
            scanlineIntensity={0.5}
            glitchAmount={1.2}
            flickerAmount={0.8}
            noiseAmp={0.6}
            chromaticAberration={1.5}
            dither={0.3}
            curvature={0.15}
            tint="#4f8fff"
            mouseReact={true}
            mouseStrength={1.2}
            pageLoadAnimation={true}
            brightness={0.9}
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{background:'linear-gradient(135deg,rgba(5,8,16,0.3) 0%,rgba(15,25,60,0.5) 100%)'}}/>

        {/* Content over terminal */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)'}}>
              <Zap className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ServifyX</span>
          </Link>

          {/* Tagline */}
          <div>
            <motion.h2
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.8}}
              className="font-display text-4xl font-bold text-white mb-4 leading-tight"
              style={{letterSpacing:'-0.02em'}}>
              Your home,<br/>
              <span style={{color:'#7dd3fc'}}>perfectly maintained.</span>
            </motion.h2>
            <motion.p
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.7}}
              className="text-slate-400 text-base font-light leading-relaxed max-w-xs">
              Connect with vetted professionals for every home service — fast, reliable, guaranteed.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.7,duration:0.6}}
              className="flex gap-8 mt-8">
              {[['50K+','Customers'],['5K+','Providers'],['4.9★','Rating']].map(([n,l]) => (
                <div key={l}>
                  <div className="text-xl font-bold text-white">{n}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24"
        style={{background:'#ffffff'}}>

        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10 self-start">
          <ArrowLeft className="w-4 h-4"/> Back to home
        </Link>

        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)'}}>
              <Zap className="w-4 h-4 text-white"/>
            </div>
            <span className="text-lg font-bold text-gray-900">ServifyX</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2" style={{letterSpacing:'-0.02em'}}>
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up free
            </Link>
          </p>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              error={errors.email?.message}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                error={errors.password?.message}
              />
              <button type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 4px 14px rgba(99,102,241,0.4)'}}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"/>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social */}
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
