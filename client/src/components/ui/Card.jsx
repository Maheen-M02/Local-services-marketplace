import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  hover = true, 
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, shadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' } : {}}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}