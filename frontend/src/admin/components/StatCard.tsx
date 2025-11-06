import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent } from "react";
import type { RefAttributes } from "react";

interface StatCardProps {
  title: string;
  value: any;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-lg flex items-center gap-6 hover:shadow-lg hover:shadow-blue-500/10 transition-shadow">
      <div
        className={`p-4 rounded-full`}
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon style={{ color }} size={28} />
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-semibold uppercase">
          {title}
        </h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
