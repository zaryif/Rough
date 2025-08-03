
import React, { useState, useEffect, useRef } from 'react';
import { Entry, FileAttachment } from '../types';
import { ChevronLeft, Cake, User, Camera } from 'lucide-react';

interface BirthdayEditorViewProps {
  entry: Entry | null;
  onSave: (entryData: Omit<Entry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const Input = React.memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full p-3 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
));

const Select = React.memo((props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full p-3 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
));

const Checkbox = React.memo(({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
        <input type="checkbox" {...props} className="w-4 h-4 rounded text-black dark:text-white bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-black dark:focus:ring-white" />
        {label}
    </label>
));

const BirthdayEditorView: React.FC<BirthdayEditorViewProps> = ({ entry, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState<1 | 2 | 7>(1);
  const [photo, setPhoto] = useState<FileAttachment | null>(null);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry && entry.birthday) {
      setName(entry.birthday.name);
      setDob(entry.birthday.dob);
      setNotifyDaysBefore(entry.birthday.notifyDaysBefore);
      setPhoto(entry.birthday.photo || null);
      setShowTimestamp(entry.showTimestamp ?? true);
    } else {
      setName('');
      setDob('');
      setNotifyDaysBefore(1);
      setPhoto(null);
      setShowTimestamp(true);
    }
  }, [entry]);

  const handleSave = () => {
    if (!name.trim() || !dob) {
      alert('Name and Date of Birth cannot be empty.');
      return;
    }
    onSave({
      topic: name.trim(), // Use name as the topic for consistency
      showTimestamp,
      birthday: {
        name: name.trim(),
        dob,
        notifyDaysBefore,
        photo: photo || undefined,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhoto({ id: crypto.randomUUID(), dataUrl, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="w-screen h-screen bg-white dark:bg-black flex flex-col text-black dark:text-white">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="flex items-center gap-1 text-black dark:text-white hover:opacity-80 transition-opacity">
          <ChevronLeft size={24} />
          Back
        </button>
        <div className="flex items-center gap-4">
          <Checkbox label="Show Timestamp" checked={showTimestamp} onChange={e => setShowTimestamp(e.target.checked)} />
          <button onClick={handleSave} className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Save
          </button>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col p-4 overflow-y-auto no-scrollbar items-center">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="relative w-32 h-32 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center group border-2 border-dashed border-gray-300 dark:border-zinc-700">
              {photo ? (
                <img src={photo.dataUrl} alt={name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User size={64} className="text-gray-400 dark:text-zinc-600" />
              )}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={32} className="text-white" />
              </div>
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <Input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</label>
            <Input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Notify Before</label>
            <Select value={notifyDaysBefore} onChange={e => setNotifyDaysBefore(Number(e.target.value) as 1 | 2 | 7)}>
              <option value="1">1 Day</option>
              <option value="2">2 Days</option>
              <option value="7">7 Days</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayEditorView;
