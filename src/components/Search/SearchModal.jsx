import { useState, useEffect, useRef } from 'react';
import { BiX, BiSearch, BiLoaderAlt } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import supabase from '../../services/supabaseClient';

function SearchModal({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  
  // 모달이 열리면 검색 입력란에 포커스
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  
  // 검색 실행 함수
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    setShowNoResults(false);
    
    try {
      // PostgreSQL의 ILIKE를 사용하여 대소문자 구분 없이 검색
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, author, created_at, likes, comment_count, views')
        .or(`content.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      setResults(data || []);
      setShowNoResults(data.length === 0);
    } catch (err) {
      console.error('검색 오류:', err);
    } finally {
      setSearching(false);
    }
  };
  
  // 엔터 키 누를 때 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // 게시글 클릭 시 해당 게시글로 이동
  const handlePostClick = (postId) => {
    onClose();
    navigate(`/posts/${postId}`);
  };
  
  // 게시글 내용 미리보기 (100자 제한)
  const getPreviewContent = (content) => {
    if (!content) return '';
    
    // 마크다운 표시 제거
    const plainText = content.replace(/[#*`_~\[\]]/g, '');
    
    // 내용이 100자를 초과하면 말줄임표 추가
    return plainText.length > 100
      ? plainText.substring(0, 100) + '...'
      : plainText;
  };
  
  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 z-50 flex justify-center p-4 overflow-y-auto">
      <div className="bg-background w-full max-w-lg rounded-lg shadow-xl mt-16">
        {/* 검색 헤더 */}
        <div className="flex items-center p-3 border-b border-background-light">
          <div className="flex-1 flex items-center gap-2 bg-background-light bg-opacity-40 rounded-full px-4 py-2">
            <BiSearch size={18} className="text-text-secondary" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="검색어를 입력하세요..."
              className="bg-transparent border-none outline-none w-full text-sm"
            />
            {searchTerm && (
              <button 
                className="text-text-secondary hover:text-text"
                onClick={() => setSearchTerm('')}
              >
                <BiX size={18} />
              </button>
            )}
          </div>
          
          <button 
            className="ml-2 btn-icon" 
            onClick={onClose}
          >
            <BiX size={24} />
          </button>
        </div>
        
        {/* 검색 결과 */}
        <div className="p-2">
          {searching ? (
            <div className="flex justify-center items-center py-12">
              <BiLoaderAlt size={30} className="text-primary animate-spin" />
            </div>
          ) : showNoResults ? (
            <div className="text-center py-12 text-text-secondary">
              검색 결과가 없습니다.
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-background-light">
              {results.map((post) => (
                <div 
                  key={post.id}
                  className="py-3 px-2 hover:bg-background-light hover:bg-opacity-30 rounded cursor-pointer transition-colors"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{post.author || '익명'}</span>
                    <span className="text-xs text-text-secondary">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2 line-clamp-2">
                    {getPreviewContent(post.content)}
                  </p>
                  <div className="flex text-xs text-text-secondary">
                    <span className="mr-3">좋아요 {post.likes || 0}</span>
                    <span className="mr-3">댓글 {post.comment_count || 0}</span>
                    <span>조회 {post.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              검색어를 입력하고 엔터 키를 누르세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal; 