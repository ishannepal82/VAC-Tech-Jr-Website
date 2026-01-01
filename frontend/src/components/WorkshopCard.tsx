// src/components/WorkshopCard.tsx

import React from "react";
import { BookOpen, Trash2 } from "lucide-react";
import type { Workshop } from "./WorkshopModal";

interface WorkshopCardProps {
  workshop: Workshop;
  onDelete: (workshop: Workshop) => void;
  canDelete?: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({
  workshop,
  onDelete,
  canDelete = true,
}) => {
  const handleDelete = (): void => {
    onDelete(workshop);
  };

  return (
    <div className="bg-[#0a1a33] rounded-xl p-5 border border-[#254b80] hover:border-[#4a90d9] transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#254b80] rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-[#b3d9ff]" size={20} />
          </div>
          <h4 className="font-semibold text-white text-lg line-clamp-2">
            {workshop.title}
          </h4>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
            title="Delete workshop"
            aria-label={`Delete workshop: ${workshop.title}`}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm line-clamp-3">{workshop.description}</p>
    </div>
  );
};

export default WorkshopCard;