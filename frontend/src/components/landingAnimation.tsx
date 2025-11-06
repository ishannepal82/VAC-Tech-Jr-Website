import { motion, useReducedMotion } from "framer-motion";

type AnimatedBackgroundProps = {
  src?: string;
  duration?: number;
  className?: string;
  enableGlows?: boolean;
};

export default function AnimatedBackground({
  src = "./src/assets/landingbg.svg",
  duration = 30,
  className = "",
  enableGlows = true,
}: AnimatedBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  const animate = prefersReducedMotion
    ? { x: 0, y: 0, scale: 1, rotate: 0 }
    : {
        x: [4, 4, 4, 4, 4, 4],
        y: [5, 5, 5, 5, 5, 5],
        scale: [0, 1, 1.03, 1.01, 1.04, 1],
        rotate: [0, 0, 0.25, 0, -0.25, 0],
        opacity: [0, 1, 1, 1, 1, 1],
      };

  const transition = {
    duration: prefersReducedMotion ? 0 : duration,
    repeat: prefersReducedMotion ? 0 : Infinity,
    ease: "easeInOut",
  } as const;

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 ${className}`}>
      <motion.img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[120%] max-w-none opacity-80 select-none"
        animate={animate}
        transition={transition}
        style={{ willChange: "transform" }}
      />

      {enableGlows && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 h-[60vmax] w-[60vmax] -translate-x-1/2 rounded-full bg-[#1a2f55] opacity-40 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[40vmax] w-[40vmax] rounded-full bg-[#254b80] opacity-30 blur-[120px]" />
        </div>
      )}
    </div>
  );
}
