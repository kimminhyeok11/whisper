import { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  
  if (!isOpen) return null;
  
  const switchToLogin = () => setMode('login');
  const switchToSignUp = () => setMode('signup');
  
  return (
    <>
      {mode === 'login' ? (
        <LoginForm onClose={onClose} onSwitchToSignUp={switchToSignUp} />
      ) : (
        <SignUpForm onClose={onClose} onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
}

export default AuthModal; 