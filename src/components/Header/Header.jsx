import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiLogIn, BiUser, BiLogOut } from 'react-icons/bi';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';

function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  const handleLoginClick = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };
  
  const handleSignUpClick = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  return (
    <>
      <header className="py-4 sticky top-0 bg-background dark:bg-dark-background z-10">
        <div className="flex justify-between items-center px-4">
          <div className="flex-1">
            {/* 좌측 영역 - 필요한 경우 내용 추가 */}
          </div>
          
          <div className="flex-1 flex justify-center">
            <h1 
              className="text-2xl font-bold text-primary cursor-pointer"
              onClick={() => navigate('/')}
            >
              WHISPER
            </h1>
          </div>
          
          <div className="flex-1 flex justify-end">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  {user.user_metadata?.username || user.email}
                </span>
                <button 
                  className="btn-icon"
                  onClick={handleLogout}
                  title="로그아웃"
                >
                  <BiLogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text flex items-center"
                  onClick={handleLoginClick}
                >
                  <BiLogIn size={18} className="mr-1" />
                  로그인
                </button>
                <button 
                  className="text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text flex items-center"
                  onClick={handleSignUpClick}
                >
                  <BiUser size={18} className="mr-1" />
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authModalMode}
      />
    </>
  );
}

export default Header; 