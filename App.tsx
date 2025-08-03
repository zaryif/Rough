
import React, { useState, useEffect, useCallback } from 'react';
import { EntriesProvider, useEntriesContext } from './contexts/EntriesContext';
import { SettingsProvider, useSettingsContext } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import EntryList from './components/EntryList';
import FloatingActionButton from './components/FloatingActionButton';
import { ModuleType } from './constants';
import { Entry, FileAttachment } from './types';
import SelectEntryTypeView from './components/SelectEntryTypeView';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal';
import CodeEditorView from './components/CodeEditorView';
import EntryEditorView from './components/EntryEditorView';
import BirthdayEditorView from './components/BirthdayEditorView';
import RoutineEditorView from './components/RoutineEditorView';
import ExpenseEditorView from './components/ExpenseEditorView';
import { Settings, SquarePen, Search, X } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import FilterBar from './components/FilterBar';
import MediaViewer from './components/MediaViewer';
import GoogleClientSetupGuide from './components/GoogleClientSetupGuide';

type MediaViewerContent = { type: 'photo'; photos: FileAttachment[]; startIndex: number } | { type: 'pdf'; url: string };

const AppContent: React.FC = () => {
  const { addEntry, updateEntry } = useEntriesContext();
  const { isOrganizedView } = useSettingsContext();
  const [view, setView] = useState<'list' | 'codeEditor' | 'entryEditor' | 'selectEntryType' | 'birthdayEditor' | 'routineEditor' | 'expenseEditor'>('list');
  
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingCodeEntry, setEditingCodeEntry] = useState<Entry | null>(null);
  const [editingBirthdayEntry, setEditingBirthdayEntry] = useState<Entry | null>(null);
  const [editingRoutineEntry, setEditingRoutineEntry] = useState<Entry | null>(null);
  const [editingExpenseEntry, setEditingExpenseEntry] = useState<Entry | null>(null);
  const [newEntryType, setNewEntryType] = useState<ModuleType | 'Note' | 'Custom' | 'Stopwatch' | null>(null);

  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [filter, setFilter] = useState<ModuleType | 'all' | 'Code'>('all');
  const [mediaViewerContent, setMediaViewerContent] = useState<MediaViewerContent | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const handleOpenMediaViewer = useCallback((content: MediaViewerContent) => {
    setMediaViewerContent(content);
  }, []);

  const handleCloseMediaViewer = useCallback(() => {
    setMediaViewerContent(null);
  }, []);

  const handleSelectType = useCallback((type: ModuleType | 'Note' | 'Custom' | 'Code' | 'Stopwatch' | 'Birthday' | 'Routine' | 'Expense') => {
    if (type === 'Code') {
      setEditingCodeEntry(null);
      setView('codeEditor');
    } else if (type === 'Birthday') {
      setEditingBirthdayEntry(null);
      setView('birthdayEditor');
    } else if (type === 'Routine') {
      setEditingRoutineEntry(null);
      setView('routineEditor');
    } else if (type === 'Expense') {
      setEditingExpenseEntry(null);
      setView('expenseEditor');
    }
    else {
      setEditingEntry(null);
      setNewEntryType(type as any); //TS doesn't like the union narrowing here, 'any' is safe
      setView('entryEditor');
    }
  }, []);

  const handleOpenAddView = () => {
    setView('selectEntryType');
  };
  
  const handleOpenLoginModal = () => {
    setSettingsModalOpen(false);
    setLoginModalOpen(true);
  };
  
  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setNewEntryType(null);
    setView('entryEditor');
  };

  const handleEditBirthdayEntry = (entry: Entry) => {
    setEditingBirthdayEntry(entry);
    setView('birthdayEditor');
  };
  
  const handleEditRoutineEntry = (entry: Entry) => {
    setEditingRoutineEntry(entry);
    setView('routineEditor');
  };
  
  const handleEditExpenseEntry = (entry: Entry) => {
    setEditingExpenseEntry(entry);
    setView('expenseEditor');
  };

  const handleEditCode = (entry: Entry) => {
    setEditingCodeEntry(entry);
    setView('codeEditor');
  };

  const handleSaveEntry = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    if (editingEntry) {
      updateEntry({ ...editingEntry, ...entryData });
    } else {
      addEntry(entryData);
    }
    setView('list');
    setEditingEntry(null);
    setNewEntryType(null);
  }

  const handleSaveBirthdayEntry = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    if (editingBirthdayEntry) {
      updateEntry({ ...editingBirthdayEntry, ...entryData });
    } else {
      addEntry(entryData);
    }
    setView('list');
    setEditingBirthdayEntry(null);
  };
  
  const handleSaveRoutineEntry = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    if (editingRoutineEntry) {
      updateEntry({ ...editingRoutineEntry, ...entryData });
    } else {
      addEntry(entryData);
    }
    setView('list');
    setEditingRoutineEntry(null);
  };

  const handleSaveExpenseEntry = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    if (editingExpenseEntry) {
      updateEntry({ ...editingExpenseEntry, ...entryData });
    } else {
      addEntry(entryData);
    }
    setView('list');
    setEditingExpenseEntry(null);
  };

  const handleSaveCode = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    if (editingCodeEntry) {
      updateEntry({ ...editingCodeEntry, ...entryData });
    } else {
      addEntry(entryData);
    }
    setView('list');
    setEditingCodeEntry(null);
  };
  
  const handleCloseViews = () => {
    setView('list');
    setEditingEntry(null);
    setEditingCodeEntry(null);
    setEditingBirthdayEntry(null);
    setEditingRoutineEntry(null);
    setEditingExpenseEntry(null);
    setNewEntryType(null);
  }

  if (view === 'selectEntryType') {
    return <SelectEntryTypeView onSelect={handleSelectType} onClose={handleCloseViews} />;
  }

  if (view === 'codeEditor') {
    return <CodeEditorView entry={editingCodeEntry} onSave={handleSaveCode} onClose={handleCloseViews} />;
  }

  if (view === 'entryEditor') {
      return <EntryEditorView entry={editingEntry} newEntryType={newEntryType} onSave={handleSaveEntry} onClose={handleCloseViews} />
  }

  if (view === 'birthdayEditor') {
    return <BirthdayEditorView entry={editingBirthdayEntry} onSave={handleSaveBirthdayEntry} onClose={handleCloseViews} />
  }
  
  if (view === 'routineEditor') {
    return <RoutineEditorView entry={editingRoutineEntry} onSave={handleSaveRoutineEntry} onClose={handleCloseViews} />
  }

  if (view === 'expenseEditor') {
    return <ExpenseEditorView entry={editingExpenseEntry} onSave={handleSaveExpenseEntry} onClose={handleCloseViews} />
  }

  return (
    <Layout>
      <header className="px-5 pt-6 pb-2 flex justify-between items-center flex-shrink-0">
        {isSearching ? (
          <div className="flex-grow flex items-center gap-2">
            <Search size={20} className="text-gray-400 dark:text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full bg-transparent focus:outline-none text-black dark:text-white"
              autoFocus
            />
            <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <SquarePen size={28} className="text-black dark:text-white" />
              <h1 className="text-3xl font-extrabold text-black dark:text-white">Rough</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSearching(true)} className="p-2 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                <Search size={20} />
              </button>
              <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded-full text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </>
        )}
      </header>
      {isOrganizedView && <FilterBar currentFilter={filter} onFilterChange={setFilter} />}
      <EntryList 
        onEditEntry={handleEditEntry} 
        onEditCodeEntry={handleEditCode}
        onEditBirthdayEntry={handleEditBirthdayEntry}
        onEditRoutineEntry={handleEditRoutineEntry}
        onEditExpenseEntry={handleEditExpenseEntry}
        filter={filter} 
        onOpenMediaViewer={handleOpenMediaViewer} 
        searchQuery={searchQuery}
      />
      <FloatingActionButton onClick={handleOpenAddView} />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenLoginModal={handleOpenLoginModal}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
      {mediaViewerContent && (
          <MediaViewer content={mediaViewerContent} onClose={handleCloseMediaViewer} />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  // IMPORTANT: Replace with your actual Google Client ID from Google Cloud Console
  const clientId = '661529674485-e7org45guct5fk85h35m0ekd2fo9l6hj.apps.googleusercontent.com';
  
  if (clientId.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      return <GoogleClientSetupGuide />;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <SettingsProvider>
          <EntriesProvider>
            <AppContent />
          </EntriesProvider>
        </SettingsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;