import { useEffect, useRef, useState } from 'react'
import './FluidGlassCursor.css'

/**
 * FluidGlassCursor
 * A frosted-glass lens that follows the mouse with a spring animation.
 * Expands on interactive elements, compresses on click.
 * Uses only CSS backdrop-filter — no Three.js required.
 */
export default function FluidGlassCursor() {
  const rootRef    = useRef(null)
  const rafRef     = useRef(null)

  // Spring state — current and target positions
  const cur = useRef({ x: -200, y: -200 })
  const tgt = useRef({ x: -200, y: -200 })
  const vel = useRef({ x: 0,    y: 0    })

  const [size,      setSize]      = useState({ lens: 40, outer: 60 })
  const [isHover,   setIsHover]   = useState(false)
  const [isClick,   setIsClick]   = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    // Spring constants
    const STIFFNESS = 180
    const DAMPING   = 22
    const MASS      = 1

    let lastTime = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const dx = tgt.current.x - cur.current.x
      const dy = tgt.current.y - cur.current.y

      const ax = (STIFFNESS * dx - DAMPING * vel.current.x) / MASS
      const ay = (STIFFNESS * dy - DAMPING * vel.current.y) / MASS

      vel.current.x += ax * dt
      vel.current.y += ay * dt
      cur.current.x += vel.current.x * dt
      cur.current.y += vel.current.y * dt

      if (rootRef.current) {
        rootRef.current.style.transform =
          `translate(${cur.current.x}px, ${cur.current.y}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      tgt.current.x = e.clientX
      tgt.current.y = e.clientY
      if (!visible) setVisible(true)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const onDown = () => setIsClick(true)
    const onUp   = () => setIsClick(false)

    // Detect hoverable elements
    const onOver = (e) => {
      const el = e.target
      const hoverable =
        el.tagName === 'A'      ||
        el.tagName === 'BUTTON' ||
        el.closest('a')         ||
        el.closest('button')    ||
        el.getAttribute('role') === 'button' ||
        el.getAttribute('tabindex') === '0'  ||
        window.getComputedStyle(el).cursor === 'pointer'

      setIsHover(!!hoverable)

      // Size based on element type
      if (hoverable) {
        setSize({ lens: 64, outer: 90 })
      } else {
        setSize({ lens: 40, outer: 60 })
      }
    }

    document.addEventListener('mousemove',  onMove,  { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    document.addEventListener('mousedown',  onDown)
    document.addEventListener('mouseup',    onUp)
    document.addEventListener('mouseover',  onOver,  { passive: true })

    return () => {
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      document.removeEventListener('mousedown',  onDown)
      document.removeEventListener('mouseup',    onUp)
      document.removeEventListener('mouseover',  onOver)
    }
  }, [visible])

  const lensSize  = isClick ? size.lens  * 0.82 : size.lens
  const outerSize = isClick ? size.outer * 0.82 : size.outer

  return (
    <div
      ref={rootRef}
      className={`fgc-root${isHover ? ' is-hovering' : ''}${isClick ? ' is-clicking' : ''}`}
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Outer ambient glow ring */}
      <div
        className="fgc-outer"
        style={{
          width:  outerSize,
          height: outerSize,
          background: `radial-gradient(circle, rgba(82,39,255,0.12) 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />

      {/* Main frosted glass lens */}
      <div
        className="fgc-lens"
        style={{ width: lensSize, height: lensSize }}
      />

      {/* Center dot */}
      <div
        className="fgc-dot"
        style={{ opacity: isHover ? 0 : 0.7 }}
      />
    </div>
  )
}
