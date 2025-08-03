import React, { useState } from 'react';
import { ModuleType, MODULE_ICONS } from '../constants';
import { X } from 'lucide-react';
import { useSettingsContext } from '../contexts/SettingsContext';

interface SelectEntryTypeViewProps {
  onSelect: (type: ModuleType | 'Note' | 'Custom' | 'Code') => void;
  onClose: () => void;
}

const SelectEntryTypeView: React.FC<SelectEntryTypeViewProps> = ({ onSelect, onClose }) => {
  const { entryTypeOrder, setEntryTypeOrder } = useSettingsContext();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, type: string) => {
    setDraggedItem(type);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>, dropTargetType: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const draggedItemIndex = entryTypeOrder.findIndex(item => item === draggedItem);
    const dropTargetIndex = entryTypeOrder.findIndex(item => item === dropTargetType);
    
    if (draggedItemIndex === -1 || dropTargetIndex === -1 || draggedItemIndex === dropTargetIndex) {
      setDraggedItem(null);
      return;
    }

    const newOrder = [...entryTypeOrder];
    const [removed] = newOrder.splice(draggedItemIndex, 1);
    newOrder.splice(dropTargetIndex, 0, removed);
    
    setEntryTypeOrder(newOrder);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="w-screen h-screen bg-white dark:bg-black flex flex-col text-black dark:text-white">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold">New Entry</h2>
        <button onClick={onClose} className="p-2 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
          <X size={20} />
        </button>
      </header>
      <div className="flex-grow p-4 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-2 gap-4">
            {entryTypeOrder.map(type => {
                const Icon = MODULE_ICONS[type];
                return (
                    <button
                        key={type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, type)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelect(type)}
                        className={`flex flex-col items-center justify-center p-6 aspect-square bg-white dark:bg-zinc-900 rounded-2xl transition-all border border-gray-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing
                          ${draggedItem === type ? 'opacity-50 scale-95' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
                    >
                        <Icon className="w-10 h-10 mb-3 text-black dark:text-white" />
                        <span className="font-semibold text-black dark:text-white">{type}</span>
                    </button>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default SelectEntryTypeView;
