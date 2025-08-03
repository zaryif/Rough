
export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
export type RepeatOption = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CounterHistory {
  value: number;
  timestamp: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// --- MODULES ---
export interface CounterModule {
  count: number;
  history: CounterHistory[];
}

export interface TimerModule {
  endTime: number;
  duration: number; // in seconds
  isRinging?: boolean;
  requireInteraction?: boolean;
}

export interface RoutineModule {
  name?: string; // Title for the routine when attached to another entry
  days: DayOfWeek[];
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  remindBefore: number; // in minutes
  requireInteraction?: boolean;
  lastNotified?: string; // ISO string
  className?: string; // This is now legacy, topic will be used
  room?: string;
}

export interface ReminderModule {
  remindAt: string; // ISO string
  repeat: RepeatOption;
  requireInteraction?: boolean;
  lastNotified?: string; // ISO string
}

export interface TaskListModule {
    tasks: Task[];
}

export interface CodeModule {
  code: string;
  language: string;
}

export interface StopwatchModule {
  isRunning: boolean;
  startTime: number; // timestamp
  elapsedTime: number; // in milliseconds
}

export interface FileAttachment {
  id: string;
  dataUrl: string;
  name: string;
}

export interface PhotoModule {
  photos: FileAttachment[];
}

export interface PdfModule {
  pdfs: FileAttachment[];
}

export interface LinkModule {
  url: string;
}

export interface BirthdayModule {
  name: string;
  dob: string; // YYYY-MM-DD
  notifyDaysBefore: 1 | 2 | 7;
  lastNotifiedYear?: number;
  photo?: FileAttachment;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  description: string;
}

export interface ExpenseModule {
  items: ExpenseItem[];
  currency: 'BDT';
  date: string; // YYYY-MM-DD
}


// --- The new unified Entry type ---
export interface Entry {
  id: string;
  createdAt: string;
  topic: string;
  description?: string;
  showTimestamp?: boolean;
  // Optional modules that can be attached to any entry
  counter?: CounterModule;
  timer?: TimerModule;
  routine?: RoutineModule;
  reminder?: ReminderModule;
  tasks?: TaskListModule;
  code?: CodeModule;
  stopwatch?: StopwatchModule;
  photo?: PhotoModule;
  pdf?: PdfModule;
  birthday?: BirthdayModule;
  link?: LinkModule;
  expense?: ExpenseModule;
}

// --- AUTH ---
export interface User {
  email: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}
