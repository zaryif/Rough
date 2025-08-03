
import React from 'react';
import { SquarePen, Info, Copy } from 'lucide-react';

const CodeBlock = ({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 text-white p-4 rounded-md relative font-mono text-sm">
            <pre><code>{text}</code></pre>
            <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
                {copied ? <span className="text-xs">Copied!</span> : <Copy size={16} />}
            </button>
        </div>
    );
};


const GoogleClientSetupGuide: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-gray-100 dark:bg-black flex flex-col items-center justify-center p-4 text-black dark:text-white antialiased">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
            <SquarePen size={32} />
            <h1 className="text-3xl font-extrabold">Welcome to Rough!</h1>
        </div>
        
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 flex items-start gap-3">
            <Info size={20} className="flex-shrink-0 mt-0.5"/>
            <div>
                <h2 className="font-bold">One Last Step: Configure Google Sign-In</h2>
                <p className="text-sm">To enable secure sign-in and data sync, you need to provide your own Google Client ID. This is a one-time setup.</p>
            </div>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <p><strong className="text-black dark:text-white">Step 1:</strong> Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a>.</p>
            <p><strong className="text-black dark:text-white">Step 2:</strong> Create a new project or select an existing one.</p>
            <p><strong className="text-black dark:text-white">Step 3:</strong> Navigate to "APIs & Services" &rarr; "Credentials". Click "+ CREATE CREDENTIALS" and select "OAuth client ID".</p>
            <p><strong className="text-black dark:text-white">Step 4:</strong> Choose "Web application" as the application type.</p>
            <p><strong className="text-black dark:text-white">Step 5:</strong> Under "Authorized JavaScript origins," add your application's URL (e.g., `http://localhost:3000` for local development).</p>
            <p><strong className="text-black dark:text-white">Step 6:</strong> Under "Authorized redirect URIs," add your application's URL as well.</p>
            <p><strong className="text-black dark:text-white">Step 7:</strong> Click "Create". You will be given a Client ID.</p>
            <p><strong className="text-black dark:text-white">Step 8:</strong> Open the `App.tsx` file in your project, find the `clientId` constant, and replace the placeholder value with the Client ID you just created.</p>
        </div>

        <div className="space-y-2">
            <p className="font-medium text-black dark:text-white">Find this line in `App.tsx`:</p>
            <CodeBlock text={`const clientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';`} />
        </div>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-4">Once you've updated the Client ID, please refresh this page.</p>

      </div>
    </div>
  );
};

export default GoogleClientSetupGuide;
