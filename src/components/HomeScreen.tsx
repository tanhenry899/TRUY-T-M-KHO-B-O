import React from 'react';
import {
  BookOpen,
  Compass,
  Database,
  LogOut,
  Maximize2,
  Minimize2,
  Play,
  Settings,
} from 'lucide-react';

interface HomeScreenProps {
  onStartSetup: () => void;
  onOpenGuide: () => void;
  onOpenBank: () => void;
  onOpenSettings: () => void;
  onOpenExit: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  questionCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartSetup,
  onOpenGuide,
  onOpenBank,
  onOpenSettings,
  onOpenExit,
  isFullscreen,
  onToggleFullscreen,
  questionCount,
}) => {
  return (
    <div className="relative z-10 flex flex-col justify-between w-full h-full pointer-events-none p-5 md:p-8">
      {/* Top Minimal Bar */}
      <header className="flex items-center justify-between gap-4 pointer-events-auto">
        <div className="card-3d-navy px-4 py-2.5 rounded-xl flex items-center gap-3">
          <Compass className="w-6 h-6 text-[#FFD166] shrink-0" />
          <span className="font-display font-bold text-sm md:text-base tracking-wide text-[#FFF6DF] whitespace-nowrap">
            TRUY TÌM KHO BÁU 3D
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleFullscreen}
            className="card-3d-navy px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-[#FFF6DF] hover:border-[#FFD166] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#61DDB5]" />
                <span className="hidden sm:inline">Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#FFD166]" />
                <span className="hidden sm:inline">Trình chiếu toàn màn hình</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Center Left/Bottom Hero Lockup leaving center-right 3D Island & Chest clear */}
      <div className="my-auto max-w-xl pointer-events-auto">
        <div className="card-3d-navy rounded-3xl p-6 md:p-8">
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#61DDB5] mb-2">
            Toán & Tiếng Việt · Tiểu học Lớp 1 – 5
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-[#FFD166] [text-wrap:balance]">
            TRUY TÌM KHO BÁU
          </h1>
          <p className="font-display text-lg sm:text-xl font-bold text-[#FFF6DF] mt-1">
            HÀNH TRÌNH CHINH PHỤC TRI THỨC
          </p>
          <p className="mt-3 text-sm md:text-base text-[#FFF6DF]/85 leading-relaxed">
            Khám phá hòn đảo 3D kỳ bí qua 5 chặng thử thách cùng nhân vật MC hướng dẫn, thu thập chìa khóa vàng và mở rương kho báu huyền thoại.
          </p>

          {/* Primary CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartSetup}
              className="btn-3d-gold px-7 py-4 rounded-2xl font-display text-lg font-extrabold inline-flex items-center gap-3 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              BẮT ĐẦU KHÁM PHÁ
            </button>
            <button
              onClick={onOpenBank}
              className="btn-3d-emerald px-5 py-4 rounded-2xl font-display text-sm md:text-base font-bold inline-flex items-center gap-2.5 whitespace-nowrap cursor-pointer"
            >
              <Database className="w-5 h-5" />
              NGÂN HÀNG CÂU HỎI ({questionCount})
            </button>
          </div>

          {/* Secondary Action Row */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenGuide}
              className="px-4 py-2.5 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/25 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#61DDB5]" />
              HƯỚNG DẪN
            </button>
            <button
              onClick={onOpenSettings}
              className="px-4 py-2.5 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/25 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#FFD166]" />
              CÀI ĐẶT
            </button>
            <button
              onClick={onOpenExit}
              className="px-4 py-2.5 rounded-xl bg-[#061f2d] hover:bg-rose-700/80 border border-white/15 text-xs md:text-sm font-bold text-[#FFF6DF]/85 inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#FF9F43]" />
              THOÁT
            </button>
          </div>
        </div>
      </div>

      {/* Quiet Footer Tagline */}
      <footer className="flex items-center justify-between text-xs text-[#FFF6DF]/85 pointer-events-auto">
        <div className="card-3d-navy px-4 py-2 rounded-xl font-semibold text-[#FFD166]">
          HỌC TẬP VUI – KHÁM PHÁ GIỎI – CHINH PHỤC KHO BÁU!
        </div>
        <div className="hidden md:block card-3d-navy px-4 py-2 rounded-xl text-[#FFF6DF]/80">
          Kéo chuột để xoay góc nhìn Đảo Kho Báu 3D
        </div>
      </footer>
    </div>
  );
};
