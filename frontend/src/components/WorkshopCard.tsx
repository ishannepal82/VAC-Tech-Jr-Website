// src/components/WorkshopCard.tsx

import React from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  MapPin,
  User,
  Trash2,
  Tag,
} from "lucide-react";
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
  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // Check if workshop is upcoming
  const isUpcoming = (): boolean => {
    const workshopDate = new Date(workshop.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return workshopDate >= today;
  };

  return (
    <div className="bg-[#0a1a33] rounded-xl p-5 border border-[#254b80] hover:border-[#4a90d9] transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#254b80] rounded-lg flex items-center justify-center">
            <BookOpen className="text-[#b3d9ff]" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg line-clamp-1">
              {workshop.title}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isUpcoming()
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {isUpcoming() ? "Upcoming" : "Past"}
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(workshop)}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Delete workshop"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {workshop.description}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar size={14} className="text-[#4a90d9]" />
          <span>{formatDate(workshop.date)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Clock size={14} className="text-[#4a90d9]" />
          <span>{formatTime(workshop.time)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <User size={14} className="text-[#4a90d9]" />
          <span className="truncate">{workshop.instructor}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Users size={14} className="text-[#4a90d9]" />
          <span>{workshop.maxParticipants} max</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <MapPin size={14} className="text-[#4a90d9]" />
          <span className="truncate">{workshop.location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-300">
          <Tag size={14} className="text-[#4a90d9]" />
          <span className="truncate">{workshop.category}</span>
        </div>
      </div>

      {/* Duration Badge */}
      <div className="mt-4 pt-4 border-t border-[#254b80]">
        <span className="inline-flex items-center px-3 py-1 bg-[#254b80] rounded-full text-xs text-[#b3d9ff]">
          <Clock size={12} className="mr-1" />
          {workshop.duration}
        </span>
      </div>
    </div>
  );
};

export default WorkshopCard;