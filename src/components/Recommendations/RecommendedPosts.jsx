import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BiTrendingUp } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';

function RecommendedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecommendedPosts = async () => {
      try {
        setLoading(true);
        
        // 인기 게시글 (좋아요 + 댓글 수가 많은 순)
        const { data, error } = await supabase
          .from('posts')
          .select('id, content, author, created_at, likes, comment_count, views')
          .order('likes', { ascending: false })
          .limit(5);
          
        if (error) {
          throw error;
        }
        
        setPosts(data || []);
      } catch (err) {
        console.error('추천 게시글 로딩 오류:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedPosts();
  }, []);
  
  // 게시글 내용 요약 (50자 제한)
  const getSummary = (content) => {
    if (!content) return '';
    
    // 마크다운 표시 제거
    const plainText = content.replace(/[#*`_~\[\]]/g, '');
    
    // 내용이 50자를 초과하면 말줄임표 추가
    return plainText.length > 50
      ? plainText.substring(0, 50) + '...'
      : plainText;
  };
  
  if (loading) {
    return (
      <div className="bg-background-light bg-opacity-20 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <BiTrendingUp size={18} className="text-primary mr-2" />
          <h3 className="text-sm font-medium">인기 게시글</h3>
        </div>
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-background-light rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (posts.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-background-light bg-opacity-20 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <BiTrendingUp size={18} className="text-primary mr-2" />
        <h3 className="text-sm font-medium">인기 게시글</h3>
      </div>
      <div className="space-y-2">
        {posts.map(post => (
          <div 
            key={post.id} 
            className="hover:bg-background-light hover:bg-opacity-30 rounded p-2 cursor-pointer transition-colors"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <div className="flex justify-between">
              <span className="text-xs font-medium truncate max-w-[180px]">{post.author || '익명'}</span>
              <div className="flex items-center text-xs text-text-secondary">
                <span className="mr-2">👍 {post.likes || 0}</span>
                <span>💬 {post.comment_count || 0}</span>
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-1 truncate">
              {getSummary(post.content)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendedPosts; 