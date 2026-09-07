import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'

/**
 * Wraps <Routes> in an <AnimatePresence> so that page transitions
 * fade+slide in/out on every navigation.  Each route renders a
 * <motion.div> with a shared pageVariants preset.
 */
export default function AnimatedRoutes({ routes }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </AnimatePresence>
  )
}
