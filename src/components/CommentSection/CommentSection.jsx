import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BiSend, BiTimeFive } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchComments();
    
    // 실시간 댓글 업데이트 구독
    const subscription = supabase
      .channel(`comments_for_post_${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`
      }, (payload) => {
        setComments((prev) => [...prev, payload.new]);
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setComments(data || []);
    } catch (err) {
      console.error('댓글 로딩 오류:', err);
      setError('댓글을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      // 댓글 추가
      const { error: commentError } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          author: '익명',
          content: newComment.trim(),
          created_at: new Date().toISOString()
        }]);
        
      if (commentError) {
        throw commentError;
      }
      
      // 게시글의 댓글 수 증가
      await supabase.rpc('increment_comment_count', {
        post_id: postId,
        increment_value: 1
      });
      
      // 폼 초기화
      setNewComment('');
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      setError('댓글을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3">댓글 {comments.length}개</h3>
      
      {error && (
        <div className="text-red-500 text-sm mb-3">{error}</div>
      )}
      
      {/* 댓글 목록 */}
      <div className="space-y-3 mb-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((item) => (
              <div key={item} className="animate-pulse flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-background-light"></div>
                <div className="flex-1">
                  <div className="h-2 bg-background-light rounded w-20 mb-2"></div>
                  <div className="h-2 bg-background-light rounded w-full mb-1"></div>
                  <div className="h-2 bg-background-light rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-text-secondary text-sm text-center py-2">
            첫 번째 댓글을 남겨보세요.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs flex-shrink-0 mt-1">
                {comment.author?.charAt(0) || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.author || '익명'}</span>
                  <span className="text-xs text-text-secondary flex items-center">
                    <BiTimeFive size={10} className="mr-0.5" />
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: ko 
                    })}
                  </span>
                </div>
                <p className="text-sm mt-1 break-words">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 댓글 작성 폼 */}
      <form 
        onSubmit={handleCommentSubmit}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성하세요..."
          className="flex-1 bg-background-light bg-opacity-50 rounded-full py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-primary"
          disabled={submitting}
        />
        <button
          type="submit"
          className="btn-icon bg-primary text-white hover:bg-primary-dark"
          disabled={submitting || !newComment.trim()}
        >
          <BiSend size={18} />
        </button>
      </form>
    </div>
  );
}

export default CommentSection; 