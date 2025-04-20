import { 
  BiFile, BiFileBlank, BiFilePdf, BiFileDoc, 
  BiFileZip, BiFileImage, BiDownload 
} from 'react-icons/bi';

function FileAttachment({ fileUrl }) {
  if (!fileUrl) return null;
  
  // 파일 이름 추출
  const fileName = fileUrl.split('/').pop();
  
  // 파일 확장자 추출 및 아이콘 결정
  const extension = fileName.split('.').pop().toLowerCase();
  let FileIcon = BiFileBlank;
  
  switch (extension) {
    case 'pdf':
      FileIcon = BiFilePdf;
      break;
    case 'doc':
    case 'docx':
      FileIcon = BiFileDoc;
      break;
    case 'zip':
    case 'rar':
    case '7z':
      FileIcon = BiFileZip;
      break;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      FileIcon = BiFileImage;
      break;
    default:
      FileIcon = BiFile;
  }
  
  return (
    <a 
      href={fileUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      download
      className="block bg-background-light rounded-lg p-3 flex items-center justify-between hover:bg-opacity-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <FileIcon size={24} className="text-primary" />
        <span className="text-sm truncate max-w-[200px]">{fileName}</span>
      </div>
      <BiDownload size={20} className="text-text-secondary" />
    </a>
  );
}

export default FileAttachment; 