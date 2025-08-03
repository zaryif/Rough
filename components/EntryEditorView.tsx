
import React, { useState, useEffect, useRef } from 'react';
import { Entry, DayOfWeek, RepeatOption, Task, FileAttachment, ExpenseItem } from '../types';
import { ChevronLeft, FileText, Plus, X, Camera, User, Trash2 } from 'lucide-react';
import { ModuleType, MODULE_ICONS, ATTACHMENT_TYPES } from '../constants';

const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toISODateString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
};

interface EntryEditorViewProps {
  entry: Entry | null;
  newEntryType: ModuleType | 'Note' | 'Custom' | null;
  onSave: (entryData: Omit<Entry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const Input = React.memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full p-2 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
));

const Select = React.memo((props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className="w-full p-2 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
));

const Checkbox = React.memo(({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
        <input type="checkbox" {...props} className="w-4 h-4 rounded text-black dark:text-white bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-black dark:focus:ring-white" />
        {label}
    </label>
));


const EntryEditorView: React.FC<EntryEditorViewProps> = ({ entry, newEntryType, onSave, onClose }) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [activeModules, setActiveModules] = useState<Set<ModuleType>>(new Set());
  const [showTimestamp, setShowTimestamp] = useState(true);
  
  // States for all attachable modules
  const [tasks, setTasks] = useState<string[]>(['']);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerInteraction, setTimerInteraction] = useState(false);
  const [remindAt, setRemindAt] = useState(new Date().toISOString().slice(0, 16));
  const [repeat, setRepeat] = useState<RepeatOption>('none');
  const [reminderInteraction, setReminderInteraction] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [photos, setPhotos] = useState<FileAttachment[]>([]);
  const [pdfs, setPdfs] = useState<FileAttachment[]>([]);
  
  // Routine State
  const [routineName, setRoutineName] = useState('');
  const [routineStartTime, setRoutineStartTime] = useState('09:00');
  const [routineEndTime, setRoutineEndTime] = useState('10:00');
  const [routineDays, setRoutineDays] = useState<DayOfWeek[]>([]);
  const [routineRoom, setRoutineRoom] = useState('');
  const [routineRemindBefore, setRoutineRemindBefore] = useState(10);
  const [routineInteraction, setRoutineInteraction] = useState(false);

  // Birthday State
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdayDob, setBirthdayDob] = useState('');
  const [birthdayNotifyDays, setBirthdayNotifyDays] = useState<1 | 2 | 7>(1);
  const [birthdayPhoto, setBirthdayPhoto] = useState<FileAttachment | null>(null);

  // Expense State
  const [expenseDate, setExpenseDate] = useState(toISODateString(new Date()));
  const [expenseItems, setExpenseItems] = useState<{ id: string; description: string; amount: string }[]>([{ id: crypto.randomUUID(), description: '', amount: '' }]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthdayFileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputType, setFileInputType] = useState<'Photo' | 'PDF' | null>(null);

  useEffect(() => {
    const modules = new Set<ModuleType>();
    if (entry) { // Editing existing entry
      setTopic(entry.topic);
      setDescription(entry.description || '');
      setShowTimestamp(entry.showTimestamp ?? true);
      
      if (entry.tasks) { modules.add('Tasks'); setTasks(entry.tasks.tasks.map(t => t.text)); setCompletedTasks(new Set(entry.tasks.tasks.filter(t => t.completed).map(t => t.id))) }
      if (entry.counter) { modules.add('Counter'); }
      if (entry.timer) { modules.add('Timer'); setTimerMinutes(entry.timer.duration / 60); setTimerInteraction(!!entry.timer.requireInteraction); }
      if (entry.reminder) { modules.add('Reminder'); setRemindAt(new Date(entry.reminder.remindAt).toISOString().slice(0, 16)); setRepeat(entry.reminder.repeat); setReminderInteraction(!!entry.reminder.requireInteraction); }
      if (entry.stopwatch) { modules.add('Stopwatch'); }
      if (entry.photo) { modules.add('Photo'); setPhotos(entry.photo.photos); }
      if (entry.pdf) { modules.add('PDF'); setPdfs(entry.pdf.pdfs); }
      if (entry.link) { modules.add('Link'); setLinkUrl(entry.link.url); }
      if (entry.routine) { 
        modules.add('Routine');
        const r = entry.routine;
        setRoutineName(r.name || '');
        setRoutineStartTime(r.startTime);
        setRoutineEndTime(r.endTime);
        setRoutineDays(r.days);
        setRoutineRoom(r.room || '');
        setRoutineRemindBefore(r.remindBefore);
        setRoutineInteraction(r.requireInteraction || false);
      }
      if (entry.birthday) {
        modules.add('Birthday');
        const b = entry.birthday;
        setBirthdayName(b.name);
        setBirthdayDob(b.dob);
        setBirthdayNotifyDays(b.notifyDaysBefore);
        setBirthdayPhoto(b.photo || null);
      }
      if (entry.expense) {
        modules.add('Expense');
        const e = entry.expense;
        setExpenseDate(e.date);
        setExpenseItems(e.items.map(i => ({...i, amount: i.amount.toString()})));
      }

    } else { // Creating new entry
      setTopic('');
      setDescription('');
      setShowTimestamp(true);
      // Reset all module states
      setTasks(['']); setCompletedTasks(new Set());
      setTimerMinutes(5); setTimerInteraction(false);
      setRemindAt(new Date().toISOString().slice(0, 16)); setRepeat('none'); setReminderInteraction(false);
      setPhotos([]); setPdfs([]); setLinkUrl('');
      setRoutineName(''); setRoutineStartTime('09:00'); setRoutineEndTime('10:00'); setRoutineDays([]); setRoutineRoom(''); setRoutineRemindBefore(10); setRoutineInteraction(false);
      setBirthdayName(''); setBirthdayDob(''); setBirthdayNotifyDays(1); setBirthdayPhoto(null);
      setExpenseDate(toISODateString(new Date())); setExpenseItems([{ id: crypto.randomUUID(), description: '', amount: '' }]);

      if (newEntryType && newEntryType !== 'Note' && newEntryType !== 'Custom' && ATTACHMENT_TYPES.includes(newEntryType)) {
          if (newEntryType === 'Photo' || newEntryType === 'PDF') {
            handleToggleModule(newEntryType);
          } else {
            modules.add(newEntryType);
          }
      }
    }
    setActiveModules(modules);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, newEntryType]);

  const handleSave = () => {
    if (!topic.trim() && !activeModules.size) {
        alert('Title cannot be empty for a simple note.');
        return;
    }

    const entryData: Omit<Entry, 'id' | 'createdAt'> = {
        topic: topic.trim() || `Entry from ${new Date().toLocaleDateString()}`,
        description: description.trim() || undefined,
        showTimestamp: showTimestamp,
    };

    if (activeModules.has('Tasks')) {
        const finalTasks: Task[] = tasks.map(text => text.trim()).filter(text => text).map((text) => ({ id: crypto.randomUUID(), text, completed: false }));
        if (finalTasks.length > 0) entryData.tasks = { tasks: finalTasks };
    }
    if (activeModules.has('Counter')) entryData.counter = entry?.counter || { count: 0, history: [{ value: 0, timestamp: new Date().toISOString() }] };
    if (activeModules.has('Timer')) entryData.timer = { duration: timerMinutes * 60, endTime: Date.now() + timerMinutes * 60 * 1000, requireInteraction: timerInteraction };
    if (activeModules.has('Stopwatch')) entryData.stopwatch = entry?.stopwatch || { isRunning: false, startTime: 0, elapsedTime: 0 };
    if (activeModules.has('Reminder')) entryData.reminder = { remindAt: new Date(remindAt).toISOString(), repeat, requireInteraction: reminderInteraction };
    if (activeModules.has('Photo') && photos.length > 0) entryData.photo = { photos };
    if (activeModules.has('PDF') && pdfs.length > 0) entryData.pdf = { pdfs };
    if (activeModules.has('Link') && linkUrl.trim()) entryData.link = { url: linkUrl.trim() };
    
    if (activeModules.has('Routine') && routineDays.length > 0) {
        entryData.routine = { name: routineName.trim() || undefined, startTime: routineStartTime, endTime: routineEndTime, days: routineDays, room: routineRoom.trim() || undefined, remindBefore: routineRemindBefore, requireInteraction: routineInteraction };
    }
    if (activeModules.has('Birthday') && birthdayName.trim() && birthdayDob) {
        entryData.birthday = { name: birthdayName.trim(), dob: birthdayDob, notifyDaysBefore: birthdayNotifyDays, photo: birthdayPhoto || undefined };
    }
    if (activeModules.has('Expense')) {
        const finalItems: ExpenseItem[] = expenseItems.map(item => ({...item, amount: parseFloat(item.amount)})).filter(item => item.description.trim() && !isNaN(item.amount) && item.amount > 0);
        if (finalItems.length > 0) entryData.expense = { date: expenseDate, items: finalItems, currency: 'BDT' };
    }
    
    onSave(entryData);
  };
  
  const handleToggleModule = (module: ModuleType) => {
    if (module === 'Photo' || module === 'PDF') {
        setFileInputType(module);
        fileInputRef.current?.click();
    } else {
        setActiveModules(prev => {
          const newSet = new Set(prev);
          if (newSet.has(module)) newSet.delete(module);
          else newSet.add(module);
          return newSet;
        });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'general' | 'birthday') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const newFile: FileAttachment = { id: crypto.randomUUID(), dataUrl, name: file.name };

        if (target === 'birthday') {
            setBirthdayPhoto(newFile);
        } else if (fileInputType === 'Photo') {
            setPhotos(prev => [...prev, newFile]);
            setActiveModules(prev => new Set(prev).add('Photo'));
        } else if (fileInputType === 'PDF') {
            setPdfs(prev => [...prev, newFile]);
            setActiveModules(prev => new Set(prev).add('PDF'));
        }
        setFileInputType(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  
  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));
  const removePdf = (id: string) => setPdfs(prev => prev.filter(p => p.id !== id));
  const handleTaskChange = (index: number, value: string) => setTasks(prev => prev.map((t, i) => i === index ? value : t));
  const addTaskInput = () => setTasks(prev => [...prev, '']);
  const handleDayToggle = (day: DayOfWeek) => setRoutineDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  const handleExpenseItemChange = (id: string, field: 'description' | 'amount', value: string) => setExpenseItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addExpenseItem = () => setExpenseItems(prev => [...prev, { id: crypto.randomUUID(), description: '', amount: '' }]);
  const removeExpenseItem = (id: string) => expenseItems.length > 1 ? setExpenseItems(prev => prev.filter(item => item.id !== id)) : setExpenseItems([{ id: crypto.randomUUID(), description: '', amount: '' }]);

  return (
    <div className="w-screen h-screen bg-white dark:bg-black flex flex-col text-black dark:text-white">
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <button onClick={onClose} className="flex items-center gap-1 text-black dark:text-white hover:opacity-80 transition-opacity">
          <ChevronLeft size={24} /> Back
        </button>
        <div className="flex items-center gap-4">
          <Checkbox label="Show Timestamp" checked={showTimestamp} onChange={e => setShowTimestamp(e.target.checked)} />
          <button onClick={handleSave} className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Save
          </button>
        </div>
      </header>
      
      <div className="flex-grow flex flex-col p-4 overflow-y-auto no-scrollbar">
        <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Title"
            required
            className="w-full bg-transparent text-2xl font-bold pt-2 focus:outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Start typing..."
            className="w-full bg-transparent text-base pt-2 focus:outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none no-scrollbar h-32"
        />

        <div className="flex-shrink-0 space-y-4 p-4 border-t border-gray-200 dark:border-zinc-800 mt-4">
            <div className="space-y-3">
                <label className="block text-sm font-medium text-black dark:text-white">Attachments</label>
                <div className="flex flex-wrap gap-2">
                    {ATTACHMENT_TYPES.map(type => (
                        <button type="button" key={type} onClick={() => handleToggleModule(type)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeModules.has(type) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>
                            {React.createElement(MODULE_ICONS[type], { className: 'w-4 h-4' })}
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'general')} accept={fileInputType === 'Photo' ? 'image/*' : 'application/pdf'} className="hidden"/>
                <input type="file" ref={birthdayFileInputRef} onChange={(e) => handleFileChange(e, 'birthday')} accept="image/*" className="hidden"/>

                {activeModules.has('Photo') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-black dark:text-white">Photos</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {photos.map(p => (
                                <div key={p.id} className="relative aspect-square rounded-md overflow-hidden group">
                                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removePhoto(p.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"> <X size={12} /> </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleToggleModule('Photo')} className="aspect-square flex items-center justify-center bg-gray-200 dark:bg-zinc-800 rounded-md hover:opacity-80 transition-opacity"> <Plus size={24} className="text-gray-500" /> </button>
                        </div>
                    </div>
                )}

                {activeModules.has('PDF') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-black dark:text-white">PDFs</h4>
                        <div className="space-y-2">
                            {pdfs.map(p => (
                                <div key={p.id} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-black rounded-md">
                                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm truncate flex-grow">{p.name}</span>
                                    <button type="button" onClick={() => removePdf(p.id)} className="text-red-500 hover:opacity-75 p-1 rounded-full"> <X size={14} /> </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => handleToggleModule('PDF')} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:underline pt-2">+ Add PDF</button>
                    </div>
                )}
                
                {activeModules.has('Link') && ( <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-2"> <h4 className="font-semibold text-sm text-black dark:text-white">Link</h4> <Input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com" /> </div> )}
                
                {activeModules.has('Tasks') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-black dark:text-white">Task List</h4>
                        {tasks.map((task, index) => ( <Input key={index} type="text" value={task} onChange={e => handleTaskChange(index, e.target.value)} placeholder={`Task ${index + 1}`} /> ))}
                        <button type="button" onClick={addTaskInput} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:underline">+ Add task</button>
                    </div>
                )}
                
                {activeModules.has('Timer') && ( <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-2"> <label className="block text-sm font-medium text-black dark:text-white">Timer Duration (minutes)</label> <Input type="number" min="1" value={timerMinutes} onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))} /> <Checkbox label="Require Interaction" checked={timerInteraction} onChange={e => setTimerInteraction(e.target.checked)} /> </div> )}
                
                {activeModules.has('Reminder') && ( <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-3"> <h4 className="font-semibold text-sm text-black dark:text-white">Reminder</h4> <div> <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date & Time</label> <Input type="datetime-local" value={remindAt} onChange={e => setRemindAt(e.target.value)} /> </div> <div> <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Repeat</label> <Select value={repeat} onChange={e => setRepeat(e.target.value as RepeatOption)}> <option value="none">One-time</option> <option value="daily">Daily</option> <option value="weekly">Weekly</option> <option value="monthly">Monthly</option> <option value="yearly">Yearly</option> </Select> </div> <Checkbox label="Require Interaction" checked={reminderInteraction} onChange={e => setReminderInteraction(e.target.checked)} /> </div> )}

                {activeModules.has('Routine') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm text-black dark:text-white">Routine</h4>
                        <Input type="text" placeholder="Routine Name (e.g., Morning Yoga)" value={routineName} onChange={e => setRoutineName(e.target.value)} />
                        <div className="flex items-center gap-2"> <Input type="time" value={routineStartTime} onChange={e => setRoutineStartTime(e.target.value)} /> <span className="text-gray-500">to</span> <Input type="time" value={routineEndTime} onChange={e => setRoutineEndTime(e.target.value)} /> </div>
                        <div className="grid grid-cols-4 gap-2"> {DAYS_OF_WEEK.map(day => ( <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`py-2 text-xs rounded-lg transition-colors ${routineDays.includes(day) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'}`}>{day}</button> ))} </div>
                        <Input type="text" placeholder="Location (optional)" value={routineRoom} onChange={e => setRoutineRoom(e.target.value)} />
                        <Select value={routineRemindBefore} onChange={e => setRoutineRemindBefore(Number(e.target.value))}> <option value="0">Remind at start time</option> <option value="5">5 mins before</option> <option value="10">10 mins before</option> <option value="30">30 mins before</option> </Select>
                        <Checkbox label="Require Interaction" checked={routineInteraction} onChange={e => setRoutineInteraction(e.target.checked)} />
                    </div>
                )}
                
                {activeModules.has('Birthday') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm text-black dark:text-white">Birthday</h4>
                        <div className="flex items-center gap-4">
                            <button onClick={() => birthdayFileInputRef.current?.click()} className="relative w-16 h-16 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center group flex-shrink-0">
                                {birthdayPhoto ? <img src={birthdayPhoto.dataUrl} alt={birthdayName} className="w-full h-full object-cover rounded-full" /> : <User size={32} className="text-gray-400" />}
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"> <Camera size={20} className="text-white" /> </div>
                            </button>
                            <div className="w-full space-y-2">
                                <Input type="text" placeholder="Name" value={birthdayName} onChange={e => setBirthdayName(e.target.value)} />
                                <Input type="date" value={birthdayDob} onChange={e => setBirthdayDob(e.target.value)} />
                            </div>
                        </div>
                        <Select value={birthdayNotifyDays} onChange={e => setBirthdayNotifyDays(Number(e.target.value) as 1|2|7)}> <option value="1">Notify 1 day before</option> <option value="2">2 days before</option> <option value="7">7 days before</option> </Select>
                    </div>
                )}

                {activeModules.has('Expense') && (
                    <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm text-black dark:text-white">Expenses</h4>
                        <Input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} />
                        <div className="space-y-2">
                          {expenseItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                  <Input type="text" value={item.description} onChange={e => handleExpenseItemChange(item.id, 'description', e.target.value)} placeholder="Expense description" />
                                  <Input type="number" value={item.amount} onChange={e => handleExpenseItemChange(item.id, 'amount', e.target.value)} placeholder="Amount (৳)" className="w-32" />
                                  <button type="button" onClick={() => removeExpenseItem(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"> <Trash2 size={16}/> </button>
                              </div>
                          ))}
                        </div>
                        <button type="button" onClick={addExpenseItem} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:underline">+ Add Item</button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EntryEditorView;