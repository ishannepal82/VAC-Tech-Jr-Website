import { useState } from "react";
import type { ReactNode } from "react";
interface TabsProps {
  tabNames: string[];
  children: ReactNode[];
}

export default function Tabs({ tabNames, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabNames.map((name, index) => (
            <button
              key={name}
              onClick={() => setActiveTab(index)}
              className={`${
                activeTab === index
                  ? "border-[#5ea4ff] text-[#5ea4ff]"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {name}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">{children[activeTab]}</div>
    </div>
  );
}
