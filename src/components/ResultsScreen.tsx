import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  History,
  Home,
  KeyRound,
  Printer,
  RotateCcw,
  Trash2,
  Trophy,
  XCircle,
} from 'lucide-react';
import type {
  AnswerRecord,
  GameConfig,
  GameSessionHistory,
  Team,
} from '../types/game';
import { computeAccuracyPercent, rankTeams } from '../engine/scoring';
import { exportSessionReportCsv } from '../engine/report';

interface ResultsScreenProps {
  config: GameConfig;
  teams: Team[];
  records: AnswerRecord[];
  history: GameSessionHistory[];
  onPlayAgain: () => void;
  onGoHome: () => void;
  onClearHistory: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  config,
  teams,
  records,
  history,
  onPlayAgain,
  onGoHome,
  onClearHistory,
}) => {
  const [tab, setTab] = useState<'scoreboard' | 'review' | 'history'>('scoreboard');
  const ranked = rankTeams(teams);
  const topTeam = ranked[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative z-20 w-full h-full overflow-y-auto bg-[#082B3D]/95 p-4 md:p-8 print-only-clean">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Top Trophy Honor Header */}
        <div className="card-3d-navy rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-[#FFD166]/60 print-only-clean">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFD166] text-[#082B3D] flex items-center justify-center shrink-0">
              <Trophy className="w-9 h-9" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#61DDB5]">
                {config.className} · {config.activityName}
              </p>
              <h1 className="font-display text-2xl md:text-4xl font-extrabold text-[#FFD166]">
                VINH DANH: {topTeam?.name}
              </h1>
              <p className="text-sm text-[#FFF6DF]/85 mt-1">
                Danh hiệu <strong>Nhà Thám Hiểm Xuất Sắc</strong> · Tổng điểm{' '}
                <strong className="tabular-nums text-[#FFD166]">{topTeam?.score}</strong> ·{' '}
                <strong className="tabular-nums text-[#61DDB5]">{topTeam?.keys} chìa khóa</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              onClick={onPlayAgain}
              className="btn-3d-gold px-5 py-3 rounded-xl font-display font-extrabold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại
            </button>
            <button
              onClick={() => exportSessionReportCsv({ config, teams, records })}
              className="btn-3d-emerald px-5 py-3 rounded-xl font-display font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Xuất báo cáo CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-3 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FFD166]" />
              In kết quả
            </button>
            <button
              onClick={onGoHome}
              className="px-4 py-3 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 no-print">
          <button
            onClick={() => setTab('scoreboard')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer ${
              tab === 'scoreboard'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Bảng tổng sắp ({ranked.length} đội)
          </button>
          <button
            onClick={() => setTab('review')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer ${
              tab === 'review'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Chi tiết từng câu ({records.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer ${
              tab === 'history'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Xem lịch sử ({history.length})
          </button>
        </div>

        {/* TAB 1: SCOREBOARD TABLE */}
        {tab === 'scoreboard' && (
          <div className="card-3d-navy rounded-2xl overflow-hidden print-only-clean">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm md:text-base">
                <thead>
                  <tr className="bg-[#061f2d] border-b border-white/15 text-[#FFD166]">
                    <th className="px-5 py-4 font-bold">Thứ hạng</th>
                    <th className="px-5 py-4 font-bold">Tên đội</th>
                    <th className="px-5 py-4 font-bold text-right">Tổng điểm</th>
                    <th className="px-5 py-4 font-bold text-right">Số câu đúng</th>
                    <th className="px-5 py-4 font-bold text-right">Số câu sai</th>
                    <th className="px-5 py-4 font-bold text-right">Bỏ qua</th>
                    <th className="px-5 py-4 font-bold text-right">Tỉ lệ chính xác</th>
                    <th className="px-5 py-4 font-bold text-right">Chìa khóa</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((team, idx) => (
                    <tr
                      key={team.id}
                      className={`border-b last:border-b-0 border-white/10 ${
                        idx === 0 ? 'bg-[#FFD166]/10' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-display font-extrabold tabular-nums">
                        {idx === 0
                          ? 'Hạng 1 ★'
                          : idx === 1
                            ? 'Hạng 2'
                            : idx === 2
                              ? 'Hạng 3'
                              : `Hạng ${idx + 1}`}
                      </td>
                      <td className="px-5 py-4 font-bold">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <span>{team.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-display font-extrabold text-lg tabular-nums text-[#FFD166]">
                        {team.score}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-[#61DDB5] font-bold">
                        {team.correctCount}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-rose-300">
                        {team.wrongCount}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-[#FFF6DF]/70">
                        {team.skippedCount}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums font-bold">
                        {computeAccuracyPercent(team)}%
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-[#FFD166] font-bold">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <KeyRound className="w-4 h-4" />
                          {team.keys}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTION REVIEW */}
        {tab === 'review' && (
          <div className="card-3d-navy rounded-2xl p-5 space-y-3">
            {records.length === 0 ? (
              <p className="text-sm text-[#FFF6DF]/70">Chưa có dữ liệu câu trả lời.</p>
            ) : (
              records.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#061f2d] p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#61DDB5]">
                      Câu {rec.questionIndex + 1} · {rec.subject} Lớp {rec.grade} · Đội: {rec.teamName}
                    </div>
                    <div className="text-sm font-semibold text-[#FFF6DF]">
                      {rec.questionContent}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs font-bold tabular-nums">
                    <span className="text-[#FFF6DF]/70">{rec.timeSpentSeconds}s</span>
                    {rec.isSkipped ? (
                      <span className="text-[#FF9F43]">Bỏ qua (0 đ)</span>
                    ) : rec.isCorrect ? (
                      <span className="text-[#61DDB5] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> +{rec.pointsAwarded} đ
                      </span>
                    ) : (
                      <span className="text-rose-400 inline-flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> {rec.pointsAwarded} đ
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SESSION HISTORY */}
        {tab === 'history' && (
          <div className="card-3d-navy rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#FFD166]">
                Lịch sử các lượt thi đấu đã lưu
              </h2>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa lịch sử
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-[#FFF6DF]/70">
                Chưa có lượt thi đấu nào được lưu trước đó.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#061f2d] p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#FFF6DF]">
                        {item.className} · {item.activityName}
                      </div>
                      <div className="text-xs text-[#FFF6DF]/70 mt-0.5">
                        {new Date(item.playedAt).toLocaleString('vi-VN')} · Môn {item.subjectFilter} ·{' '}
                        {item.totalQuestions} câu · Vô địch:{' '}
                        <strong className="text-[#FFD166]">{item.winnerTeamName}</strong>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs tabular-nums">
                      {item.teams.map((t) => (
                        <span key={t.id} className="text-[#61DDB5]">
                          {t.name}: <strong className="text-[#FFF6DF]">{t.score}đ</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
