import { useState, useEffect, useRef } from 'react';
import { BiSort, BiTime, BiTrendingUp, BiMessageAlt, BiShow } from 'react-icons/bi';

function SortingOptions({ onSortChange, currentSort }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // 정렬 옵션
  const sortOptions = [
    { id: 'newest', label: '최신순', icon: <BiTime size={16} /> },
    { id: 'popular', label: '인기순', icon: <BiTrendingUp size={16} /> },
    { id: 'comments', label: '댓글순', icon: <BiMessageAlt size={16} /> },
    { id: 'views', label: '조회순', icon: <BiShow size={16} /> }
  ];
  
  // 현재 선택된 정렬 옵션 라벨
  const currentSortLabel = sortOptions.find(option => option.id === currentSort)?.label || '최신순';
  
  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 정렬 옵션 선택 처리
  const handleSelect = (sortId) => {
    onSortChange(sortId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-1 text-xs text-text-secondary hover:text-text bg-background-light bg-opacity-40 rounded-full px-3 py-1.5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BiSort size={14} />
        <span>{currentSortLabel}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background-light rounded-lg shadow-lg overflow-hidden z-10 w-28">
          {sortOptions.map(option => (
            <button
              key={option.id}
              className={`w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-background transition-colors ${
                currentSort === option.id ? 'text-primary' : 'text-text-secondary'
              }`}
              onClick={() => handleSelect(option.id)}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortingOptions; 