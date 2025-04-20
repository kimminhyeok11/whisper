import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BiLike, BiComment, BiDotsHorizontalRounded } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';
import PostItem from '../PostItem/PostItem';
import RecommendedPosts from '../Recommendations/RecommendedPosts';
import SortingOptions from '../Filter/SortingOptions';
import LoadingIndicator from '../common/LoadingIndicator';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('newest'); // 기본 정렬: 최신순
  const pageSize = 5;
  const observer = useRef();
  
  // 정렬 기준 변경 시 게시글 다시 로드
  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [sortBy]);
  
  // 게시글 불러오기
  const fetchPosts = useCallback(async () => {
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      // 정렬 기준에 따른 쿼리 변경
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' });
      
      switch (sortBy) {
        case 'popular':
          query = query.order('likes', { ascending: false });
          break;
        case 'comments':
          query = query.order('comment_count', { ascending: false });
          break;
        case 'views':
          query = query.order('views', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
      
      const { data, error, count } = await query.range(from, to);
        
      if (error) {
        throw error;
      }
      
      // 첫 페이지인 경우 게시글 초기화, 아닌 경우 기존 게시글에 추가
      if (page === 0) {
        setPosts(data || []);
      } else {
        setPosts(prev => [...prev, ...(data || [])]);
      }
      
      // 더 불러올 게시글이 있는지 확인
      setHasMore(to < (count - 1));
    } catch (err) {
      console.error('게시글 로딩 오류:', err);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy]);
  
  // 스크롤 로딩 설정
  const lastPostRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore]);
  
  // 좋아요 처리
  const handleLike = async (postId) => {
    try {
      // 좋아요 증가 RPC 함수 호출
      await supabase.rpc('increment_post_likes', {
        post_id: postId,
        increment_value: 1
      });
      
      // 현재 게시글 상태 업데이트
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likes: (post.likes || 0) + 1 } 
            : post
        )
      );
    } catch (err) {
      console.error('좋아요 처리 오류:', err);
    }
  };
  
  // 정렬 방식 변경 처리
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };
  
  // 실시간 게시글 업데이트 구독
  useEffect(() => {
    const subscription = supabase
      .channel('posts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' 
      }, (payload) => {
        if (sortBy !== 'newest') return; // 최신순 정렬일 때만 실시간 업데이트
        
        // 새 게시글 생성
        if (payload.eventType === 'INSERT') {
          setPosts(prev => [payload.new, ...prev]);
        }
        // 게시글 업데이트
        else if (payload.eventType === 'UPDATE') {
          setPosts(prev => 
            prev.map(post => 
              post.id === payload.new.id ? payload.new : post
            )
          );
        }
        // 게시글 삭제
        else if (payload.eventType === 'DELETE') {
          setPosts(prev => 
            prev.filter(post => post.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [sortBy]);
  
  // 첫 페이지 로드
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // 게시글 삭제 처리
  const handlePostDelete = useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);
  
  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      {/* 추천 게시글 섹션 */}
      {page === 0 && sortBy === 'newest' && <RecommendedPosts />}
      
      {/* 정렬 옵션 */}
      <div className="flex justify-end mb-4">
        <SortingOptions 
          onSortChange={handleSortChange} 
          currentSort={sortBy} 
        />
      </div>
      
      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.length === 0 && !loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-text-secondary">게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => (
              <div 
                key={post.id} 
                ref={idx === posts.length - 1 ? lastPostRef : undefined}
              >
                <PostItem 
                  post={post} 
                  onLike={handleLike} 
                  onPostDelete={handlePostDelete}
                />
              </div>
            ))}
          </div>
        )}
        
        {loading && <LoadingIndicator />}
      </div>
    </div>
  );
}

export default PostList; 