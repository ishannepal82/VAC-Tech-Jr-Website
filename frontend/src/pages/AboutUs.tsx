import {
  Building2,
  Target,
  Users,
  CheckCircle,
  Code2,
  Palette,
  Megaphone,
  Brush,
} from "lucide-react";
import HodCard from "../components/HodCard.tsx";


const hodMembers = [
  { name: "Rishab Thapa", role: "President", image: "./src/assets/hod&ch/rishab.jpg" },
  { name: "Alshan Rijal", role: "Vice President", image: "./src/assets/hod&ch/vp.jpeg" },
  { name: "Sajiv Katuwal", role: "Vice President", image: "./src/assets/hod&ch/mvp.jpeg" },
  { name: "Keshab Chauhan", role: "Treasurer", image: "./src/assets/hod&ch/kkc.jpeg" },
  { name: "Swikar Dhungel", role: "Joint-Secretary", image: "./src/assets/hod&ch/sec.jpeg" },
  { name: "Romin Ban", role: "Secretary", image: "./src/assets/eventcoord.jpg" },
  { name: "Prastuti Niroula", role: "Joint-Secretary", image: "./src/assets/2sec.png" },
  { name: "Krishna Dahal", role: "Joint-Treasurer", image: "./src/assets/eventcoord.jpg" },
];

const committeeHeads = [
  { name: "Rashis Dahal ", role: "ECA Head", faculty: "Science", image: "./src/assets/designhead.jpg" },
  { name: "Saugat Bhagat", role: "Graphics Head", faculty: "Science", image: "./src/assets/devhead.jpg" },
  { name: "Ishan Nepal", role: "Coding Head", image: "./src/assets/researchhead.jpg" },
  { name: "Yubaraj Lamichhane", role: "PR Head", image: "./src/assets/hod&ch/pr.jpeg" },
];


export default function AboutSection() {
 
  const InfoCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: any; }) => (
    <div className="bg-[#1a2f55] rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300">
      <div className="w-14 h-14 bg-[#254b80] mx-auto mb-4 rounded-full flex items-center justify-center">
        <Icon className="text-[#b3d9ff]" size={24} />
      </div>
      <h4 className="font-extrabold text-2xl mb-2 text-[#b3d9ff]">{title}</h4>
      <div className="text-[14px] m-auto text-left mt-2 w-[95%] text-gray-300">
        {desc}
      </div>
    </div>
  );

  const HodPyramid = ({ members }: { members: typeof hodMembers }) => {
    const president = members.find((m) => m.role === "President");
    const vicePresidents = members.filter((m) => m.role.includes("Vice President"));
    const bottomRow = members.filter(
      (m) => !m.role.includes("President") && !m.role.includes("Vice President")
    );

    return (
    
      <div className="flex flex-col items-center gap-8 lg:gap-0 w-full mt-10">
        
       
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-4 lg:mb-20 w-full max-w-5xl">
       
          <div className="order-2 lg:order-1">
            {vicePresidents.slice(0, 1).map((m, i) => <HodCard key={i} {...m} />)}
          </div>

       
          <div className="order-1 lg:order-2 lg:transform lg:scale-125 lg:z-10 lg:mx-10">
            {president && <HodCard {...president} />}
          </div>

        
          <div className="order-3 lg:order-3">
            {vicePresidents.slice(1).map((m, i) => <HodCard key={i} {...m} />)}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl px-4 lg:px-0">
          {bottomRow.map((m, i) => (
      
            <div key={i} className="transform lg:translate-y-0 transition-transform duration-300">
              <HodCard {...m} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CommitteeGrid = ({ members }: { members: typeof committeeHeads }) => (
    <div className="flex flex-wrap justify-center gap-6 px-4 md:px-0">
      {members.map((member, i) => (
        <HodCard key={i} {...member} />
      ))}
    </div>
  );

  return (
    <section id="about" className="w-full bg-[#0a1a33] text-white font-poppins">
 
      <div className="flex flex-col justify-center items-center px-6 py-20 lg:py-24 bg-[#0a1a33]">
        <div className="w-full max-w-7xl">
          <h3 className="text-4xl md:text-5xl font-semibold text-center mb-4 text-[#9cc9ff]">
            Our Story
          </h3>
          <p className="text-center text-gray-300 mb-12 text-base max-w-5xl mx-auto">
            Welcome to VAC Tech Club (+2 wing), the official technology
            community of
            <span className="text-[#9cc9ff] text-lg md:text-xl">
              {" "}
              Vishwa Adarsha College
            </span>{" "}
            — where ideas evolve into innovation and every student becomes a
            creator. We are a passionate group of +2 students exploring the
            limitless world of technology, design, and innovation, united by one
            goal — to build the future, together.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <InfoCard
              icon={Building2}
              title="About VAC Tech Club"
              desc=<>
                <p>
                  VAC Tech Club (+2 Wing) is a Tech-driven initiative of{" "}
                  <span className=" text-[#9cc9ff] text-md">
                    Vishwa Adarsha College
                  </span>
                  , created to spark innovation, collaboration, and creative
                  problem-solving.
                </p>
                <p className="mt-4">
                  Through workshops, hackathons, and mentorships, we
                  help students turn curiosity into capability — empowering them
                  to learn, build, and lead.
                </p>
              </>
            />
            <InfoCard
              icon={Target}
              title="Mission & Vision"
              desc={
                <>
                  <p>
                    Our vision is to make Vishwa Adarsha +2 College a leading
                    center for youth innovation.
                  </p>
                  <ul className="space-y-2 text-left mt-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                      <span>
                        Empower students with skills in tech,
                        creativity, and teamwork.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                      <span>
                        Build a strong, connected network of tech communities.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                      <span>
                        Establish a Core Team to represent us in hackathons and events.
                      </span>
                    </li>
                  </ul>
                </>
              }
            />
            <InfoCard
              icon={Users}
              title="Our Committees"
              desc=<>
                <p>
                  Our club thrives through four active committees driving innovation.
                </p>
                <ul className="space-y-2 text-left mt-4">
                  <li className="flex items-start gap-2">
                    <Code2 size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                    <span>
                      <span className="text-[#9cc9ff]">Coding:</span> Turns ideas into digital solutions.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brush size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                    <span>
                      <span className="text-[#9cc9ff]">Graphics Design:</span> Brings imagination to life with visuals.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Palette size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                    <span>
                      <span className="text-[#9cc9ff]">ECA:</span> Energizes campus with creative events.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Megaphone size={20} className="text-blue-300 mt-1 flex-shrink-0" />
                    <span>
                      <span className="text-[#9cc9ff]">PR:</span> Drives outreach and partnerships.
                    </span>
                  </li>
                </ul>
              </>
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center font-poppins bg-[#112244] py-20 lg:py-24">
        <div className="max-w-full w-full">
          <h3 className="text-4xl md:text-5xl font-[900] text-center font-poppins mb-2 text-[#9cc9ff]">
            Board Of Directors
          </h3>
          <p className="text-center text-gray-300 mb-10 font-thin text-sm px-4">
            Meet the brilliant minds leading our technical, creative, and
            operational divisions.
          </p>

          <HodPyramid members={hodMembers} />

          <h4 className="text-3xl font-semibold text-center mt-20 mb-10 text-[#b3d9ff]">
            Head of Committees
          </h4>
          <CommitteeGrid members={committeeHeads} />
        </div>
      </div>
    </section>
  );
}