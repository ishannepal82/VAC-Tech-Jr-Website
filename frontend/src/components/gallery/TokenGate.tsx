import { ShieldCheck, Lock } from "lucide-react";

interface TokenGateProps {
  memoTokens: number;
}

export default function TokenGate({
  memoTokens,
}: TokenGateProps): React.ReactElement {
  const hasToken = memoTokens > 0;

  return (
    <div className="flex items-center gap-3 bg-[#102a4e] border border-[#1a2f55] rounded-2xl px-4 py-3 shadow-lg">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          hasToken
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-[#1a2f55] text-gray-500"
        }`}
      >
        {hasToken ? <ShieldCheck size={20} /> : <Lock size={20} />}
      </div>
      <div className="leading-tight">
        <p className="text-white font-semibold">Memo Token</p>
        <p className="text-gray-400 text-sm">{memoTokens} available</p>
      </div>
    </div>
  );
}
