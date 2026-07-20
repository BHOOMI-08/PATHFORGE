export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-slate-400 text-sm font-medium animate-pulse-slow">Loading details...</p>
    </div>
  );
};

export default LoadingSpinner;
