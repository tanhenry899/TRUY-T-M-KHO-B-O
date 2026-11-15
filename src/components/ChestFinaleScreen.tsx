import React, { useState } from 'react';
import {
  Award,
  Coins,
  Crown,
  Gem,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { Team } from '../types/game';
import { rankTeams } from '../engine/scoring';

interface ChestFinaleScreenProps {
  teams: Team[];
  chestBonusPoints: number;
  onTriggerOpenChest: () => void;
  onViewResults: () => void;
}

export const ChestFinaleScreen: React.FC<ChestFinaleScreenProps> = ({
  teams,
  chestBonusPoints,
  onTriggerOpenChest,
  onViewResults,
}) => {
  const [opened, setOpened] = useState(false);
  const ranked = rankTeams(teams);
  const winner = ranked[0];

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    onTriggerOpenChest();
  };

  return (
    <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-5 md:p-8">
      {/* Top Celebration Banner */}
      <div className="max-w-3xl mx-auto w-full pointer-events-auto">
        <div className="card-3d-navy rounded-2xl px-6 py-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#61DDB5]">
            Đền Cổ Đảo Kho Báu · Cao Trào Chiến Thắng
          </p>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-[#FFD166] mt-1">
            {opened
              ? 'CHÚC MỪNG CÁC NHÀ THÁM HIỂM!'
              : 'RƯƠNG KHO BÁU HUYỀN THOẠI ĐÃ SẴN SÀNG!'}
          </h1>
        </div>
      </div>

      {/* Bottom Action & Rewards Card (Keeping center 3D Chest & Fireworks clear) */}
      <div className="max-w-4xl mx-auto w-full pointer-events-auto">
        {!opened ? (
          <div className="card-3d-navy rounded-3xl p-6 text-center space-y-4">
            <p className="text-base md:text-lg text-[#FFF6DF]">
              Các đội đã xuất sắc vượt qua tất cả thử thách trên đảo! Hãy cùng bấm nút bên dưới để mở khóa Rương Vàng và nhận{' '}
              <strong className="text-[#FFD166]">+{chestBonusPoints} điểm thưởng kho báu</strong> cho đội dẫn đầu{' '}
              <strong className="text-[#61DDB5]">{winner?.name}</strong>!
            </p>
            <button
              onClick={handleOpen}
              className="btn-3d-gold px-10 py-4 rounded-2xl font-display text-xl font-extrabold inline-flex items-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
              MỞ RƯƠNG KHO BÁU NGAY!
            </button>
          </div>
        ) : (
          <div className="card-3d-navy rounded-3xl p-6 space-y-5 border-[#FFD166]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD166] text-[#082B3D] flex items-center justify-center shrink-0">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#61DDB5]">
                    Danh hiệu: NHÀ THÁM HIỂM XUẤT SẮC
                  </div>
                  <div className="font-display text-2xl font-extrabold text-[#FFD166]">
                    {winner?.name} (+{chestBonusPoints} điểm mở rương)
                  </div>
                </div>
              </div>
              <button
                onClick={onViewResults}
                className="btn-3d-emerald px-7 py-3.5 rounded-2xl font-display text-base font-extrabold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-5 h-5" />
                XEM BẢNG KẾT QUẢ CHUNG CUỘC
              </button>
            </div>

            {/* 4 Treasure Rewards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                {
                  icon: <Award className="w-7 h-7 text-[#FFD166] mx-auto" />,
                  title: 'Huy Chương Vàng',
                  sub: 'Vinh danh trí tuệ',
                },
                {
                  icon: <Trophy className="w-7 h-7 text-[#FF9F43] mx-auto" />,
                  title: 'Cúp Chiến Thắng',
                  sub: 'Đội chinh phục đảo',
                },
                {
                  icon: <Gem className="w-7 h-7 text-[#61DDB5] mx-auto" />,
                  title: 'Kim Cương Tri Thức',
                  sub: 'Phần thưởng quý giá',
                },
                {
                  icon: <Coins className="w-7 h-7 text-[#FFD166] mx-auto" />,
                  title: 'Đồng Xu Vàng',
                  sub: 'Tích lũy kho báu',
                },
              ].map((rw, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#061f2d] p-3.5 border border-[#FFD166]/30 space-y-1"
                >
                  {rw.icon}
                  <div className="font-display font-bold text-sm text-[#FFF6DF]">
                    {rw.title}
                  </div>
                  <div className="text-xs text-[#FFF6DF]/70">{rw.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
