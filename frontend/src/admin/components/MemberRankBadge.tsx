type Rank =
  | "Newbie"
  | "Explorer"
  | "Builder"
  | "Developer"
  | "Hacker"
  | "Unknown";

interface MemberRankBadgeProps {
  rank: Rank;
}

const rankConfig = {
  Newbie: { color: "bg-green-500/20 text-green-400", label: "Newbie" },
  Explorer: { color: "bg-purple-500/20 text-purple-400", label: "Explorer" },
  Builder: { color: "bg-blue-500/20 text-blue-400", label: "Builder" },
  Developer: { color: "bg-orange-500/20 text-orange-400", label: "Developer" },
  Hacker: { color: "bg-red-500/20 text-red-400", label: "Hacker" },
  Unknown: { color: "bg-gray-500/20 text-gray-400", label: "Unknown" },
};

export default function MemberRankBadge({ rank }: MemberRankBadgeProps) {
  const config = rankConfig[rank] || rankConfig.Unknown;
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
    >
      {config.label}
    </span>
  );
}
