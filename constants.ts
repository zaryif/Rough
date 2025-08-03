
import React from 'react';
import { StickyNote, Hash, Timer, BellRing, CalendarClock, CheckSquare, Code2, AlarmClock, Image, FileText, Edit, Cake, Link, Wallet } from 'lucide-react';

export type ModuleType = 'Tasks' | 'Counter' | 'Timer' | 'Routine' | 'Reminder' | 'Stopwatch' | 'Photo' | 'PDF' | 'Birthday' | 'Link' | 'Expense';

// All types that can be added as attachments to a base note.
export const ATTACHMENT_TYPES: ModuleType[] = ['Tasks', 'Photo', 'PDF', 'Link', 'Expense', 'Routine', 'Birthday', 'Reminder', 'Counter', 'Timer', 'Stopwatch'];

export const MODULE_ICONS: Record<ModuleType | 'Note' | 'Code' | 'Custom', React.ElementType> = {
  Note: StickyNote, // For the base entry with topic/description
  Tasks: CheckSquare,
  Counter: Hash,
  Timer: Timer,
  Stopwatch: AlarmClock,
  Routine: CalendarClock,
  Reminder: BellRing,
  Photo: Image,
  PDF: FileText,
  Birthday: Cake,
  Code: Code2,
  Custom: Edit,
  Link: Link,
  Expense: Wallet,
};

// The order of types as they appear on the "New Entry" screen.
export const DEFAULT_ENTRY_TYPE_ORDER: (ModuleType | 'Note' | 'Custom' | 'Code')[] = ['Note', 'Tasks', 'Code', 'Photo', 'PDF', 'Link', 'Expense', 'Routine', 'Birthday', 'Reminder', 'Counter', 'Timer', 'Stopwatch', 'Custom'];
