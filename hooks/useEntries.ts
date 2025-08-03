
import { useState, useEffect, useCallback } from 'react';
import { Entry, CounterHistory, Task } from '../types';
import { useAuthContext } from '../contexts/AuthContext';

export const useEntries = () => {
  const { currentUser } = useAuthContext();
  const [entries, setEntries] = useState<Entry[]>([]);

  // Effect to load entries when user changes (login/logout)
  useEffect(() => {
    const key = currentUser ? `rough-entries-${currentUser.email}` : 'rough-entries-guest';
    try {
      const storedEntries = localStorage.getItem(key);
      setEntries(storedEntries ? JSON.parse(storedEntries) : []);
    } catch (error) {
      console.error("Failed to load entries from localStorage", error);
      setEntries([]);
    }
  }, [currentUser]);

  // Effect to save entries when they are modified
  useEffect(() => {
    const key = currentUser ? `rough-entries-${currentUser.email}` : 'rough-entries-guest';
    try {
      // Don't save an empty array over existing data on initial load if we're just waiting for the user to be determined.
      if (entries.length === 0 && localStorage.getItem(key) === null) {
          return;
      }
      localStorage.setItem(key, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save entries to localStorage", error);
    }
  }, [entries, currentUser]);

  const addEntry = useCallback((entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    const newEntry: Entry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  const updateEntry = useCallback((updatedEntry: Entry) => {
    setEntries(prev => prev.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const updateCounterValue = useCallback((entryId: string, change: 1 | -1) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.counter) {
        const newCount = entry.counter.count + change;
        const newHistoryEntry: CounterHistory = { value: newCount, timestamp: new Date().toISOString() };
        return {
          ...entry,
          counter: {
            ...entry.counter,
            count: newCount,
            history: [newHistoryEntry, ...entry.counter.history].slice(0, 20)
          }
        };
      }
      return entry;
    }));
  }, []);
  
  const resetCounter = useCallback((entryId: string) => {
    setEntries(prev => prev.map(entry => {
       if (entry.id === entryId && entry.counter) {
          const newHistoryEntry: CounterHistory = { value: 0, timestamp: new Date().toISOString() };
          return { 
              ...entry, 
              counter: {
                  ...entry.counter,
                  count: 0, 
                  history: [newHistoryEntry] 
              }
            };
       }
       return entry;
    }));
  }, []);
  
  const toggleTask = useCallback((entryId: string, taskId: string) => {
    setEntries(prev => prev.map(entry => {
        if (entry.id === entryId && entry.tasks) {
            return {
                ...entry,
                tasks: {
                    ...entry.tasks,
                    tasks: entry.tasks.tasks.map(task => 
                        task.id === taskId ? { ...task, completed: !task.completed } : task
                    )
                }
            };
        }
        return entry;
    }));
  }, []);

  const markTimerAsRinging = useCallback((entryId: string) => {
     setEntries(prev => prev.map(entry => {
       if (entry.id === entryId && entry.timer) {
         return { ...entry, timer: { ...entry.timer, isRinging: true } };
       }
       return entry;
     }));
  }, []);
  
  const updateNotificationState = useCallback((entryId: string, module: 'routine' | 'reminder') => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        if (module === 'routine' && entry.routine) {
          return { ...entry, routine: { ...entry.routine, lastNotified: new Date().toISOString() } };
        }
        if (module === 'reminder' && entry.reminder) {
          return { ...entry, reminder: { ...entry.reminder, lastNotified: new Date().toISOString() } };
        }
      }
      return entry;
    }));
  }, []);
  
  const markBirthdayAsNotified = useCallback((entryId: string, year: number) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.birthday) {
        return {
          ...entry,
          birthday: { ...entry.birthday, lastNotifiedYear: year }
        };
      }
      return entry;
    }));
  }, []);

  const toggleStopwatch = useCallback((entryId: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.stopwatch) {
        const now = Date.now();
        const { isRunning, startTime, elapsedTime } = entry.stopwatch;
        if (isRunning) {
          // Pause
          return {
            ...entry,
            stopwatch: { ...entry.stopwatch, isRunning: false, elapsedTime: elapsedTime + (now - startTime) }
          };
        } else {
          // Start
          return {
            ...entry,
            stopwatch: { ...entry.stopwatch, isRunning: true, startTime: now }
          };
        }
      }
      return entry;
    }));
  }, []);

  const resetStopwatch = useCallback((entryId: string) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.stopwatch) {
        return {
          ...entry,
          stopwatch: { isRunning: false, startTime: 0, elapsedTime: 0 }
        };
      }
      return entry;
    }));
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry, updateCounterValue, resetCounter, toggleTask, markTimerAsRinging, updateNotificationState, toggleStopwatch, resetStopwatch, markBirthdayAsNotified };
};