
import React, { useEffect, useState, useMemo } from 'react';
import { useEntriesContext } from '../contexts/EntriesContext';
import { useSettingsContext } from '../contexts/SettingsContext';
import EntryListItem from './EntryListItem';
import { sendNotification } from '../services/notificationService';
import { DayOfWeek, Entry, FileAttachment } from '../types';
import { ModuleType } from '../constants';

const DAY_MAP: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

type MediaViewerContent = { type: 'photo'; photos: FileAttachment[]; startIndex: number } | { type: 'pdf'; url: string };

interface EntryListProps {
  onEditEntry: (entry: Entry) => void;
  onEditCodeEntry: (entry: Entry) => void;
  onEditBirthdayEntry: (entry: Entry) => void;
  onEditRoutineEntry: (entry: Entry) => void;
  onEditExpenseEntry: (entry: Entry) => void;
  filter: ModuleType | 'all' | 'Code';
  onOpenMediaViewer: (content: MediaViewerContent) => void;
  searchQuery: string;
}

const EntryList: React.FC<EntryListProps> = ({ onEditEntry, onEditCodeEntry, onEditBirthdayEntry, onEditRoutineEntry, onEditExpenseEntry, filter, onOpenMediaViewer, searchQuery }) => {
  const { entries, deleteEntry, markTimerAsRinging, updateNotificationState, markBirthdayAsNotified } = useEntriesContext();
  const { notificationsEnabled } = useSettingsContext();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const filteredEntries = useMemo(() => {
    let tempEntries = entries;

    if (filter !== 'all') {
      tempEntries = tempEntries.filter(entry => {
        switch(filter) {
            case 'Code': return !!entry.code;
            case 'Tasks': return !!entry.tasks;
            case 'Counter': return !!entry.counter;
            case 'Timer': return !!entry.timer;
            case 'Stopwatch': return !!entry.stopwatch;
            case 'Routine': return !!entry.routine;
            case 'Reminder': return !!entry.reminder;
            case 'Birthday': return !!entry.birthday;
            case 'Photo': return !!entry.photo && entry.photo.photos.length > 0;
            case 'PDF': return !!entry.pdf && entry.pdf.pdfs.length > 0;
            case 'Link': return !!entry.link;
            case 'Expense': return !!entry.expense;
            default: return false;
        }
      });
    }

    if (searchQuery.trim() !== '') {
        const lowerCaseQuery = searchQuery.toLowerCase();
        tempEntries = tempEntries.filter(entry => {
            const topicMatch = entry.topic.toLowerCase().includes(lowerCaseQuery);
            const descriptionMatch = entry.description?.toLowerCase().includes(lowerCaseQuery);
            const tasksMatch = entry.tasks?.tasks.some(task => task.text.toLowerCase().includes(lowerCaseQuery));
            const codeMatch = entry.code?.code.toLowerCase().includes(lowerCaseQuery);
            const birthdayMatch = entry.birthday?.name.toLowerCase().includes(lowerCaseQuery);
            const linkMatch = entry.link?.url.toLowerCase().includes(lowerCaseQuery);
            const expenseMatch = entry.expense?.items.some(item => item.description.toLowerCase().includes(lowerCaseQuery) || item.amount.toString().includes(lowerCaseQuery));
            return topicMatch || descriptionMatch || tasksMatch || codeMatch || birthdayMatch || linkMatch || expenseMatch;
        });
    }

    return tempEntries;
  }, [entries, filter, searchQuery]);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const now = new Date(currentTime);

    entries.forEach(entry => {
      // Timer Notifications
      if (entry.timer && !entry.timer.isRinging && currentTime >= entry.timer.endTime) {
        sendNotification(`Timer Finished: ${entry.topic}`, { 
            body: entry.description || 'Your timer is done!',
            requireInteraction: entry.timer.requireInteraction,
        });
        markTimerAsRinging(entry.id);
      }

      // Reminder Notifications
      if (entry.reminder) {
          const remindAtDate = new Date(entry.reminder.remindAt);
          // TODO: Add logic for repeat options
          const hasBeenNotified = entry.reminder.lastNotified;
          if (!hasBeenNotified && now >= remindAtDate) {
              sendNotification(`Reminder: ${entry.topic}`, {
                  body: entry.description || 'This is your reminder.',
                  requireInteraction: entry.reminder.requireInteraction,
              });
              updateNotificationState(entry.id, 'reminder');
          }
      }

      // Routine Notifications
      if (entry.routine) {
        const { days, startTime, remindBefore, requireInteraction, lastNotified } = entry.routine;
        const currentDay = DAY_MAP[now.getDay()];
        const hasBeenNotifiedToday = lastNotified && isSameDay(new Date(lastNotified), now);

        if (days.includes(currentDay) && !hasBeenNotifiedToday) {
            const [hours, minutes] = startTime.split(':').map(Number);
            
            const routineTimeToday = new Date(now);
            routineTimeToday.setHours(hours, minutes, 0, 0);

            const notificationTime = new Date(routineTimeToday.getTime() - remindBefore * 60 * 1000);

            if (now >= notificationTime) {
                const bodyText = remindBefore > 0 
                  ? `Routine: ${entry.topic} starts in ${remindBefore} minutes at ${startTime}.` 
                  : `It's time for your routine: ${entry.topic} at ${startTime}.`;

                sendNotification(`Routine Reminder`, {
                  body: bodyText,
                  requireInteraction: requireInteraction,
                });
                updateNotificationState(entry.id, 'routine');
            }
        }
      }

      // Birthday Notifications
      if (entry.birthday) {
        const { name, dob, notifyDaysBefore, lastNotifiedYear } = entry.birthday;
        const [birthYear, birthMonth, birthDay] = dob.split('-').map(Number);
        
        let nextBirthday = new Date(now.getFullYear(), birthMonth - 1, birthDay);
        if (nextBirthday.getTime() < now.getTime() - (1000 * 60 * 60 * 24)) { // check if birthday has already passed
            nextBirthday.setFullYear(now.getFullYear() + 1);
        }

        const upcomingBirthdayYear = nextBirthday.getFullYear();
        const age = upcomingBirthdayYear - birthYear;

        const diffTime = nextBirthday.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= notifyDaysBefore && lastNotifiedYear !== upcomingBirthdayYear) {
          const title = `Birthday Reminder: ${name}`;
          const body = diffDays > 0 ? `${name} is turning ${age} in ${diffDays} day${diffDays > 1 ? 's' : ''}!` : `It's ${name}'s birthday! They are turning ${age} today.`;
          sendNotification(title, { body });
          markBirthdayAsNotified(entry.id, upcomingBirthdayYear);
        }
      }
    });
  }, [currentTime, notificationsEnabled, entries, markTimerAsRinging, updateNotificationState, markBirthdayAsNotified]);


  if (filteredEntries.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-inbox mb-4"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            <h3 className="text-lg font-semibold text-black dark:text-white">No Entries Found</h3>
            <p className="mt-1 text-sm">{searchQuery ? "No entries match your search." : (filter === 'all' ? "Tap the '+' button to add your first item." : "No items match the current filter.")}</p>
        </div>
    );
  }

  return (
    <div className="flex-grow px-4 overflow-y-auto pb-24 no-scrollbar">
      <ul className="space-y-3">
        {filteredEntries.map((entry) => (
          <EntryListItem 
            key={entry.id} 
            entry={entry} 
            onDelete={() => deleteEntry(entry.id)} 
            onEdit={() => onEditEntry(entry)}
            onEditCode={() => onEditCodeEntry(entry)}
            onEditBirthdayEntry={() => onEditBirthdayEntry(entry)}
            onEditRoutineEntry={() => onEditRoutineEntry(entry)}
            onEditExpenseEntry={() => onEditExpenseEntry(entry)}
            currentTime={currentTime}
            onOpenMediaViewer={onOpenMediaViewer}
          />
        ))}
      </ul>
    </div>
  );
};

export default EntryList;