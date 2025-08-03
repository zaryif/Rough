
import React, { useRef, useState, useEffect } from 'react';
import { toJpeg } from 'html-to-image';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github, tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Entry, FileAttachment } from '../types';
import { Trash2, Plus, Minus, Download, Play, Pause, RotateCcw, FileText, Cake, Link as LinkIcon, CalendarClock, Wallet, BellRing } from 'lucide-react';
import { MODULE_ICONS } from '../constants';
import { useEntriesContext } from '../contexts/EntriesContext';
import { useSettingsContext } from '../contexts/SettingsContext';

type MediaViewerContent = { type: 'photo'; photos: FileAttachment[]; startIndex: number } | { type: 'pdf'; url: string };

interface EntryListItemProps {
  entry: Entry;
  onDelete: () => void;
  onEdit: () => void;
  onEditCode: () => void;
  onEditBirthdayEntry: () => void;
  onEditRoutineEntry: () => void;
  onEditExpenseEntry: () => void;
  currentTime: number;
  onOpenMediaViewer: (content: MediaViewerContent) => void;
}

const formatStopwatchTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const milliseconds = (ms % 1000).toString().padStart(3, '0').slice(0, 2);
    return `${minutes}:${seconds}.${milliseconds}`;
};

const StopwatchDisplay: React.FC<{ entry: Entry }> = ({ entry }) => {
    const { toggleStopwatch, resetStopwatch } = useEntriesContext();
    const [displayTime, setDisplayTime] = useState(entry.stopwatch?.elapsedTime || 0);

    useEffect(() => {
        if (!entry.stopwatch?.isRunning) {
            setDisplayTime(entry.stopwatch?.elapsedTime || 0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            setDisplayTime((entry.stopwatch?.elapsedTime || 0) + (now - (entry.stopwatch?.startTime || now)));
        }, 50);

        return () => clearInterval(interval);
    }, [entry.stopwatch]);


    if (!entry.stopwatch) return null;

    return (
        <div className="flex items-center space-x-4">
          <span className="text-3xl font-bold font-mono text-black dark:text-white w-32 text-center">{formatStopwatchTime(displayTime)}</span>
          <div className="flex items-center space-x-2">
            <button onClick={() => toggleStopwatch(entry.id)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-black dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                {entry.stopwatch.isRunning ? <Pause size={18}/> : <Play size={18}/>}
            </button>
            <button onClick={() => resetStopwatch(entry.id)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-black dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                <RotateCcw size={16}/>
            </button>
          </div>
       </div>
    );
};


const formatTime = (seconds: number) => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

const EntryListItem: React.FC<EntryListItemProps> = ({ entry, onDelete, onEdit, onEditCode, onEditBirthdayEntry, onEditRoutineEntry, onEditExpenseEntry, currentTime, onOpenMediaViewer }) => {
  const { updateCounterValue, resetCounter, toggleTask } = useEntriesContext();
  const { theme } = useSettingsContext();
  const codeDownloadRef = useRef<HTMLDivElement>(null);

  const activeModules = [
    (entry.description || !Object.keys(entry).some(k => ['tasks', 'counter', 'timer', 'routine', 'reminder', 'stopwatch', 'photo', 'pdf', 'birthday', 'link', 'expense'].includes(k))) && 'Note',
    entry.tasks && 'Tasks',
    entry.counter && 'Counter',
    entry.timer && 'Timer',
    entry.stopwatch && 'Stopwatch',
    entry.reminder && 'Reminder',
    entry.photo && entry.photo.photos.length > 0 && 'Photo',
    entry.pdf && entry.pdf.pdfs.length > 0 && 'PDF',
    entry.link && 'Link',
    entry.birthday && 'Birthday',
    entry.expense && 'Expense',
    entry.routine && 'Routine'
  ].filter(Boolean) as (keyof typeof MODULE_ICONS)[];
  
  const isPureEntry = (prop: keyof Entry) => {
    // An entry is "pure" if it has one primary module and no others (like description, tasks, etc.)
    const mainProps: (keyof Entry)[] = ['description', 'tasks', 'counter', 'timer', 'stopwatch', 'reminder', 'photo', 'pdf', 'link', 'routine', 'birthday', 'expense'];
    return entry[prop] && !mainProps.some(p => p !== prop && entry[p]);
  }
  
  const isPureBirthday = isPureEntry('birthday');
  const isPureRoutine = isPureEntry('routine');
  const isPureExpense = isPureEntry('expense');

  const handleDownloadCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (codeDownloadRef.current === null) {
      return;
    }
    toJpeg(codeDownloadRef.current, { 
        quality: 0.95, 
        backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${entry.topic.replace(/\s+/g, '_') || 'code-snippet'}.jpeg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  };
  
  if (isPureBirthday && entry.birthday) {
    const { name, dob, photo } = entry.birthday;
    const now = new Date();
    const birthDate = new Date(dob);
    birthDate.setMinutes(birthDate.getMinutes() + birthDate.getTimezoneOffset());
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();

    let nextBirthday = new Date(now.getFullYear(), birthMonth, birthDay);
    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }
    const age = nextBirthday.getFullYear() - birthYear;
    const diffTime = nextBirthday.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return (
        <li className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 transition-colors duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700" onClick={onEditBirthdayEntry}>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); if (photo) onOpenMediaViewer({ type: 'photo', photos: [photo], startIndex: 0 }); }}>
                    {photo ? (
                        <img src={photo.dataUrl} alt={name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Cake size={32} className="text-gray-400 dark:text-zinc-500" />
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-black dark:text-white">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {diffDays === 0 ? `Turns ${age} today!` : `Turns ${age} in ${diffDays} day${diffDays > 1 ? 's' : ''}`}
                    </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
  }
  
  if (isPureRoutine && entry.routine) {
      const { startTime, endTime, days, room } = entry.routine;
      return (
        <li className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 transition-colors duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700" onClick={onEditRoutineEntry}>
            <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-20 bg-gray-100 dark:bg-zinc-800 rounded-lg p-2">
                    <span className="text-xl font-bold text-black dark:text-white">{startTime}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">to</span>
                    <span className="text-xl font-bold text-black dark:text-white">{endTime}</span>
                </div>
                <div className="flex-grow">
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-black dark:text-white mb-1">{entry.topic}</h3>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    {room && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Location: {room}</p>}
                    <p className="text-sm font-medium text-black dark:text-white">{days.join(', ')}</p>
                </div>
            </div>
        </li>
      );
  }

  if (isPureExpense && entry.expense) {
      const { items, date } = entry.expense;
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      const displayDate = new Date(date);
      displayDate.setMinutes(displayDate.getMinutes() + displayDate.getTimezoneOffset()); // Adjust for timezone

      return (
        <li className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 transition-colors duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700" onClick={onEditExpenseEntry}>
            <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center justify-center w-20 bg-gray-100 dark:bg-zinc-800 rounded-lg p-2 text-center">
                    <span className="text-sm font-bold text-black dark:text-white uppercase">{displayDate.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl font-extrabold text-black dark:text-white">{displayDate.getDate()}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{displayDate.getFullYear()}</span>
                </div>
                <div className="flex-grow">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-black dark:text-white">Daily Expenses</h3>
                         <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                        {items.slice(0, 3).map(item => (
                             <div key={item.id} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                                <span>{item.description}</span>
                                <span className="font-mono">{item.amount.toLocaleString('en-US')} ৳</span>
                            </div>
                        ))}
                        {items.length > 3 && <p className="text-xs text-gray-400 dark:text-zinc-500 text-center pt-1">...and {items.length - 3} more</p>}
                    </div>

                </div>
            </div>
             <div className="pt-3 mt-3 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center font-bold text-black dark:text-white">
                <span>Total</span>
                <span className="font-mono">{total.toLocaleString('en-US')} ৳</span>
           </div>
        </li>
      );
  }

  if (entry.code) {
      return (
        <li
            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-0 overflow-hidden space-y-3 transition-colors duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700"
            onClick={onEditCode}
        >
          <div ref={codeDownloadRef} className="p-4 bg-white dark:bg-zinc-900">
            <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-black dark:text-white">{entry.topic}</h3>
                  {entry.showTimestamp && <p className="text-xs text-gray-400 dark:text-zinc-500">{formatTimestamp(entry.createdAt)}</p>}
                </div>
            </div>
            <div className="rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700 text-sm">
                <SyntaxHighlighter language={entry.code.language} style={theme === 'dark' ? tomorrowNight : github} customStyle={{ margin: 0, padding: '1rem' }} showLineNumbers>
                    {entry.code.code}
                </SyntaxHighlighter>
            </div>
          </div>
          <div className="flex justify-end items-center gap-2 p-2 px-4 border-t border-gray-200 dark:border-zinc-800">
              <button onClick={handleDownloadCode} className="flex items-center gap-1.5 text-xs p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  <Download size={14} />
                  JPG
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex items-center gap-1.5 text-xs p-2 rounded-md text-red-500 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} />
                  Delete
              </button>
          </div>
        </li>
      )
  }

  return (
    <li className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4 space-y-3 transition-colors duration-200 cursor-pointer hover:border-gray-300 dark:hover:border-zinc-700" onClick={onEdit}>
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            {activeModules.map(moduleName => {
                const Icon = MODULE_ICONS[moduleName];
                return <Icon key={moduleName} className="w-4 h-4 text-gray-400 dark:text-zinc-400" />;
            })}
          </div>
          <p className="font-semibold text-black dark:text-white break-words">{entry.topic}</p>
        </div>
        <div className="flex items-center gap-3 pl-2" onClick={e => e.stopPropagation()}>
         {entry.showTimestamp && <p className="text-xs text-gray-400 dark:text-zinc-500">{formatTimestamp(entry.createdAt)}</p>}
         {entry.timer && (
            <div className={`text-sm font-mono font-semibold ${entry.timer.isRinging || (entry.timer.endTime - currentTime) <= 0 ? 'text-red-500 animate-pulse' : 'text-black dark:text-white'}`}>
                {entry.timer.isRinging || (entry.timer.endTime - currentTime) <= 0 ? 'Finished' : formatTime(Math.round((entry.timer.endTime - currentTime) / 1000))}
            </div>
         )}
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {entry.description && <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{entry.description}</p>}
      
      {entry.photo && entry.photo.photos.length > 0 && (() => {
          const photos = entry.photo.photos;
          const photoCount = photos.length;
          let gridClass = "grid-cols-3";
          if (photoCount === 1) gridClass = "grid-cols-1";
          else if (photoCount === 2 || photoCount === 4) gridClass = "grid-cols-2";
          
          return (
            <div className={`mt-2 grid ${gridClass} gap-1`}>
                {photos.slice(0, 4).map((p, index) => (
                    <div key={p.id} className="relative aspect-square bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group" onClick={(e) => {
                        e.stopPropagation();
                        onOpenMediaViewer({ type: 'photo', photos: entry.photo!.photos, startIndex: index });
                    }}>
                        <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                        {photoCount > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">+{photoCount - 4}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          );
      })()}

      {entry.pdf && entry.pdf.pdfs.length > 0 && (
          <div className="mt-2 space-y-2">
              {entry.pdf.pdfs.map(p => (
                  <a key={p.id} href={p.dataUrl} onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenMediaViewer({ type: 'pdf', url: p.dataUrl });
                  }} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                      <FileText size={20} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-black dark:text-white truncate">{p.name}</span>
                  </a>
              ))}
          </div>
      )}

      {entry.link && (
        <a 
          href={entry.link.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={e => e.stopPropagation()} 
          className="mt-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors group"
        >
          <LinkIcon size={20} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-blue-500 dark:text-blue-400 truncate group-hover:underline">{entry.link.url}</span>
        </a>
      )}

       <div className="space-y-4 pt-1" onClick={e => e.stopPropagation()}>
         {entry.tasks && (
            <ul className="space-y-2">
              {entry.tasks.tasks.map(task => (
                <li key={task.id} className="flex items-center gap-3">
                    <input 
                        type="checkbox"
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onChange={() => toggleTask(entry.id, task.id)}
                        className="w-5 h-5 rounded text-black dark:text-white bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-black dark:focus:ring-white"
                    />
                    <label htmlFor={`task-${task.id}`} className={`flex-grow text-sm ${task.completed ? 'line-through text-gray-500' : 'text-black dark:text-white'}`}>{task.text}</label>
                </li>
              ))}
            </ul>
         )}

         {entry.counter && (
           <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-black dark:text-white w-16 text-center">{entry.counter.count}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => updateCounterValue(entry.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-black dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><Minus size={16}/></button>
                <button onClick={() => updateCounterValue(entry.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-black dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"><Plus size={16}/></button>
                <button onClick={() => resetCounter(entry.id)} className="px-3 py-1 text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors">Reset</button>
              </div>
           </div>
         )}
        
         {entry.stopwatch && <StopwatchDisplay entry={entry} />}
         
         {entry.reminder && (
            <div className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                <BellRing className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-black dark:text-white">Remind at: {new Date(entry.reminder.remindAt).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Repeats: <span className="font-medium capitalize">{entry.reminder.repeat}</span></p>
                </div>
           </div>
         )}

         {entry.routine && (
            <div className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                <CalendarClock className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-sm text-black dark:text-white">{entry.routine.name || 'Routine'}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.routine.startTime} - {entry.routine.endTime}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{entry.routine.days.join(', ')}</p>
                </div>
            </div>
         )}

         {entry.birthday && (
             <div className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
                <Cake className="w-5 h-5 mt-1 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-sm text-black dark:text-white">Birthday: {entry.birthday.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(entry.birthday.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                </div>
            </div>
         )}
         
         {entry.expense && (
            <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm text-black dark:text-white">Expenses for {new Date(entry.expense.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' })}</h4>
                    <Wallet className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="text-xs space-y-1">
                    {entry.expense.items.slice(0, 2).map(item => (
                         <div key={item.id} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                            <span>{item.description}</span>
                            <span className="font-mono">{item.amount.toLocaleString('en-US')} ৳</span>
                        </div>
                    ))}
                    {entry.expense.items.length > 2 && <p className="text-gray-400 dark:text-zinc-500 text-center pt-1">... and {entry.expense.items.length - 2} more</p>}
                </div>
                 <div className="pt-2 mt-2 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center font-bold text-xs text-black dark:text-white">
                    <span>TOTAL</span>
                    <span className="font-mono">{entry.expense.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString('en-US')} ৳</span>
               </div>
            </div>
         )}

       </div>
    </li>
  );
};

export default EntryListItem;
