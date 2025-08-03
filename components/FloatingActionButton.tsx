import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-8 right-8 w-16 h-16 bg-black text-white dark:bg-white dark:text-black rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-opacity-50"
      aria-label="Add new entry"
    >
      <Plus size={32} />
    </button>
  );
};

export default FloatingActionButton;