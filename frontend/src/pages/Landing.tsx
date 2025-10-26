import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AnimatedBackground from "../components/landingAnimation";
import FeaturesScroll from "../components/FeatureScroll";
import landingbg from "../assets/landingbg.svg";
import landingrobo from "../assets/landingrobo.svg";
import { useNavigate } from "react-router-dom";

export default function PreLoginLanding() {
  const navigate = useNavigate();
  return (
    <>
      <section className="relative isolate h-screen w-full bg-[#0a1a33] text-white font-poppins overflow-hidden">
        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div className="relative mx-auto w-[92%] md:w-[80%] lg:w-[95%] max-w-[950px]">
            <AnimatedBackground src={landingbg} />

            <motion.img
              src={landingrobo}
              alt="VAC Tech Jr Club Landing"
              className="relative z-10 w-full drop-shadow-[0_0_40px_rgba(147,197,253,0.35)] select-none"
            />
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-[20%] left-[49%] z-20 -translate-x-1/2">
          <div className="flex items-center justify-center gap-4">
            <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-blue-900/30 transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#5ea4ff] focus:ring-offset-2 focus:ring-offset-[#0a1a33]" 
            onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight className="inline-block ml-2" size={24} />
            </button>
            <button className="border border-[#b3d9ff] text-[#b3d9ff] hover:bg-[#1a2f55] px-8 py-3 rounded-full font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
      <FeaturesScroll />
    </>
  );
}
