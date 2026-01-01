import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
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

// Type definitions matching API response
interface BodMember {
  id: string;
  name: string;
  role: string;
  image: string;
  comittee: string;
  created_at: string;
  email?: string;
  is_admin?: boolean;
  uid?: string;
}

interface BodApiResponse {
  bod: BodMember[];
  msg: string;
}

// Transformed type for components
interface TransformedMember {
  name: string;
  role: string;
  image: string;
}

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  desc: React.ReactNode;
}

interface HodPyramidProps {
  members: TransformedMember[];
}

interface CommitteeGridProps {
  members: TransformedMember[];
}

// Fallback data in case API fails
const fallbackHodMembers: TransformedMember[] = [
  { name: "Rishab Thapa", role: "President", image: "./src/assets/hod&ch/rishab.jpg" },
  { name: "Alshan Rijal", role: "Vice President", image: "./src/assets/hod&ch/vp.jpeg" },
  { name: "Sajiv Katuwal", role: "Vice President", image: "./src/assets/hod&ch/mvp.jpeg" },
  { name: "Keshab Chauhan", role: "Treasurer", image: "./src/assets/hod&ch/kkc.jpeg" },
  { name: "Swikar Dhungel", role: "Joint-Secretary", image: "./src/assets/eventcoord.jpg" },
  { name: "Romin Ban", role: "Secretary", image: "./src/assets/eventcoord.jpg" },
  { name: "Prastuti Niroula", role: "Joint-Secretary", image: "./src/assets/2sec.png" },
  { name: "Krishna Dahal", role: "Joint-Treasurer", image: "./src/assets/eventcoord.jpg" },
];

const fallbackCommitteeHeads: TransformedMember[] = [
  { name: "Rashis Dahal", role: "ECA Head", image: "./src/assets/designhead.jpg" },
  { name: "Saugat Bhagat", role: "Graphics Head", image: "./src/assets/devhead.jpg" },
  { name: "Ishan Nepal", role: "Coding Head", image: "./src/assets/researchhead.jpg" },
  { name: "Yubaraj Lamichhane", role: "PR Head", image: "./src/assets/hod&ch/pr.jpeg" },
];

// Helper function to separate BOD members and Committee Heads
const separateMembers = (
  bodArray: BodMember[]
): { hodMembers: TransformedMember[]; committeeHeads: TransformedMember[] } => {
  const bodRoles = [
    "President",
    "Vice President",
    "Treasurer",
    "Secretary",
    "Joint-Secretary",
    "Joint-Treasurer",
  ];

  const committeeRoles = [
    "ECA Head",
    "Graphics Head",
    "Coding Head",
    "PR Head",
    "Tech Lead",
    "Design Head",
    "Research Head",
  ];

  const hodMembers: TransformedMember[] = [];
  const committeeHeads: TransformedMember[] = [];

  bodArray.forEach((member) => {
    const transformedMember: TransformedMember = {
      name: member.name,
      role: member.role,
      image: member.image,
    };

    // Check if role matches BOD roles
    const isBodRole = bodRoles.some(
      (role) => member.role.toLowerCase().includes(role.toLowerCase())
    );

    // Check if role matches Committee Head roles
    const isCommitteeRole = committeeRoles.some(
      (role) => member.role.toLowerCase().includes(role.toLowerCase())
    );

    if (isCommitteeRole) {
      committeeHeads.push(transformedMember);
    } else if (isBodRole || member.comittee === "BOD") {
      hodMembers.push(transformedMember);
    } else {
      // Default to committee heads if not matching BOD roles
      committeeHeads.push(transformedMember);
    }
  });

  return { hodMembers, committeeHeads };
};

const InfoCard = ({ icon: Icon, title, desc }: InfoCardProps) => (
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

const HodPyramid = ({ members }: HodPyramidProps) => {
  const president = members.find((m) => m.role === "President");
  const vicePresidents = members.filter((m) =>
    m.role.toLowerCase().includes("vice president")
  );
  const bottomRow = members.filter(
    (m) =>
      m.role !== "President" &&
      !m.role.toLowerCase().includes("vice president")
  );

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-0 w-full mt-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-4 lg:mb-20 w-full max-w-5xl">
        <div className="order-2 lg:order-1">
          {vicePresidents.slice(0, 1).map((m, i) => (
            <HodCard key={`vp-left-${i}`} {...m} />
          ))}
        </div>

        <div className="order-1 lg:order-2 lg:transform lg:scale-125 lg:z-10 lg:mx-10">
          {president && <HodCard {...president} />}
        </div>

        <div className="order-3 lg:order-3">
          {vicePresidents.slice(1).map((m, i) => (
            <HodCard key={`vp-right-${i}`} {...m} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-6xl px-4 lg:px-0">
        {bottomRow.map((m, i) => (
          <div
            key={`bottom-${i}`}
            className="transform lg:translate-y-0 transition-transform duration-300"
          >
            <HodCard {...m} />
          </div>
        ))}
      </div>
    </div>
  );
};

const CommitteeGrid = ({ members }: CommitteeGridProps) => (
  <div className="flex flex-wrap justify-center gap-6 px-4 md:px-0">
    {members.map((member, i) => (
      <HodCard key={`committee-${i}`} {...member} />
    ))}
  </div>
);

export default function AboutSection() {
  const [hodMembers, setHodMembers] = useState<TransformedMember[]>(fallbackHodMembers);
  const [committeeHeads, setCommitteeHeads] = useState<TransformedMember[]>(fallbackCommitteeHeads);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBodData = async (): Promise<void> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        setLoading(true);

        const response = await fetch("http://127.0.0.1:5000/api/bod/bod", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BodApiResponse = await response.json();

        if (data.bod && data.bod.length > 0) {
          const { hodMembers: fetchedHod, committeeHeads: fetchedCommittee } =
            separateMembers(data.bod);

          if (fetchedHod.length > 0) {
            setHodMembers(fetchedHod);
          }

          if (fetchedCommittee.length > 0) {
            setCommitteeHeads(fetchedCommittee);
          }

          toast.success(data.msg || "Data loaded successfully!", {
            duration: 2000,
            icon: "✅",
          });
        } else {
          toast.error("No BOD data found. Using cached data.", {
            duration: 3000,
            icon: "⚠️",
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);

        let errorMessage = "Failed to fetch data";

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            errorMessage = "Request timeout. Using cached data.";
          } else if (
            err.message.includes("NetworkError") ||
            err.message.includes("CORS")
          ) {
            errorMessage = "Network error. Using cached data.";
          } else if (err.message.includes("Failed to fetch")) {
            errorMessage = "Server unavailable. Using cached data.";
          } else {
            errorMessage = err.message;
          }
        }

        console.error("Error fetching BOD data:", err);

        toast.error(errorMessage, {
          duration: 4000,
          icon: "⚠️",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBodData();
  }, []);

  if (loading) {
    return (
      <section
        id="about"
        className="w-full bg-[#0a1a33] text-white font-poppins min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9cc9ff] mx-auto mb-4"></div>
          <p className="text-[#9cc9ff]">Loading...</p>
        </div>
      </section>
    );
  }

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
              desc={
                <>
                  <p>
                    VAC Tech Club (+2 Wing) is a Tech-driven initiative of{" "}
                    <span className=" text-[#9cc9ff] text-md">
                      Vishwa Adarsha College
                    </span>
                    , created to spark innovation, collaboration, and creative
                    problem-solving.
                  </p>
                  <p className="mt-4">
                    Through workshops, hackathons, and mentorships, we help
                    students turn curiosity into capability — empowering them to
                    learn, build, and lead.
                  </p>
                </>
              }
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
                      <CheckCircle
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        Empower students with skills in tech, creativity, and
                        teamwork.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        Build a strong, connected network of tech communities.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        Establish a Core Team to represent us in hackathons and
                        events.
                      </span>
                    </li>
                  </ul>
                </>
              }
            />
            <InfoCard
              icon={Users}
              title="Our Committees"
              desc={
                <>
                  <p>
                    Our club thrives through four active committees driving
                    innovation.
                  </p>
                  <ul className="space-y-2 text-left mt-4">
                    <li className="flex items-start gap-2">
                      <Code2
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        <span className="text-[#9cc9ff]">Coding:</span> Turns
                        ideas into digital solutions.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brush
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        <span className="text-[#9cc9ff]">Graphics Design:</span>{" "}
                        Brings imagination to life with visuals.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Palette
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        <span className="text-[#9cc9ff]">ECA:</span> Energizes
                        campus with creative events.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Megaphone
                        size={20}
                        className="text-blue-300 mt-1 flex-shrink-0"
                      />
                      <span>
                        <span className="text-[#9cc9ff]">PR:</span> Drives
                        outreach and partnerships.
                      </span>
                    </li>
                  </ul>
                </>
              }
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