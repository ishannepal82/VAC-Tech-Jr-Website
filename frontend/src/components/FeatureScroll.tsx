import Marquee from "react-fast-marquee";
import { Lightbulb, Users, Code, Rocket, Trophy } from "lucide-react";

export default function FeaturesScroll() {
  return (
    <section className="bg-[#071327]  overflow-x-visible text-white font-poppins">
      <Marquee gradient={true} gradientColor="#071327" speed={30} pauseOnHover>
        {[
          {
            icon: <Lightbulb size={36} className="text-[#9cc9ff]" />,
            title: "Learn by Building",
            desc: "Apply your skills in real projects that turn ideas into innovation.",
          },
          {
            icon: <Users size={36} className="text-[#9cc9ff]" />,
            title: "Join a Team",
            desc: "Collaborate in coding, PR, graphics, or ECA committees.",
          },
          {
            icon: <Trophy size={36} className="text-[#9cc9ff]" />,
            title: "Events That Inspire",
            desc: "From hackathons to showcases — grow your creativity and skills.",
          },
          {
            icon: <Rocket size={36} className="text-[#9cc9ff]" />,
            title: "Showcase Your Talent",
            desc: "Get featured on our website and climb the club leaderboard.",
          },
          {
            icon: <Code size={36} className="text-[#9cc9ff]" />,
            title: "Guided by Mentors",
            desc: "Learn from experienced seniors and grow with personalized guidance.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className=" m-4 p-6 min-w-[300px] md:min-w-[350px] rounded-2xl  flex flex-col items-center"
          >
            {item.icon}
            <h3 className="mt-2 text-xl font-bold text-[#b3d9ff]">
              {item.title}
            </h3>
            <p className="text-gray-400 mt-1 text-sm">{item.desc}</p>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
