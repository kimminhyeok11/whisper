import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';
import PostItem from './PostItem';
import LoadingIndicator from '../common/LoadingIndicator';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        
        // 게시글 조회
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }
        
        setPost(data);
        
        // 조회수 증가
        await supabase
          .from('posts')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
          
      } catch (err) {
        console.error('게시글 로딩 오류:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetail();
    
    // 게시글 실시간 업데이트 구독
    const subscription = supabase
      .channel(`post_detail_${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${id}`
      }, (payload) => {
        setPost(payload.new);
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [id]);
  
  const handleLike = async () => {
    try {
      // 좋아요 증가 RPC 함수 호출
      await supabase.rpc('increment_post_likes', {
        post_id: id,
        increment_value: 1
      });
      
      // 현재 게시글 상태 업데이트
      setPost(prev => ({
        ...prev,
        likes: (prev.likes || 0) + 1
      }));
    } catch (err) {
      console.error('좋아요 처리 오류:', err);
    }
  };
  
  if (loading) {
    return <LoadingIndicator />;
  }
  
  if (error || !post) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
        <button 
          className="bg-primary text-white rounded-full px-4 py-2 text-sm"
          onClick={() => navigate('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="mb-4">
        <button 
          className="flex items-center text-text-secondary hover:text-text"
          onClick={() => navigate('/')}
        >
          <BiArrowBack size={18} className="mr-1" />
          <span>뒤로 가기</span>
        </button>
      </div>
      
      <PostItem post={post} onLike={handleLike} isDetail={true} />
    </div>
  );
}

export default PostDetail;