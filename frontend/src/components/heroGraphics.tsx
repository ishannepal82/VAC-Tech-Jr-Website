import { motion } from "framer-motion";

export default function HomeHeroGraphic() {
  return (
    <div className=" relative  w-[450px] h-[450px] md:w-[550px] md:h-[550px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2f55] to-[#254b80] rounded-full blur-xl opacity-60"></div>

      <motion.img
        src="./src/assets/heroRobot.svg"
        alt="Hero Robot"
        className="w-[150%] max-w-none z-10 drop-shadow-[0_0_25px_rgba(147,197,253,0.5)]"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 2, 0, -2, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.img
        src="./src/assets/roboParticle.svg"
        alt="Robot Particles"
        className="absolute w-[135%] max-w-none opacity-50"
        animate={{
          x: [0, 2, -1, 3],
          y: [0, -2, -3, 0],
          rotate: [0, 1, 2, 0],
          scale: [1, 1.02, 0.98, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
