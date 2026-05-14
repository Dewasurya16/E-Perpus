import Image from 'next/image';

export default function GlobalActionLoading({ isVisible, text = 'Memproses...' }: { isVisible: boolean, text?: string }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F4F6F4]/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 animate-pulse">
        <Image 
          src="/images/logo-kejaksaan.png" 
          alt="Memuat..." 
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="mt-6 flex flex-col items-center">
        <div className="w-10 h-1 bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#1B4332] animate-[shimmer_1.5s_infinite] w-full" />
        </div>
        <p className="mt-3 text-[11px] font-bold text-[#1B4332] uppercase tracking-widest animate-pulse">
          {text}
        </p>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
