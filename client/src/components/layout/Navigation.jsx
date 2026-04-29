import { useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { ChevronDown, User, LogOut, Settings } from 'lucide-react'
import PillNav from '../ui/PillNav'

export default function Navigation() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Don't show navigation on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' }
    ]

    if (!user) {
      return [
        ...baseItems,
        { label: 'Login', href: '/login' },
        { label: 'Sign Up', href: '/signup' }
      ]
    }

    // Authenticated user items
    const userItems = [...baseItems]

    if (user.role === 'admin') {
      userItems.push({ label: 'Admin', href: '/admin/dashboard' })
    } else if (user.role === 'provider') {
      userItems.push({ label: 'Dashboard', href: '/provider/dashboard' })
    } else {
      userItems.push({ label: 'Dashboard', href: '/dashboard' })
    }

    return userItems
  }

  const navigationItems = getNavigationItems()

  return (
    <>
      <PillNav
        logo="/servifyx-logo.svg"
        logoAlt="ServifyX Logo"
        items={navigationItems}
        activeHref={location.pathname}
        className="servifyx-nav"
        baseColor="#ffffff"
        pillColor="#1f2937"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#ffffff"
        ease="power2.easeOut"
        initialLoadAnimation={true}
      />
      
      {/* User Menu for authenticated users */}
      {user && (
        <div className="fixed top-4 right-4 z-50" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg hover:bg-white/95 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.firstName || user.name}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-lg py-2">
              <a
                href="/profile"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}