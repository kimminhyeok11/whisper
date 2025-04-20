import { createContext, useState, useContext, useEffect } from 'react';

// 테마 컨텍스트 생성
const ThemeContext = createContext();

// 테마 제공 컴포넌트
export function ThemeProvider({ children }) {
  // 로컬 스토리지에서 테마 설정 불러오기, 기본값은 다크모드
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // 저장된 테마가 없으면 시스템 설정 확인
    if (savedTheme === null) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return savedTheme === 'dark';
  });

  // 테마 변경 함수
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // 테마 변경시 HTML에 클래스 적용 및 로컬 스토리지에 저장
  useEffect(() => {
    // HTML 루트 요소에 테마 클래스 추가/제거
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // 로컬 스토리지에 테마 설정 저장
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 커스텀 훅으로 테마 컨텍스트 사용
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 