import { motion } from 'motion/react'
import { forwardRef } from 'react'

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
    },
  },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } },
  hover: {
    y: -3,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
}

/**
 * Motion-powered glass-morphism card with spring physics.
 */
const GlassCard = forwardRef(function GlassCard(
  { children, className = '', static: isStatic = false, onClick, layout, style, ...rest },
  ref
) {
  const classes = `glass-card ${className}`.trim()

  if (isStatic) {
    return (
      <div ref={ref} className={classes} onClick={onClick} style={style} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={classes}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      layout={layout}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
})

export default GlassCard
