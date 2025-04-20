import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiLike, BiComment, BiDotsHorizontalRounded, BiTimeFive, BiX } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import ImageGallery from '../ImageGallery/ImageGallery';
import FileAttachment from '../common/FileAttachment';
import CommentSection from '../CommentSection/CommentSection';
import PostForm from '../PostForm/PostForm';
import supabase from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

function PostItem({ post, onLike, isDetail = false, onPostDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(isDetail);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 게시글 수정/삭제 권한 확인
  const canModify = user && (
    user.id === post.author_id || // 작성자인 경우
    user.email === post.author || // 이메일이 작성자와 일치하는 경우(하위 호환)
    user.user_metadata?.username === post.author // 사용자명이 작성자와 일치하는 경우(하위 호환)
  );
  
  // 시간 포맷팅
  const formattedDate = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { 
        addSuffix: true, 
        locale: ko 
      })
    : '';
  
  // 파일 유형 확인
  const isImage = post.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(post.file_url);
  
  // 게시글 링크 URL
  const postUrl = `/posts/${post.id}`;
  
  // 댓글 토글
  const toggleComments = () => {
    if (!isDetail) {
      setShowComments(!showComments);
    }
  };
  
  // 좋아요 처리
  const handleLikeClick = (e) => {
    e.preventDefault();
    onLike(post.id);
  };
  
  // 메뉴 토글
  const toggleMenu = (e) => {
    e.preventDefault();
    setShowMenu(!showMenu);
  };
  
  // 게시글 수정 화면 열기
  const handleEdit = () => {
    setShowMenu(false);
    setShowEditForm(true);
  };
  
  // 게시글 수정 완료 후 처리
  const handleEditComplete = () => {
    setShowEditForm(false);
  };
  
  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!canModify) {
      alert('게시글을 삭제할 권한이 없습니다.');
      setShowMenu(false);
      return;
    }
    
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);
          
        if (error) throw error;
        
        // 상세 페이지에서 삭제한 경우 홈으로 이동
        if (isDetail) {
          navigate('/');
        } else if (onPostDelete) {
          // 목록에서 해당 게시글 제거
          onPostDelete(post.id);
        }
      } catch (err) {
        console.error('게시글 삭제 오류:', err);
        alert('게시글을 삭제하는 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
    setShowMenu(false);
  };
  
  // 공유 기능
  const handleShare = () => {
    setShowMenu(false);
    
    const url = `${window.location.origin}/posts/${post.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: '게시글 공유',
        text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        url
      })
      .catch(err => console.error('공유 오류:', err));
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(url)
        .then(() => alert('링크가 클립보드에 복사되었습니다.'))
        .catch(err => console.error('클립보드 복사 오류:', err));
    }
  };
  
  return (
    <>
      {showEditForm && (
        <PostForm onClose={handleEditComplete} editPost={post} />
      )}
      
      <div className="bg-background-light bg-opacity-20 dark:bg-dark-background-light dark:bg-opacity-20 rounded-lg overflow-hidden">
        {/* 게시글 헤더 */}
        <div className="flex justify-between items-center p-4 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              {post.author?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-medium dark:text-dark-text">{post.author || '익명'}</div>
              <div className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center">
                <BiTimeFive size={12} className="mr-1" />
                {formattedDate}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              className="btn-icon"
              onClick={toggleMenu}
            >
              <BiDotsHorizontalRounded size={18} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-background-light dark:bg-dark-background-light rounded-lg shadow-lg py-1 w-36 z-10">
                {canModify && (
                  <>
                    <button 
                      className="w-full px-4 py-2 text-left hover:bg-background dark:hover:bg-dark-background transition-colors"
                      onClick={handleEdit}
                      disabled={isDeleting}
                    >
                      수정하기
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-background dark:hover:bg-dark-background transition-colors"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '삭제 중...' : '삭제하기'}
                    </button>
                  </>
                )}
                <button 
                  className="w-full px-4 py-2 text-left hover:bg-background dark:hover:bg-dark-background transition-colors"
                  onClick={handleShare}
                >
                  공유하기
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 게시글 내용 */}
        <div className="p-4 pt-0">
          <div className="post-content dark:text-dark-text">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </div>
          
          {/* 이미지 또는 파일 첨부 */}
          {isImage ? (
            <div className="mt-3">
              <ImageGallery images={[post.file_url]} />
            </div>
          ) : post.file_url ? (
            <div className="mt-3">
              <FileAttachment fileUrl={post.file_url} />
            </div>
          ) : null}
          
          {/* 게시글 하단 액션 버튼 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-4">
              <button 
                className="flex items-center text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
                onClick={handleLikeClick}
              >
                <BiLike size={18} className="mr-1" />
                <span className="text-sm">{post.likes || 0}</span>
              </button>
              
              <button 
                className="flex items-center text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
                onClick={toggleComments}
              >
                <BiComment size={18} className="mr-1" />
                <span className="text-sm">{post.comment_count || 0}</span>
              </button>
            </div>
            
            <div className="text-xs text-text-secondary dark:text-dark-text-secondary">
              조회 {post.views || 0}
            </div>
          </div>
        </div>
        
        {/* 댓글 섹션 */}
        {showComments && (
          <div className="border-t border-background-light dark:border-dark-background-light">
            <CommentSection postId={post.id} />
          </div>
        )}
      </div>
    </>
  );
}

export default PostItem;