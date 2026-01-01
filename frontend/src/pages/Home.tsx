import { Rocket, Users, Code, Trophy } from "lucide-react";
import HomeHeroGraphic from "../components/heroGraphics.tsx";
import AboutSection from "./AboutUs";
import CountUp from "react-countup";
import useTestUser from "../hooks/tests/useTestuser.tsx";
import { useEffect } from "react";

export default function HomePage() {
  const { tryuserfetch } = useTestUser();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userinfo = await tryuserfetch();
      console.log("Fetched user info:", userinfo);
    };
    fetchUserInfo();
  }, [tryuserfetch]);

  return (
    <>
      <section className="min-h-screen w-full bg-[#0a1a33] text-white font-poppins flex flex-col justify-center overflow-hidden">

        {/* --- Main Hero Content --- */}
        <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 lg:px-20 py-16 md:py-0 flex-grow">
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#9cc9ff] leading-tight">
              Empowering Students to <br />
              <span className="text-[#5ea4ff]">Innovate, Create & Lead</span>
            </h1>
            <p className="text-gray-300 mt-6 max-w-lg mx-auto md:mx-0 text-base md:text-lg leading-relaxed">
              Welcome to
              <span className="font-bold text-[#92b2d2]"> VAC Tech Jr Club</span>
              — a community where curiosity meets innovation. We build
              real-world solutions, sharpen technical skills, and grow together
              as future tech leaders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center md:justify-start">
              <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-3 rounded-full font-semibold transition duration-300">
                Join the Club
              </button>
              <button 
                className="border border-[#b3d9ff] text-[#b3d9ff] hover:bg-[#1a2f55] px-8 py-3 rounded-full font-semibold transition duration-300"
                onClick={() => {
                  window.location.href = "/ProjectsSection";
                }}
              >
                Explore Projects
              </button>
            </div>
          </div>

          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg flex-1 flex justify-center items-center mt-12 md:mt-0">
            <HomeHeroGraphic />
          </div>
        </div>

        <div className="flex gap-x-8 gap-y-6 items-center justify-center md:gap-x-16 lg:gap-x-24 pb-12 pt-8 px-4 flex-wrap">
          <div className="flex flex-col items-center">
            <Users className="text-[#b3d9ff]" size={40} />
            <h4 className="text-3xl font-bold text-white mt-2">
              <CountUp end={50} duration={8} />+
            </h4>
            <p className="text-gray-400 text-sm">Active Members</p>
          </div>

          <div className="flex flex-col items-center">
            <Code className="text-[#b3d9ff]" size={40} />
            <h4 className="text-3xl font-bold text-white mt-2">
              <CountUp end={4} duration={8} />
            </h4>
            <p className="text-gray-400 text-sm">Committees</p>
          </div>

          <div className="flex flex-col items-center">
            <Trophy className="text-[#b3d9ff]" size={40} />
            <h4 className="text-3xl font-bold text-white mt-2">
              <CountUp end={10} duration={8} />+
            </h4>
            <p className="text-gray-400 text-sm">Projects Completed</p>
          </div>

          <div className="flex flex-col items-center">
            <Rocket className="text-[#b3d9ff]" size={40} />
            <h4 className="text-3xl font-bold text-white mt-2">
              <CountUp end={12} duration={8} />+
            </h4>
            <p className="text-gray-400 text-sm">Events Hosted</p>
          </div>
        </div>
      </section>

      <AboutSection />
    </>
  );
}