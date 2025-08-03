
import React, { useState, useEffect } from 'react';
import { Entry, ExpenseItem } from '../types';
import { ChevronLeft, Trash2, Plus } from 'lucide-react';

// Props
interface ExpenseEditorViewProps {
  entry: Entry | null;
  onSave: (entryData: Omit<Entry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

// Reusable components
const Input = React.memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full p-2 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
));

const Checkbox = React.memo(({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
        <input type="checkbox" {...props} className="w-4 h-4 rounded text-black dark:text-white bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-black dark:focus:ring-white" />
        {label}
    </label>
));

// Helper to format date to YYYY-MM-DD
const toISODateString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
};

// Main component
const ExpenseEditorView: React.FC<ExpenseEditorViewProps> = ({ entry, onSave, onClose }) => {
  const [date, setDate] = useState(toISODateString(new Date()));
  const [items, setItems] = useState<{ id: string; description: string; amount: string }[]>([{ id: crypto.randomUUID(), description: '', amount: '' }]);
  const [showTimestamp, setShowTimestamp] = useState(false); // Default to false for this clean view

  useEffect(() => {
    if (entry && entry.expense) {
      setDate(entry.expense.date);
      setItems(entry.expense.items.map(i => ({...i, amount: i.amount.toString()})));
      setShowTimestamp(entry.showTimestamp ?? false);
    } else {
      setDate(toISODateString(new Date()));
      setItems([{ id: crypto.randomUUID(), description: '', amount: '' }]);
      setShowTimestamp(false);
    }
  }, [entry]);

  const handleItemChange = (id: string, field: 'description' | 'amount', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const addItemInput = () => setItems(prev => [...prev, { id: crypto.randomUUID(), description: '', amount: '' }]);
  const removeItemInput = (id: string) => {
      if (items.length > 1) {
          setItems(prev => prev.filter(item => item.id !== id));
      } else {
          setItems([{ id: crypto.randomUUID(), description: '', amount: '' }]);
      }
  };
  
  const handleSave = () => {
    const finalItems: ExpenseItem[] = items
      .map(item => ({...item, amount: parseFloat(item.amount)}))
      .filter(item => item.description.trim() && !isNaN(item.amount) && item.amount > 0);

    if (finalItems.length === 0) {
      alert('Please add at least one valid expense item.');
      return;
    }
    
    const topicDate = new Date(date);
    topicDate.setMinutes(topicDate.getMinutes() + topicDate.getTimezoneOffset());
    const topic = `Expenses for ${topicDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;

    onSave({
      topic,
      showTimestamp,
      expense: {
        date,
        items: finalItems,
        currency: 'BDT'
      },
    });
  };

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div className="w-screen h-screen bg-white dark:bg-black flex flex-col text-black dark:text-white">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="flex items-center gap-1 text-black dark:text-white hover:opacity-80 transition-opacity">
          <ChevronLeft size={24} />
          Back
        </button>
        <div className="flex items-center gap-4">
          <Checkbox label="Show Created At" checked={showTimestamp} onChange={e => setShowTimestamp(e.target.checked)} />
          <button onClick={handleSave} className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Save
          </button>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col p-4 overflow-y-auto no-scrollbar items-center">
        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Expenses</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          
          <div className="space-y-3">
             <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Items</label>
             <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <Input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} placeholder={`Expense description`} />
                        <Input type="number" value={item.amount} onChange={e => handleItemChange(item.id, 'amount', e.target.value)} placeholder="Amount (৳)" className="w-36" />
                        <button type="button" onClick={() => removeItemInput(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                ))}
             </div>
             <button type="button" onClick={addItemInput} className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:underline">
                <Plus size={14}/> Add Item
             </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between items-center font-bold text-lg text-black dark:text-white">
                <span>Total</span>
                <span className="font-mono">{total.toLocaleString('en-US')} ৳</span>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseEditorView;
