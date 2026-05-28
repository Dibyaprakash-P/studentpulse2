/** Reusable Framer Motion animation variants & constants */

// Staggered container — wraps children with stagger delays
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

// Fade up item for staggered grids
export const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// Smooth bounce entry
export const bounceEntry = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// Slide in from left
export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Slide in from right
export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Page transition wrapper
export const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.1 } },
};

// 3D card hover
export const card3DHover = {
  rest: { rotateY: 0, rotateX: 0, scale: 1 },
  hover: {
    rotateY: 2, rotateX: 1, scale: 1.01,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// Metric card hover with elevation
export const metricCardHover = {
  rest: { y: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" },
  hover: {
    y: -4,
    boxShadow: "0 16px 48px rgba(0,0,0,0.4), 0 0 20px rgba(20,184,166,0.08)",
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// Chart bar mount animation
export const chartBarMount = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (i) => ({
    scaleY: 1,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

// Modal
export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const modalContent = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } },
  exit: { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.1 } },
};
