function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-8 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🛒</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;