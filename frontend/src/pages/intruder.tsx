import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import intruder_img from "../assets/intruder.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Intruder = () => {
  const navigate = useNavigate();
  const [logLines, setLogLines] = useState<string[]>([]);

  useEffect(() => {
    const lines = [
      "> SCANNING SECTOR 7G...",
      "> UNAUTHORIZED SIGNATURE DETECTED.",
      "> THREAT ISOLATION PROTOCOL: ACTIVE.",
      "> PURGING ANOMALY...",
    ];

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    let delay = 1500;
    lines.forEach((line, index) => {
      const id = setTimeout(() => {
        setLogLines((prev) => [...prev, line]);
      }, delay + index * 800);

      timeoutIds.push(id);
    });

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="bg-security-spotlight w-screen h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
      <motion.img
        src={intruder_img}
        alt="Intruder Detected"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: [0, -1, 2, -3, 3, -2, 1, 0],
        }}
        transition={{
          opacity: { duration: 0.5, delay: 0.5 },
          scale: { duration: 0.5, delay: 0.5 },
          x: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "loop",
            delay: 1,
          },
        }}
        className="w-[35%] max-w-[300px] mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
      />

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-5xl font-extrabold text-red-500"
      >
        Anomaly Detected
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="mt-4 text-lg text-white/60 max-w-xl"
      >
        Your presence has been logged. You should not be here.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-red-400/70 font-mono text-sm mt-8 space-y-1 h-24"
      >
        {logLines.map((line, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {line}
          </motion.p>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-xl font-semibold 
                   hover:bg-gray-700/80 transition duration-300"
      >
        <ArrowLeft size={20} /> Evacuate to Safety
      </motion.button>
    </div>
  );
};

export default Intruder;
