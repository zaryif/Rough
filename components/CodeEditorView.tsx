
import React, { useState, useEffect } from 'react';
import { Entry } from '../types';
import { ChevronLeft } from 'lucide-react';

interface CodeEditorViewProps {
  entry: Entry | null;
  onSave: (entryData: Omit<Entry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const Checkbox = React.memo(({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
        <input type="checkbox" {...props} className="w-4 h-4 rounded text-black dark:text-white bg-gray-200 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 focus:ring-black dark:focus:ring-white" />
        {label}
    </label>
));


const CodeEditorView: React.FC<CodeEditorViewProps> = ({ entry, onSave, onClose }) => {
  const [topic, setTopic] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [showTimestamp, setShowTimestamp] = useState(true);

  useEffect(() => {
    if (entry) {
      setTopic(entry.topic);
      setShowTimestamp(entry.showTimestamp ?? true);
      if (entry.code) {
        setCode(entry.code.code);
        setLanguage(entry.code.language);
      }
    } else {
        setTopic('');
        setCode('');
        setLanguage('javascript');
        setShowTimestamp(true);
    }
  }, [entry]);

  const handleSave = () => {
    if (!topic.trim() || !code.trim()) {
      alert('Title and code cannot be empty.');
      return;
    }
    onSave({
      topic,
      showTimestamp,
      code: {
        code,
        language,
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
      <div className="flex-grow flex flex-col p-4 overflow-y-auto no-scrollbar">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Code snippet title..."
          className="w-full bg-transparent text-2xl font-bold focus:outline-none mb-4"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mb-4 self-start p-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="json">JSON</option>
          <option value="typescript">TypeScript</option>
          <option value="jsx">JSX</option>
          <option value="tsx">TSX</option>
          <option value="markdown">Markdown</option>
          <option value="bash">Bash</option>
        </select>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste your code here..."
          className="w-full flex-grow bg-white dark:bg-zinc-900 p-4 rounded-lg focus:outline-none font-mono text-sm resize-none no-scrollbar border border-gray-200 dark:border-zinc-800"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditorView;
