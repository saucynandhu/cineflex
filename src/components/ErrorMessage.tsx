import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message = "Something went wrong. Please try again later.", onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center gap-4 bg-white/5 rounded-lg border border-white/10">
      <AlertCircle className="w-12 h-12 text-[#E50914] opacity-50" />
      <div className="space-y-1">
        <h3 className="text-white font-bold text-lg">Oops!</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-white/80 transition-colors"
        >
          <RotateCcw size={18} />
          Retry
        </button>
      )}
    </div>
  );
}
