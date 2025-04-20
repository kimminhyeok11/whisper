import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import PostList from './components/PostList/PostList';
import CircleMenu from './components/CircleMenu/CircleMenu';
import LoadingIndicator from './components/common/LoadingIndicator';

// 지연 로딩되는 컴포넌트들
const PostDetail = lazy(() => import('./components/PostItem/PostDetail'));

function App() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // URL 변경시 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 pb-20 bg-background dark:bg-dark-background">
      <Header />
      
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </Suspense>
      
      <CircleMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    </div>
  );
}

export default App;
