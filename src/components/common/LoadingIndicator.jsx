function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative w-10 h-10">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary opacity-20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export default LoadingIndicator; 