import { useState } from 'react';
import { BiX, BiUser, BiLock, BiEnvelope } from 'react-icons/bi';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm({ onClose, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      onClose(); // 로그인 성공 시 모달 닫기
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 dark:bg-dark-background-dark dark:bg-opacity-90 z-50 flex justify-center items-center">
      <div className="bg-background dark:bg-dark-background w-full max-w-md rounded-lg shadow-xl m-4">
        <div className="flex justify-between items-center p-4 border-b border-background-light dark:border-dark-background-light">
          <h2 className="text-lg font-medium dark:text-dark-text">로그인</h2>
          <button className="btn-icon" onClick={onClose}>
            <BiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-dark-text">이메일</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary dark:text-dark-text-secondary">
                  <BiEnvelope size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background-light dark:bg-dark-background-light bg-opacity-50 rounded border border-background-light dark:border-dark-background-light focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="your-email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-dark-text">비밀번호</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary dark:text-dark-text-secondary">
                  <BiLock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background-light dark:bg-dark-background-light bg-opacity-50 rounded border border-background-light dark:border-dark-background-light focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-full py-2 text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
            
            <div className="text-center text-sm dark:text-dark-text">
              계정이 없으신가요?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={onSwitchToSignUp}
                disabled={isLoading}
              >
                회원가입
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm; 