const rankData = [
  {
    rank: "🐣 Newbie",
    points: "0 – 99 pts",
    desc: "Just joined! Exploring the tech world and learning the ropes.",
    perks: ["—"],
  },
  {
    rank: "🧭 Explorer",
    points: "100 – 349 pts",
    desc: "Actively engaging in club events, discussions, and projects.",
    perks: ["—"],
  },
  {
    rank: "🧱 Builder",
    points: "350 – 649 pts",
    desc: "Contributing in projects or committees — now making a mark!",
    perks: ["value on project"],
  },
  {
    rank: "💻 Developer",
    points: "650 – 999 pts",
    desc: "A core member shaping ideas into real projects.",
    perks: [
      "🔹 25% off during club funding drives",
      "🔹 “Hackathon Ready” badge",
    ],
  },
  {
    rank: "🧠 Hacker",
    points: "1000+ pts",
    desc: "Elite member — leads, creates, inspires, and innovates.",
    perks: [
      "🔹 All Developer perks",
      "🔹 50% off during club funding drives",
      "🔹 Admin privileges in events",
      "🔹 Higher project visibility on the website",
    ],
  },
];

const xpData = [
  { activity: "Attend meeting", xp: "+5" },
  { activity: "Participate in event", xp: "+(10-50)" },
  { activity: "Submit project/design", xp: "+(10-100)" },

  { activity: "Represent club", xp: "+25" },
  { activity: "Win a challenge", xp: "+70" },
];

const RankBadge = ({ rankName }: { rankName: string }) => {
  const rankStyles: { [key: string]: string } = {
    Newbie: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    Explorer: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Builder: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Developer: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Hacker: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };
  const baseStyle = "px-3 py-1 text-sm font-semibold rounded-full border";
  const style = rankStyles[rankName] || rankStyles["Newbie"];
  return <span className={`${baseStyle} ${style}`}>{rankName}</span>;
};

// --- NEW COMPONENT 1: For Ranks Table ---
export const RanksTable = () => {
  return (
    <div>
      <p className="text-gray-400 mb-6">
        Climb the ladder by earning points (pts) for your contributions and
        engagement.
      </p>
      <div className="overflow-x-auto scrolling">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-[#1a2f55] text-[#9cc9ff]">
            <tr>
              <th className="p-4 rounded-tl-lg">Rank</th>
              <th className="p-4">Points Required</th>
              <th className="p-4">Description</th>
              <th className="p-4 rounded-tr-lg">Perks</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {rankData.map((item) => (
              <tr key={item.rank} className="border-b  border-gray-700/50">
                <td className="p-4 text-5xl font-semibold whitespace-nowrap">
                  <RankBadge rankName={item.rank.split(" ")[1]} />
                </td>
                <td className="p-4 font-mono w-50">{item.points}</td>
                <td className="p-4">{item.desc}</td>
                <td className="p-4">
                  <ul className="space-y-1">
                    {item.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- NEW COMPONENT 2: For XP Formula ---
export const XpFormulaInfo = () => {
  return (
    <div>
      <p className="text-gray-400 mb-6">
        Here’s how you can earn points and level up your rank.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {xpData.map((item) => (
          <div
            key={item.activity}
            className="bg-[#1a2f55] p-4 rounded-lg flex justify-between items-center"
          >
            <p className="text-gray-300">{item.activity}</p>
            <p className="font-bold text-[#9cc9ff] text-lg">{item.xp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
