import { useState, useRef, useEffect } from 'react';
import { BiX, BiImage, BiLink, BiCode, BiPlus } from 'react-icons/bi';
import supabase from '../../services/supabaseClient';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';

function PostForm({ onClose, editPost = null }) {
  const { user } = useAuth();
  const [content, setContent] = useState(editPost?.content || '');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  // 기존 파일 URL 가져오기
  useEffect(() => {
    if (editPost?.file_urls && Array.isArray(editPost.file_urls)) {
      // 기존 파일 URL이 배열인 경우
      setFiles(editPost.file_urls.map(url => ({ url, isExisting: true })));
    } else if (editPost?.file_url) {
      // 기존 파일 URL이 단일 URL인 경우 (하위 호환)
      setFiles([{ url: editPost.file_url, isExisting: true }]);
    }
  }, [editPost]);
  
  useEffect(() => {
    // 텍스트 영역 자동 조절
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    // 파일 유효성 검사
    const invalidFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    
    if (invalidFiles.length > 0) {
      setError(`${invalidFiles.length}개 파일이 크기 제한(10MB)을 초과했습니다.`);
      return;
    }
    
    // 최대 5개까지만 파일 추가 허용
    if (files.length + selectedFiles.length > 5) {
      setError('최대 5개까지 파일을 첨부할 수 있습니다.');
      return;
    }
    
    // 파일 객체 추가
    setFiles(prev => [
      ...prev, 
      ...selectedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }))
    ]);
    
    setError('');
    
    // 파일 입력 요소 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      
      // 미리보기 URL 해제
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // 파일 업로드 처리
      const fileUrls = [];
      
      // 기존 파일 URL 추가
      files.forEach(fileObj => {
        if (fileObj.isExisting && fileObj.url) {
          fileUrls.push(fileObj.url);
        }
      });
      
      // 새 파일 업로드
      const newFiles = files.filter(fileObj => fileObj.file);
      
      for (const fileObj of newFiles) {
        const filename = `${Date.now()}-${fileObj.file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-files')
          .upload(filename, fileObj.file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // 파일 URL 생성
        const { data: { publicUrl } } = supabase.storage
          .from('post-files')
          .getPublicUrl(filename);
          
        fileUrls.push(publicUrl);
      }
      
      // 작성자 정보
      const author = user ? (user.user_metadata?.username || user.email) : '익명';
      const authorId = user?.id;
      
      // 게시글 데이터 저장
      const postData = {
        title: content.split('\n')[0].substring(0, 100), // 첫 줄을 제목으로 사용
        author: authorId, // author 필드는 UUID 타입이어야 함
        content,
        file_url: fileUrls[0] || null, // 첫 번째 파일 URL (하위 호환)
        file_urls: fileUrls, // 다중 파일 URL 배열
        created_at: new Date().toISOString()
      };
      
      if (editPost) {
        // 게시글 수정
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            title: content.split('\n')[0].substring(0, 100),
            content,
            file_url: fileUrls[0] || null,
            file_urls: fileUrls,
            updated_at: new Date().toISOString()
          })
          .eq('id', editPost.id);
          
        if (updateError) throw updateError;
      } else {
        // 새 게시글 작성
        const { error: insertError } = await supabase
          .from('posts')
          .insert([postData]);
          
        if (insertError) {
          console.error('게시글 저장 에러 정보:', insertError);
          throw insertError;
        }
      }
      
      // 성공적으로 저장 후 폼 닫기
      onClose();
    } catch (err) {
      console.error('게시글 저장 오류:', err);
      setError('게시글을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const toggleMarkdownMode = () => {
    setIsMarkdownMode(!isMarkdownMode);
    setIsPreviewMode(false);
  };
  
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  
  return (
    <div className="fixed inset-0 bg-background-dark bg-opacity-80 dark:bg-dark-background-dark dark:bg-opacity-90 z-50 flex justify-center items-start overflow-y-auto py-4">
      <div className="bg-background dark:bg-dark-background w-full max-w-lg rounded-lg shadow-xl m-4">
        <div className="flex justify-between items-center p-4 border-b border-background-light dark:border-dark-background-light">
          <h2 className="text-lg font-medium dark:text-dark-text">
            {editPost ? '게시글 수정' : '새 게시글 작성'}
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <BiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {isPreviewMode ? (
              <div className="post-content min-h-[200px] bg-background-light bg-opacity-30 dark:bg-dark-background-light dark:bg-opacity-30 rounded p-3">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="무슨 생각을 하고 계신가요?"
                className="w-full min-h-[200px] bg-transparent border-none outline-none resize-none text-text dark:text-dark-text"
                disabled={isUploading}
              />
            )}
            
            {/* 다중 파일 미리보기 */}
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {files.map((fileObj, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-background-light dark:bg-dark-background-light">
                      {fileObj.preview || fileObj.url ? (
                        <img 
                          src={fileObj.preview || fileObj.url} 
                          alt={`첨부 ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-text-secondary">파일</span>
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      className="absolute top-1 right-1 bg-background-dark bg-opacity-70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <BiX size={16} />
                    </button>
                  </div>
                ))}
                
                {/* 파일 추가 버튼 (5개 미만일 때만 표시) */}
                {files.length < 5 && (
                  <div className="aspect-w-1 aspect-h-1 rounded-lg border border-dashed border-background-light dark:border-dark-background-light flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <BiPlus size={24} className="text-text-secondary" />
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-red-500 text-sm">{error}</div>
            )}
          </div>
          
          <div className="p-4 border-t border-background-light dark:border-dark-background-light flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                type="button"
                className="btn-icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="이미지/파일 첨부 (최대 5개)"
              >
                <BiImage size={20} />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
              />
              
              <button 
                type="button"
                className={`btn-icon ${isMarkdownMode ? 'text-primary' : ''}`}
                onClick={toggleMarkdownMode}
                disabled={isUploading}
                title="마크다운 모드"
              >
                <BiCode size={20} />
              </button>
              
              {isMarkdownMode && (
                <button 
                  type="button"
                  className={`btn-icon ${isPreviewMode ? 'text-primary' : ''}`}
                  onClick={togglePreviewMode}
                  disabled={isUploading}
                  title="미리보기"
                >
                  <BiLink size={20} />
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
              disabled={isUploading}
            >
              {isUploading ? '저장 중...' : editPost ? '수정하기' : '게시하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm; 