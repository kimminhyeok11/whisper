import { useState, useEffect } from 'react';
import { BiX, BiLoaderAlt, BiTrendingUp, BiMessageAlt, BiShow, BiLike } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';

function StatsModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // 게시글 전체 통계
        const { data: postsCount, error: postsCountError } = await supabase
          .from('posts')
          .select('id', { count: 'exact' });
          
        if (postsCountError) throw postsCountError;
        
        // 댓글 전체 통계
        const { data: commentsCount, error: commentsCountError } = await supabase
          .from('comments')
          .select('id', { count: 'exact' });
          
        if (commentsCountError) throw commentsCountError;
        
        // 가장 많이 본 게시글
        const { data: mostViewed, error: mostViewedError } = await supabase
          .from('posts')
          .select('id, author, content, views')
          .order('views', { ascending: false })
          .limit(1)
          .single();
          
        if (mostViewedError && mostViewedError.code !== 'PGRST116') throw mostViewedError;
        
        // 가장 좋아요가 많은 게시글
        const { data: mostLiked, error: mostLikedError } = await supabase
          .from('posts')
          .select('id, author, content, likes')
          .order('likes', { ascending: false })
          .limit(1)
          .single();
          
        if (mostLikedError && mostLikedError.code !== 'PGRST116') throw mostLikedError;
        
        // 가장 댓글이 많은 게시글
        const { data: mostCommented, error: mostCommentedError } = await supabase
          .from('posts')
          .select('id, author, content, comment_count')
          .order('comment_count', { ascending: false })
          .limit(1)
          .single();
          
        if (mostCommentedError && mostCommentedError.code !== 'PGRST116') throw mostCommentedError;
        
        setStats({
          postsCount: postsCount?.length || 0,
          commentsCount: commentsCount?.length || 0,
          mostViewed,
          mostLiked,
          mostCommented
        });
      } catch (err) {
        console.error('통계 로딩 오류:', err);
        setError('통계를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // 게시글 내용 요약 (40자 제한)
  const getSummary = (content) => {
    if (!content) return '';
    
    // 마크다운 표시 제거
    const plainText = content.replace(/[#*`_~\[\]]/g, '');
    
    // 내용이 40자를 초과하면 말줄임표 추가
    return plainText.length > 40
      ? plainText.substring(0, 40) + '...'
      : plainText;
  };
  
  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 z-50 flex justify-center items-start overflow-y-auto py-4">
      <div className="bg-background w-full max-w-lg rounded-lg shadow-xl m-4">
        <div className="flex justify-between items-center p-4 border-b border-background-light">
          <h2 className="text-lg font-medium">통계</h2>
          <button className="btn-icon" onClick={onClose}>
            <BiX size={24} />
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <BiLoaderAlt size={30} className="text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* 일반 통계 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-light bg-opacity-30 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-primary text-2xl font-bold">
                    {stats.postsCount}
                  </div>
                  <div className="text-text-secondary text-sm">
                    총 게시글
                  </div>
                </div>
                <div className="bg-background-light bg-opacity-30 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-primary text-2xl font-bold">
                    {stats.commentsCount}
                  </div>
                  <div className="text-text-secondary text-sm">
                    총 댓글
                  </div>
                </div>
              </div>
              
              {/* 인기 게시글 통계 */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">인기 게시글</h3>
                
                {stats.mostViewed && (
                  <div className="bg-background-light bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BiShow size={18} className="text-primary" />
                      <span className="text-sm font-medium">가장 많이 본 게시글</span>
                      <span className="ml-auto text-xs text-text-secondary">
                        {stats.mostViewed.views}회
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {getSummary(stats.mostViewed.content)}
                    </p>
                  </div>
                )}
                
                {stats.mostLiked && (
                  <div className="bg-background-light bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BiLike size={18} className="text-primary" />
                      <span className="text-sm font-medium">가장 많은 좋아요</span>
                      <span className="ml-auto text-xs text-text-secondary">
                        {stats.mostLiked.likes}개
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {getSummary(stats.mostLiked.content)}
                    </p>
                  </div>
                )}
                
                {stats.mostCommented && (
                  <div className="bg-background-light bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BiMessageAlt size={18} className="text-primary" />
                      <span className="text-sm font-medium">가장 많은 댓글</span>
                      <span className="ml-auto text-xs text-text-secondary">
                        {stats.mostCommented.comment_count}개
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {getSummary(stats.mostCommented.content)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsModal; 