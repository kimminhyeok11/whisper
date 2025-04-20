import { useState } from 'react';
import { BiX, BiUser, BiLock, BiEnvelope } from 'react-icons/bi';
import { useAuth } from '../../contexts/AuthContext';

function SignUpForm({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 입력 검증
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    if (!username.trim()) {
      setError('사용자 이름을 입력해주세요.');
      return;
    }
    
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signUp(email, password, username);
      setIsLoading(false);
      // 이메일 확인 안내 메시지 표시
      alert('가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.');
      onClose(); // 회원가입 완료 후 모달 닫기
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 dark:bg-dark-background-dark dark:bg-opacity-90 z-50 flex justify-center items-center">
      <div className="bg-background dark:bg-dark-background w-full max-w-md rounded-lg shadow-xl m-4">
        <div className="flex justify-between items-center p-4 border-b border-background-light dark:border-dark-background-light">
          <h2 className="text-lg font-medium dark:text-dark-text">회원가입</h2>
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
              <label htmlFor="username" className="block text-sm font-medium mb-1 dark:text-dark-text">사용자 이름</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary dark:text-dark-text-secondary">
                  <BiUser size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background-light dark:bg-dark-background-light bg-opacity-50 rounded border border-background-light dark:border-dark-background-light focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="사용자 이름"
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
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1 dark:text-dark-text">비밀번호 확인</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary dark:text-dark-text-secondary">
                  <BiLock size={20} />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
            
            <div className="text-center text-sm dark:text-dark-text">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                로그인
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm; 