import { useState, useEffect, useRef } from 'react';
import { BiLeftArrowAlt, BiRightArrowAlt, BiX, BiExpand, BiCollapse } from 'react-icons/bi';

function ImageGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const galleryRef = useRef(null);
  
  if (!images || images.length === 0) {
    return null;
  }
  
  // 키보드 이벤트 처리 (전체화면 모드에서만)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isFullscreen) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, images.length]);
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const closeFullscreen = (e) => {
    e.stopPropagation();
    setIsFullscreen(false);
  };
  
  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };
  
  const toggleThumbnails = (e) => {
    e.stopPropagation();
    setShowThumbnails(!showThumbnails);
  };
  
  // 터치 스와이프 처리
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      handleNext({ stopPropagation: () => {} });
    }
    
    if (isRightSwipe) {
      handlePrev({ stopPropagation: () => {} });
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // 단일 이미지 표시
  if (images.length === 1) {
    return (
      <div className="rounded-lg overflow-hidden">
        <img 
          src={images[0]} 
          alt="첨부 이미지" 
          className="w-full h-auto cursor-pointer object-cover max-h-80"
          onClick={toggleFullscreen}
          loading="lazy"
        />
        
        {isFullscreen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={closeFullscreen}
            >
              <BiX size={30} />
            </button>
            <img 
              src={images[0]} 
              alt="첨부 이미지" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    );
  }
  
  // 여러 이미지 갤러리 표시
  return (
    <div className="relative rounded-lg overflow-hidden" ref={galleryRef}>
      <div 
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={images[currentIndex]} 
          alt={`첨부 이미지 ${currentIndex + 1}`} 
          className="w-full h-auto cursor-pointer object-cover max-h-80"
          onClick={toggleFullscreen}
          loading="lazy"
        />
        
        <div className="absolute bottom-2 right-2 bg-background-dark bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {images.length}
        </div>
        
        <button 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background-dark bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          onClick={handlePrev}
        >
          <BiLeftArrowAlt size={20} />
        </button>
        
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background-dark bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          onClick={handleNext}
        >
          <BiRightArrowAlt size={20} />
        </button>
        
        <button 
          className="absolute bottom-2 left-2 bg-background-dark bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          onClick={toggleThumbnails}
        >
          {showThumbnails ? <BiCollapse size={16} /> : <BiExpand size={16} />}
        </button>
      </div>
      
      {showThumbnails && (
        <div className="mt-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`inline-block w-16 h-16 mr-2 cursor-pointer rounded border-2 overflow-hidden ${idx === currentIndex ? 'border-primary' : 'border-transparent'}`}
              onClick={() => handleThumbnailClick(idx)}
            >
              <img src={img} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
      
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center"
          onClick={closeFullscreen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute top-4 right-4 flex space-x-4">
            <button 
              className="text-white hover:text-gray-300"
              onClick={toggleThumbnails}
            >
              {showThumbnails ? <BiCollapse size={24} /> : <BiExpand size={24} />}
            </button>
            <button 
              className="text-white hover:text-gray-300"
              onClick={closeFullscreen}
            >
              <BiX size={30} />
            </button>
          </div>
          
          <div className="flex items-center justify-center flex-1 w-full relative">
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-30 rounded-full p-2"
              onClick={handlePrev}
            >
              <BiLeftArrowAlt size={36} />
            </button>
            
            <img 
              src={images[currentIndex]} 
              alt={`첨부 이미지 ${currentIndex + 1}`} 
              className="max-w-full max-h-[calc(100vh-120px)] object-contain"
            />
            
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-30 rounded-full p-2"
              onClick={handleNext}
            >
              <BiRightArrowAlt size={36} />
            </button>
          </div>
          
          <div className="text-white mb-2 mt-2">
            {currentIndex + 1} / {images.length}
          </div>
          
          {showThumbnails && (
            <div className="mt-2 overflow-x-auto whitespace-nowrap px-4 pb-4 max-w-full">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`inline-block w-20 h-20 mx-1 cursor-pointer rounded border-2 overflow-hidden ${idx === currentIndex ? 'border-white' : 'border-transparent'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(idx);
                  }}
                >
                  <img src={img} alt={`썸네일 ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageGallery; 