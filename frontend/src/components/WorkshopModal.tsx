// src/components/WorkshopModal.tsx

import React, { useState, useEffect, useCallback } from "react";
import { X, BookOpen } from "lucide-react";

// ============ TypeScript Interfaces ============

export interface Workshop {
  id: string;
  title: string;
  description: string;
}

export interface WorkshopFormData {
  title: string;
  description: string;
}

interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workshopData: WorkshopFormData) => Promise<void>;
  isSubmitting: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  image?: string;
}

// ============ Initial Form State ============

const initialFormState: WorkshopFormData = {
  title: "",
  description: "",
};

// ============ Main Component ============

const WorkshopModal: React.FC<WorkshopModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<WorkshopFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen]);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    },
    [isOpen, isSubmitting, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Workshop title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Parent component handles isSubmitting state
    setSubmitError(null);

    try {
      const trimmedData: WorkshopFormData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      await onSubmit(trimmedData);
      
      // Close modal after successful submission
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
    }
    // Parent component handles isSubmitting state reset
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = (): void => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#1a2f55] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#254b80]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#254b80] rounded-full flex items-center justify-center">
              <BookOpen className="text-[#b3d9ff]" size={20} />
            </div>
            <h2 id="modal-title" className="text-2xl font-bold text-white">
              Create Workshop
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            disabled={isSubmitting}
            className="p-2 hover:bg-[#254b80] rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="text-gray-400 hover:text-white" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Submit Error */}
            {submitError && (
              <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Workshop Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="e.g., Introduction to React Hooks"
                maxLength={100}
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors disabled:opacity-50 ${
                  errors.title ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              <p className="text-gray-500 text-xs mt-1">{formData.title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={4}
                placeholder="Describe what participants will learn..."
                maxLength={500}
                className={`w-full px-4 py-3 bg-[#0a1a33] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4a90d9] transition-colors resize-none disabled:opacity-50 ${
                  errors.description ? "border-red-500" : "border-[#254b80]"
                }`}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-[#254b80]">
            <button
              type="button"
              onClick={handleCloseClick}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-gray-300 hover:text-white hover:bg-[#254b80] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#4a90d9] hover:bg-[#3a7bc8] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                "Create Workshop"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkshopModal;