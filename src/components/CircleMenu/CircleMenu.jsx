import { useState } from 'react';
import { 
  BiPlus, BiX, BiSearch, BiStats, BiMoon, 
  BiSun, BiImage, BiBookmark, BiShare 
} from 'react-icons/bi';
import PostForm from '../PostForm/PostForm';
import SearchModal from '../Search/SearchModal';
import StatsModal from '../Stats/StatsModal';
import { useTheme } from '../../contexts/ThemeContext';

function CircleMenu({ isOpen, setIsOpen }) {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  
  const toggleMenu = () => {
    if (showPostForm) {
      setShowPostForm(false);
      return;
    }
    setIsOpen(!isOpen);
    setShowSubMenu(false);
  };
  
  const handleNewPost = () => {
    setShowPostForm(true);
    setIsOpen(false);
  };

  const handleSearch = () => {
    setShowSearchModal(true);
    setIsOpen(false);
  };
  
  const handleStats = () => {
    setShowStatsModal(true);
    setIsOpen(false);
  };
  
  return (
    <>
      {showPostForm && (
        <PostForm onClose={() => setShowPostForm(false)} />
      )}

      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}
      
      {showStatsModal && (
        <StatsModal onClose={() => setShowStatsModal(false)} />
      )}
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* 서브 메뉴 아이템들 */}
        {isOpen && showSubMenu && (
          <div className="flex flex-col gap-3 items-end mb-2">
            <button className="btn-icon bg-background-light dark:bg-dark-background-light">
              <BiBookmark size={22} />
            </button>
            <button className="btn-icon bg-background-light dark:bg-dark-background-light">
              <BiImage size={22} />
            </button>
            <button className="btn-icon bg-background-light dark:bg-dark-background-light">
              <BiShare size={22} />
            </button>
            <button 
              className="btn-icon bg-background-light dark:bg-dark-background-light" 
              onClick={toggleTheme}
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <BiSun size={22} /> : <BiMoon size={22} />}
            </button>
          </div>
        )}
        
        {/* 메인 메뉴 아이템들 */}
        {isOpen && (
          <div className="flex flex-col gap-3 items-end mb-2">
            <button 
              className="btn-icon bg-background-light dark:bg-dark-background-light" 
              onClick={() => setShowSubMenu(!showSubMenu)}
            >
              <BiStats size={22} />
            </button>
            <button 
              className="btn-icon bg-background-light dark:bg-dark-background-light"
              onClick={handleSearch}
            >
              <BiSearch size={22} />
            </button>
            <button 
              className="btn-icon bg-primary hover:bg-primary-dark"
              onClick={handleNewPost}
            >
              <BiPlus size={24} />
            </button>
          </div>
        )}
        
        {/* 메인 토글 버튼 */}
        <button 
          className={`rounded-full p-3 shadow-lg transition-all duration-300 ${
            isOpen ? 'bg-background-light dark:bg-dark-background-light rotate-45' : 'bg-primary'
          }`}
          onClick={toggleMenu}
        >
          {isOpen ? <BiX size={24} /> : <BiPlus size={24} />}
        </button>
      </div>
    </>
  );
}

export default CircleMenu; 