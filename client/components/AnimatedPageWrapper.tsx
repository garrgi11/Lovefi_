import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedPageWrapperProps {
  children: ReactNode;
  direction?: "left" | "right";
}

const slideVariants = {
  enter: (direction: "left" | "right") => ({
    x: direction === "left" ? -100 : 100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? 100 : -100,
    opacity: 0,
  }),
};

const slideTransition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3,
};

export default function AnimatedPageWrapper({
  children,
  direction = "left",
}: AnimatedPageWrapperProps) {
  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="w-full h-full absolute inset-0"
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// Higher order component for page transitions
export function withPageTransition<T extends object>(
  Component: React.ComponentType<T>,
  direction: "left" | "right" = "left",
) {
  return function AnimatedPage(props: T) {
    return (
      <AnimatedPageWrapper direction={direction}>
        <Component {...props} />
      </AnimatedPageWrapper>
    );
  };
}
