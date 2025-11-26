// src/components/WorkshopModal.tsx

import React, { useState } from "react";
import { X, BookOpen, Calendar, Clock, Users, MapPin } from "lucide-react";

// ============ TypeScript Interfaces ============

export interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  instructor: string;
  location: string;
  maxParticipants: number;
  category: string;
}

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workshop: Omit<Workshop, "id">) => void;
  isSubmitting?: boolean;
}

// ============ Constants ============

const WORKSHOP_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "UI/UX Design",
  "Blockchain",
  "Other",
];

const DURATION_OPTIONS = [
  "30 minutes",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
  "Half Day (4 hours)",
  "Full Day (8 hours)",
];

// ============ Initial Form State ============

const initialFormState: Omit<Workshop, "id"> = {
  title: "",
  description: "",
  date: "",
  time: "",
  duration: "1 hour",
  instructor: "",
  location: "",
  maxParticipants: 30,
  category: "Web Development",
};

// ============ Main Component ============

const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Omit<Workshop, "id">>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof Workshop, string>>>({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxParticipants" ? parseInt(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof Workshop]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Workshop, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Workshop title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = "Instructor name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Must have at least 1 participant";
    } else if (formData.maxParticipants > 500) {
      newErrors.maxParticipants = "Maximum 500 participants allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a2f55] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#254b80]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#254b80] rounded-full flex items-center justify-center">
              <BookOpen className="text-[#b3d9ff]" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Workshop</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[#254b80] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="text-gray-400 hover:text-white" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Workshop Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to React Hooks"
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                  errors.title ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a1a33] border border-[#254b80] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors"
              >
                {WORKSHOP_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe what participants will learn..."
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors resize-none ${
                  errors.description ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                    errors.date ? "border-red-500" : "border-[#254b80]"
                  }`}
                />
                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="inline mr-2" size={16} />
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                    errors.time ? "border-red-500" : "border-[#254b80]"
                  }`}
                />
                {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Duration and Max Participants Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                  Duration *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0a1a33] border border-[#254b80] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors"
                >
                  {DURATION_OPTIONS.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="maxParticipants"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  <Users className="inline mr-2" size={16} />
                  Max Participants *
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min={1}
                  max={500}
                  className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                    errors.maxParticipants ? "border-red-500" : "border-[#254b80]"
                  }`}
                />
                {errors.maxParticipants && (
                  <p className="text-red-400 text-sm mt-1">{errors.maxParticipants}</p>
                )}
              </div>
            </div>

            {/* Instructor */}
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-300 mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                  errors.instructor ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.instructor && (
                <p className="text-red-400 text-sm mt-1">{errors.instructor}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Room 101 or Online (Zoom)"
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors ${
                  errors.location ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#254b80]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-[#254b80] rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#4a90d9] hover:bg-[#3a7bc8] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workshop"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopModal;