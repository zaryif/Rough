
import React, { useRef, useState } from 'react';
import Modal from './Modal';
import { useSettingsContext } from '../contexts/SettingsContext';
import { useAuthContext } from '../contexts/AuthContext';
import { LogIn, LogOut, ChevronDown } from 'lucide-react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${
      checked ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-zinc-800'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
  >
    <span
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-3 text-left font-medium text-black dark:text-white"
            >
                <span>{title}</span>
                <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && (
                <div className="pb-3 text-sm text-gray-500 dark:text-gray-400 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenLoginModal }) => {
  const { theme, toggleTheme, notificationsEnabled, toggleNotifications, setCustomBackground, clearCustomBackground, isOrganizedView, toggleOrganizedView } = useSettingsContext();
  const { currentUser, signOut } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCustomBackground(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-black dark:text-white">Appearance</h3>
           <div className="flex items-center justify-between">
            <label className="font-medium text-black dark:text-white">Dark Mode</label>
            <ToggleSwitch checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-medium text-black dark:text-white">Background</label>
            <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                    Upload
                </button>
                <input type="file" ref={fileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                <button onClick={clearCustomBackground} className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                    Remove
                </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-zinc-800"></div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-black dark:text-white">General</h3>
          <div className="flex items-center justify-between">
            <label className="font-medium text-black dark:text-white">Enable Notifications</label>
            <ToggleSwitch checked={notificationsEnabled} onChange={toggleNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <label className="font-medium text-black dark:text-white">Organize Entries</label>
            <ToggleSwitch checked={isOrganizedView} onChange={toggleOrganizedView} />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-zinc-800"></div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-black dark:text-white">Account</h3>
          {currentUser ? (
              <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</span>
                  <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors">
                      <LogOut size={14} />
                      Sign Out
                  </button>
              </div>
          ) : (
              <button onClick={onOpenLoginModal} className="w-full flex items-center justify-center gap-2 p-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-90 transition-opacity">
                  <LogIn size={16} />
                  Sign In to Sync Data
              </button>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-zinc-800"></div>
        
        <div className="space-y-1">
             <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Help</h3>
             <div className="rounded-lg bg-gray-100 dark:bg-zinc-900 overflow-hidden">
                <AccordionItem title="How to Use">
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-black dark:text-white">Creating Entries</h4>
                            <p>Tap the '+' button to open the new entry screen. Choose an entry type like 'Note', 'Code', 'Birthday' or 'Tasks'. All creation and editing happens in a full-screen, distraction-free view.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-black dark:text-white">Using Attachments</h4>
                            <p>For any non-specialized entry, you can add powerful modules like Timers, Stopwatches, Task Lists, Photos, and more. In the editor view, find the 'Attachments' section to add functionality to your notes.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-black dark:text-white">Searching & Organizing</h4>
                            <p>Tap the search icon in the header to find entries by title, description, or content. In Settings, enable 'Organize Entries' to activate a filter bar on the main screen. You can also press and hold an entry type on the 'New Entry' screen to drag and reorder it.</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-black dark:text-white">Syncing Data</h4>
                            <p>Sign in with Google or Email to securely save your entries and sync them across sessions. Any entries you create as a guest will be automatically migrated to your account when you first sign in.</p>
                        </div>
                    </div>
                </AccordionItem>
                <AccordionItem title="About the Developer">
                    <div className="space-y-3">
                        <p>Hi, I'm Md Zarif Azfar from Bangladesh.</p>
                        <p>
                            I created this app because I wanted a single, beautiful place to manage all the different parts of my life. Instead of juggling separate apps for notes, tasks, schedules, and budgets, I designed this all-in-one utility to be a powerful and personal digital companion. It's built to be flexible, allowing you to track everything from a simple thought to a detailed daily routine or expense log.
                        </p>
                        <div>
                            <p className="font-medium text-black dark:text-white">You can find me here:</p>
                            <div className="flex space-x-4 mt-1">
                                <a href="https://instagram.com/zaryif" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Instagram (@zaryif)
                                </a>
                                <a href="https://github.com/zarif" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    GitHub (@zarif)
                                </a>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
             </div>
        </div>

      </div>
    </Modal>
  );
};

export default SettingsModal;
