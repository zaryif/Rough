
import React, { useState } from 'react';
import Modal from './Modal';
import { useAuthContext } from '../contexts/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useSettingsContext } from '../contexts/SettingsContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Input = React.memo((props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full p-3 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50" />
));

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuthContext();
  const { theme } = useSettingsContext();
  const [activeTab, setActiveTab] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const response = activeTab === 'signIn' 
      ? await signIn(email, password) 
      : await signUp(email, password);

    setLoading(false);
    if (response.user) {
        onClose();
        setEmail('');
        setPassword('');
    } else {
        setError(response.error);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError(null);
    setLoading(true);
    const response = await signInWithGoogle(credentialResponse);
    setLoading(false);

    if (response.user) {
        onClose();
        setEmail('');
        setPassword('');
    } else {
        setError(response.error);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In Failed");
    setError("Google Sign-In failed. Please try again.");
  };

  const handleClose = () => {
      if(loading) return;
      onClose();
  };

  const handleTabChange = (tab: 'signIn' | 'signUp') => {
      setActiveTab(tab);
      setError(null);
      setEmail('');
      setPassword('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={activeTab === 'signIn' ? "Sign In" : "Create Account"}>
      <div className="space-y-6 pt-2">
        <div className="flex border-b border-gray-200 dark:border-zinc-800">
            <button disabled={loading} onClick={() => handleTabChange('signIn')} className={`flex-1 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${activeTab === 'signIn' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>Sign In</button>
            <button disabled={loading} onClick={() => handleTabChange('signUp')} className={`flex-1 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${activeTab === 'signUp' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>Sign Up</button>
        </div>
        
        <div className="flex justify-center">
            {loading ? (
                <div className="h-10 w-full flex items-center justify-center text-sm text-gray-500">Processing...</div>
            ) : (
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                    shape="pill"
                />
            )}
        </div>

        <div className="flex items-center gap-2">
            <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-800"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-200 dark:bg-zinc-800"></div>
        </div>
        
        <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full p-3 bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Processing...' : (activeTab === 'signIn' ? 'Sign In' : 'Create Account')}
            </button>
        </form>
      </div>
    </Modal>
  );
};

export default LoginModal;
