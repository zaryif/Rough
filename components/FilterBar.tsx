
import React from 'react';
import { ModuleType, DEFAULT_ENTRY_TYPE_ORDER } from '../constants';

interface FilterBarProps {
  currentFilter: ModuleType | 'all' | 'Code';
  onFilterChange: (filter: ModuleType | 'all' | 'Code') => void;
}

const filterableTypes = DEFAULT_ENTRY_TYPE_ORDER.filter(
    type => type !== 'Note' && type !== 'Custom'
) as (ModuleType | 'Code')[];

const FILTERS: (ModuleType | 'all' | 'Code')[] = ['all', ...filterableTypes];

const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="px-4 pb-2 flex-shrink-0">
      <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
              currentFilter === filter
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'
            }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
