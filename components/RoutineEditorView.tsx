
import React, { useState, useEffect } from 'react';
import { Entry, DayOfWeek } from '../types';
import { ChevronLeft } from 'lucide-react';

interface RoutineEditorViewProps {
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

const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const RoutineEditorView: React.FC<RoutineEditorViewProps> = ({ entry, onSave, onClose }) => {
  const [topic, setTopic] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [room, setRoom] = useState('');
  const [remindBefore, setRemindBefore] = useState(10);
  const [requireInteraction, setRequireInteraction] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(true);

  useEffect(() => {
    if (entry && entry.routine) {
      setTopic(entry.topic);
      setStartTime(entry.routine.startTime);
      setEndTime(entry.routine.endTime);
      setDays(entry.routine.days);
      setRoom(entry.routine.room || '');
      setRemindBefore(entry.routine.remindBefore);
      setRequireInteraction(entry.routine.requireInteraction ?? false);
      setShowTimestamp(entry.showTimestamp ?? true);
    } else {
      setTopic('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDays([]);
      setRoom('');
      setRemindBefore(10);
      setRequireInteraction(false);
      setShowTimestamp(true);
    }
  }, [entry]);
  
  const handleDayToggle = (day: DayOfWeek) => {
    setDays(prev => 
        prev.includes(day) 
            ? prev.filter(d => d !== day) 
            : [...prev, day]
    );
  };

  const handleSave = () => {
    if (!topic.trim()) {
      alert('Class/Subject name cannot be empty.');
      return;
    }
    if (days.length === 0) {
        alert('Please select at least one day for the routine.');
        return;
    }
    onSave({
      topic: topic.trim(),
      showTimestamp,
      routine: {
        startTime,
        endTime,
        days,
        room: room.trim() || undefined,
        remindBefore,
        requireInteraction,
      },
    });
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
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Class / Subject</label>
            <Input type="text" placeholder="e.g., Morning Yoga" value={topic} onChange={e => setTopic(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Time</label>
            <div className="flex items-center gap-2">
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Days</label>
            <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map(day => (
                <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`py-2 text-sm rounded-lg transition-colors font-semibold ${days.includes(day) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white'}`}>
                    {day}
                </button>
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Room / Location (optional)</label>
            <Input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Studio B, Room 204" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reminder</label>
            <Select value={remindBefore} onChange={e => setRemindBefore(Number(e.target.value))}>
                <option value="0">At start time</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
            </Select>
          </div>

          <Checkbox label="Require Interaction for Notification" checked={requireInteraction} onChange={e => setRequireInteraction(e.target.checked)} />

        </div>
      </div>
    </div>
  );
};

export default RoutineEditorView;
