import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import React from "react";

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const InfoModal = ({
  isOpen,
  onClose,
  title,
  children,
}: InfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[90vh] bg-[#102a4e] border border-blue-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-3xl font-bold text-[#9cc9ff]">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-400 hover:bg-[#1a2f55] hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-4 -mr-4 scrolling scrollbar-thin scrollbar-thumb-[#9cc9ff] scrollbar-track-[#1a2f55] hover:scrollbar-thumb-white">
              {children}
            </div>

            <div className="mt-8 text-center flex-shrink-0">
              <button
                onClick={onClose}
                className="bg-[#9cc9ff] text-[#102a4e] font-bold py-2 px-8 rounded-lg hover:bg-white transition-transform transform hover:scale-105"
              >
                Back
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
