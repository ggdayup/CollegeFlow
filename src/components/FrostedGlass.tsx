interface FrostedGlassProps {
  children: React.ReactNode;
  isEntitled: boolean;
  blurAmount?: 'light' | 'heavy';
  upgradeMessage?: string;
  onUpgrade?: () => void;
}

export default function FrostedGlass({ children, isEntitled, blurAmount = 'heavy', upgradeMessage, onUpgrade }: FrostedGlassProps) {
  if (isEntitled) return <>{children}</>;

  const blurClass = blurAmount === 'heavy' ? 'blur-md' : 'blur-sm';

  return (
    <div className="relative">
      <div className={`${blurClass} pointer-events-none select-none opacity-60`}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl">
        <p className="text-sm font-medium text-white mb-2 text-center px-4">
          {upgradeMessage || 'Upgrade to unlock'}
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
}
