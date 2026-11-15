import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  Home,
  KeyRound,
  MapPin,
  MessageSquare,
  Play,
  Sparkles,
  Trophy,
  UserCheck,
  Volume2,
} from 'lucide-react';
import {
  ISLAND_ZONES,
  type GameConfig,
  type Team,
  type ZoneId,
} from '../types/game';
import type { CameraPreset } from '../three/islandScene';
import { rankTeams } from '../engine/scoring';

interface MapScreenProps {
  config: GameConfig;
  teams: Team[];
  activeTeamIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentZoneId: ZoneId;
  mcDialogue: string;
  isMcSpeaking: boolean;
  isFinishedAllQuestions: boolean;
  onFocusCamera: (preset: CameraPreset) => void;
  onReplayMcSpeech: () => void;
  onOpenNextChallenge: () => void;
  onOpenTreasureChest: () => void;
  onExitHome: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  config,
  teams,
  activeTeamIndex,
  currentQuestionIndex,
  totalQuestions,
  currentZoneId,
  mcDialogue,
  isMcSpeaking,
  isFinishedAllQuestions,
  onFocusCamera,
  onReplayMcSpeech,
  onOpenNextChallenge,
  onOpenTreasureChest,
  onExitHome,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const currentZone =
    ISLAND_ZONES.find((z) => z.id === currentZoneId) || ISLAND_ZONES[0];
  const activeTeam = teams[activeTeamIndex] || teams[0];
  const ranked = rankTeams(teams);

  return (
    <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-4 md:p-6">
      {/* Top HUD Bar: Compact, High Contrast, Unobtrusive */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="card-3d-navy rounded-2xl px-4 py-3 pointer-events-auto flex items-center gap-3 max-w-xl">
          <button
            onClick={onExitHome}
            className="p-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] text-[#FFF6DF] transition-colors cursor-pointer"
            title="Về trang chủ"
          >
            <Home className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#61DDB5] truncate">
              {config.className} · {config.activityName}
            </div>
            <div className="font-display text-base md:text-lg font-extrabold text-[#FFD166] truncate">
              {currentZone.name}
            </div>
          </div>
          <div className="pl-3 border-l border-white/15 text-right shrink-0">
            <div className="text-[11px] text-[#FFF6DF]/70">Tiến độ</div>
            <div className="font-display font-extrabold text-base tabular-nums text-[#FFF6DF]">
              {Math.min(currentQuestionIndex, totalQuestions)}/{totalQuestions}
            </div>
          </div>
        </div>

        {/* Live Team Scoreboard Strip (Top-Right, compact) */}
        <div className="card-3d-navy rounded-2xl px-4 py-2.5 pointer-events-auto flex flex-wrap items-center gap-3">
          {ranked.map((team, rIdx) => {
            const isCurrent = activeTeam?.id === team.id && !isFinishedAllQuestions;
            return (
              <div
                key={team.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  isCurrent
                    ? 'bg-[#087E9A]/85 border-[#FFD166]'
                    : 'bg-[#061f2d] border-white/10'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <div className="text-xs">
                  <div className="font-bold text-[#FFF6DF] whitespace-nowrap">
                    {rIdx === 0 && team.score > 0 ? '★ ' : ''}
                    {team.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] tabular-nums text-[#FFD166]">
                    <span>{team.score} đ</span>
                    <span className="text-[#61DDB5] inline-flex items-center gap-0.5">
                      <KeyRound className="w-3 h-3" />
                      {team.keys}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Dock Area (Collapsible so 3D Island Center stays 100% unobstructed) */}
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {/* MC 3D Dialogue & Main Action Card */}
        <div className="w-full max-w-4xl pointer-events-auto">
          <div className="card-3d-navy rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* MC Speech Bubble */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() => onFocusCamera('mc')}
                className="shrink-0 w-11 h-11 rounded-xl bg-[#238B55] border border-[#61DDB5]/50 flex items-center justify-center text-[#FFD166] hover:bg-[#2ba164] transition-colors cursor-pointer"
                title="Nhìn gần nhân vật MC 3D"
              >
                <UserCheck className="w-6 h-6" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#61DDB5] mb-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>MC Nhà Thám Hiểm 3D</span>
                  {isMcSpeaking && (
                    <span className="text-[#FFD166]">· Đang dẫn lời</span>
                  )}
                  <button
                    onClick={onReplayMcSpeech}
                    className="ml-1 inline-flex items-center gap-1 text-[#FFD166] hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Nghe lại
                  </button>
                </div>
                <p className="text-sm text-[#FFF6DF] leading-snug">{mcDialogue}</p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="shrink-0 flex items-center justify-end gap-2.5">
              {!isFinishedAllQuestions ? (
                <button
                  onClick={onOpenNextChallenge}
                  className="btn-3d-gold px-6 py-3.5 rounded-xl font-display font-extrabold text-sm md:text-base inline-flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  MỞ CÂU {currentQuestionIndex + 1} ({activeTeam?.name})
                </button>
              ) : (
                <button
                  onClick={onOpenTreasureChest}
                  className="btn-3d-gold px-7 py-3.5 rounded-xl font-display font-extrabold text-base inline-flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Trophy className="w-5 h-5" />
                  MỞ RƯƠNG KHO BÁU 3D!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible 5-Zone Camera Dock */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={() => setDockCollapsed((v) => !v)}
            className="px-3.5 py-1 rounded-t-xl bg-[#082B3D]/95 border border-b-0 border-[#61DDB5]/30 text-[11px] font-bold text-[#61DDB5] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            {dockCollapsed ? 'Hiện thanh góc nhìn 3D' : 'Thu gọn góc nhìn 3D'}
            {dockCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {!dockCollapsed && (
            <div className="card-3d-navy rounded-2xl px-3 py-2 flex flex-wrap items-center justify-center gap-1.5 max-w-[95vw]">
              <button
                onClick={() => onFocusCamera('map')}
                className="px-3 py-1.5 rounded-lg bg-[#061f2d] hover:bg-[#087E9A] text-xs font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-3.5 h-3.5 text-[#FFD166]" />
                Toàn đảo
              </button>
              {ISLAND_ZONES.map((z) => {
                const active = z.id === currentZoneId;
                return (
                  <button
                    key={z.id}
                    onClick={() => onFocusCamera(`zone${z.id}` as CameraPreset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-[#087E9A] text-white border border-[#61DDB5]'
                        : 'bg-[#061f2d] text-[#FFF6DF]/80 hover:bg-[#087E9A]/60'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: z.accentColor }} />
                    <span>Khu {z.id}</span>
                  </button>
                );
              })}
              <button
                onClick={() => onFocusCamera('mc')}
                className="px-3 py-1.5 rounded-lg bg-[#061f2d] hover:bg-[#238B55] text-xs font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#61DDB5]" />
                Nhân vật MC
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
