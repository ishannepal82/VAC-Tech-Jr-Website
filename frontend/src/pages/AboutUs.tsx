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

export default function AboutSection() {
  // ---------- DATA ----------
  const hodMembers = [
    {
      name: "Rishab Thapa",
      role: "President",

      image: "./src/assets/hod&ch/rishab.jpg",
    },
    {
      name: "Alshan Rijal",
      role: "Vice President",

      image: "./src/assets/hod&ch/vp.jpeg",
    },
    {
      name: "Sajiv Katuwal",
      role: "Vice President",
      image: "./src/assets/hod&ch/mvp.jpeg",
    },
    {
      name: "Keshab Chauhan",
      role: "Treasurer",

      image: "./src/assets/creativelead.jpg",
    },
    {
      name: "Swikar Dhungel",
      role: "Joint-Secretary",

      image: "./src/assets/hod&ch/sec.jpeg",
    },
    {
      name: "Romin Ban",
      role: "Secretary",

      image: "./src/assets/eventcoord.jpg",
    },

    {
      name: "Prastuti Niroula",
      role: "Joint-Secretary",

      image: "./src/assets/2sec.png",
    },
    {
      name: "Krishna Dahal",
      role: "Joint-Treasurer",

      image: "./src/assets/eventcoord.jpg",
    },
  ];

  const committeeHeads = [
    {
      name: "Rashis Dahal ",
      role: "ECA  Head",
      faculty: "Science",
      image: "./src/assets/designhead.jpg",
    },
    {
      name: "Saugat Bhagat",
      role: "Graphics  Head",
      faculty: "Science",
      image: "./src/assets/devhead.jpg",
    },
    {
      name: "Ishan Nepal",
      role: "Coding  Head",
      image: "./src/assets/researchhead.jpg",
    },
    {
      name: "Yubaraj Lamichhane",
      role: "PR Head",

      image: "./src/assets/hod&ch/pr.jpeg",
    },
  ];

  // ---------- COMPONENTS ----------
  const InfoCard = ({
    icon: Icon,
    title,
    desc,
  }: {
    icon: any;
    title: string;
    desc: any;
  }) => (
    <div className="bg-[#1a2f55] rounded-xl p-6 text-center hover:scale-105 transition-transform duration-300">
      <div className="w-14 h-14 bg-[#254b80] mx-auto mb-4 rounded-full flex items-center justify-center">
        <Icon className="text-[#b3d9ff]" size={24} />
      </div>
      <h4 className="font-extrabold text-2xl  mb-2 text-[#b3d9ff]">{title}</h4>
      <p className="text-[14px] m-auto text-center mt-2 w-[90%] text-gray-300">
        {desc}
      </p>
    </div>
  );

  const HodPyramid = ({ members }: { members: typeof hodMembers }) => {
    const president = members.find((m) => m.role === "President");
    const vicePresidents = members.filter((m) =>
      m.role.includes("Vice President")
    );
    const bottomRow = members.filter(
      (m) => !m.role.includes("President") && !m.role.includes("Vice President")
    );

    return (
      <div className="flex flex-col items-center relative w-full mt-10">
        <div className="flex items-end justify-center gap-4 mb-20 relative w-full max-w-5xl">
          <div className="flex flex-col gap-4 justify-end">
            {vicePresidents.slice(0, 1).map((m, i) => (
              <div key={i} className="transform scale-100">
                <HodCard {...m} />
              </div>
            ))}
          </div>

          <div className="transform m-10 scale-125 z-10">
            {president && <HodCard {...president} />}
          </div>

          <div className="flex flex-col gap-4 justify-end">
            {vicePresidents.slice(1).map((m, i) => (
              <div key={i} className="transform scale-100">
                <HodCard {...m} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-6 w-full max-w-6xl">
          {bottomRow.map((m, i) => {
            let translateY = "translate-y-0";
            if (i === 0) translateY = "-translate-y-3";
            if (i === bottomRow.length - 1) translateY = "-translate-y-3";

            return (
              <div
                key={i}
                className={`transform ${translateY} transition-transform duration-300`}
              >
                <HodCard {...m} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CommitteeGrid = ({ members }: { members: typeof committeeHeads }) => (
    <div className="flex flex-wrap justify-center gap-6">
      {members.map((member, i) => (
        <HodCard key={i} {...member} />
      ))}
    </div>
  );

  // ---------- RETURN ----------
  return (
    <section
      id="about"
      className="min-h-[120vh] pt-10  w-full bg-[#0a1a33] text-white font-poppins"
    >
      <div className="h-[120vh] flex flex-col justify-center items-center px-6 bg-[#0a1a33]">
        <div className=" w-full h-full rounded-2xl p-10">
          <h3 className="text-5xl font-semibold text-center mb-4 text-[#9cc9ff]">
            Our Story
          </h3>
          <p className="text-center text-gray-300 mb-8 text-base max-w-5xl mx-auto">
            Welcome to VAC Tech Club (+2 wing), the official technology
            community of
            <span className="text-[#9cc9ff] text-xl">
              {" "}
              Vishwa Adarsha College
            </span>{" "}
            — where ideas evolve into innovation and every student becomes a
            creator. We are a passionate group of +2 students exploring the
            limitless world of technology, design, and innovation, united by one
            goal — to build the future, together.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <InfoCard
              icon={Building2}
              title="About VAC Tech Club"
              desc=<>
                <p className="mt-6">
                  VAC Tech Club (+2 Wing) is a Tech-driven initiative of{" "}
                  <span className=" text-[#9cc9ff] text-md">
                    Vishwa Adarsha College
                  </span>
                  , created to spark innovation, collaboration, and creative
                  problem-solving. The club unites bright minds passionate about
                  AI, robotics, coding, development, and design, building a
                  platform where learning transforms into real-world impact.{""}
                </p>
                <p className="mt-6">
                  Through workshops, hackathons, mentorships, and tech talks, we
                  help students turn curiosity into capability — empowering them
                  to learn, build, and lead. Our mission extends beyond the
                  classroom: to create a connected network of tech communities
                  where every idea, project, and solution can be shared,
                  improved, and brought to life collaboratively.
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
                    center for youth innovation — a place where ideas grow into
                    real solutions that change the world.
                  </p>
                  <ul className="space-y-2 text-left mt-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={35} className="text-blue-300 mt-1" />
                      <span>
                        Empower +2 students with skills in technology,
                        creativity, and teamwork through projects and
                        collaboration.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={35} className="text-blue-300 mt-1" />
                      <span>
                        Build a strong network — a web of tech communities that
                        share solutions, ideas, and innovations in AI and
                        beyond.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={35} className="text-blue-300 mt-1" />
                      <span>
                        Establish a Core Team dedicated to representing VAC Tech
                        Club in hackathons, organizing events, and connecting
                        with tech enthusiasts everywhere.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={35} className="text-blue-300 mt-1" />
                      <span>
                        Invite passionate students to join us, contribute their
                        skills, and become part of a movement shaping the next
                        generation of innovators.
                      </span>
                    </li>
                  </ul>
                </>
              }
            />

            <InfoCard
              icon={Users}
              title="Our Committee"
              desc=<>
                <p>
                  VAC Tech Club thrives through four active committees — each
                  driving innovation, creativity, and outreach. Together.
                </p>
                <ul className="space-y-2 text-left mt-2">
                  <li className="flex items-start gap-2">
                    <Code2 size={35} className="text-blue-300 mt-1" />
                    <span>
                      <span className="text-[#9cc9ff] text-md">
                        Coding Committee:
                      </span>{" "}
                      Turns ideas into digital solutions through projects,
                      workshops, and coding challenges that push creativity and
                      skill.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brush size={35} className="text-blue-300 mt-1" />

                    <span>
                      <span className="text-[#9cc9ff] text-md">
                        GD Committee:
                      </span>{" "}
                      Knows as Graphics Design Committee, Brings imagination to
                      life — crafting visuals, UI/UX designs, and creative
                      assets that define our club’s identity.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Palette size={35} className="text-blue-300 mt-1" />
                    <span>
                      <span className="text-[#9cc9ff] text-md">
                        ECA Committee:
                      </span>{" "}
                      Brings energy and creativity to campus through events,
                      exhibitions, and team-building activities.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Megaphone size={35} className="text-blue-300 mt-1" />
                    <span>
                      <span className="text-[#9cc9ff] text-md">
                        PR Committee:
                      </span>{" "}
                      Drives outreach, partnerships, and branding to share VAC
                      Tech Club’s story and expand our impact beyond Vishwa
                      Adarsha.
                    </span>
                  </li>
                </ul>
              </>
            />
          </div>
        </div>
      </div>

      {/* --- 2nd VH : Head of Department --- */}
      <div className=" m-0 p-0 flex flex-col justify-center items-center  font-poppins">
        <div className="max-w-full w-full bg-[#112244] shadow-xl pb-20 pt-10 gap-5">
          <h3 className="text-5xl font-[900] text-center font-poppins mb-2 text-[#9cc9ff]">
            Board Of Directors
          </h3>
          <p className="text-center text-gray-300 mb-10 font-thin text-sm">
            Meet the brilliant minds leading our technical, creative, and
            operational divisions.
          </p>

          <div className="mb-12 mt-12">
            <HodPyramid members={hodMembers} />
          </div>

          <h4 className="text-2xl font-semibold text-center mb-6 text-[#b3d9ff]">
            Head of Committees
          </h4>
          <CommitteeGrid members={committeeHeads} />
        </div>
      </div>
    </section>
  );
}
