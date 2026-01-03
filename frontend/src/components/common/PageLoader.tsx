import { motion } from "framer-motion";

interface PageLoaderProps {
  message?: string;
}

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1.2,
      ease: "linear" as const,
    },
  },
};

export default function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#061228] bg-opacity-95 text-white">
      <motion.div
        className="w-14 h-14 border-4 border-[#1f8bff] border-t-transparent rounded-full"
        variants={spinnerVariants}
        animate="animate"
      />
      <p className="mt-6 text-lg font-medium text-[#d0e7ff]">{message}</p>
    </div>
  );
}

