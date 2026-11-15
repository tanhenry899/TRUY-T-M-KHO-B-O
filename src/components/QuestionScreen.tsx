import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  KeyRound,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
  Sparkles,
  Split,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  ISLAND_ZONES,
  type GameConfig,
  type Question,
  type Team,
  type ZoneId,
} from '../types/game';
import { QuestionVisual } from './QuestionVisual';

interface QuestionScreenProps {
  config: GameConfig;
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  zoneId: ZoneId;
  teams: Team[];
  activeTeamIndex: number;
  onSelectActiveTeam: (teamIdx: number) => void;
  onSubmitAnswer: (params: {
    selectedIndex: number | null;
    isSkipped: boolean;
    timeRemaining: number;
    timeSpent: number;
  }) => {
    pointsAwarded: number;
    stageBonusPoints: number;
    keysEarned: number;
    isCorrect: boolean;
  };
  onSwapQuestion: () => boolean;
  onSpeakQuestion: (text: string) => void;
  onProceedNext: () => void;
  onBackToMap: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  config,
  question,
  questionIndex,
  totalQuestions,
  zoneId,
  teams,
  activeTeamIndex,
  onSelectActiveTeam,
  onSubmitAnswer,
  onSwapQuestion,
  onSpeakQuestion,
  onProceedNext,
  onBackToMap,
}) => {
  const [timeLeft, setTimeLeft] = useState(config.timePerQuestion);
  const [paused, setPaused] = useState(false);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [lockedResult, setLockedResult] = useState<{
    selectedIndex: number | null;
    isSkipped: boolean;
    isCorrect: boolean;
    pointsAwarded: number;
    stageBonusPoints: number;
    keysEarned: number;
  } | null>(null);

  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedSwap, setUsedSwap] = useState(false);
  const [swapMessage, setSwapMessage] = useState<string | null>(null);

  // Reset per-question UI state when question changes
  useEffect(() => {
    setTimeLeft(config.timePerQuestion);
    setPaused(false);
    setPendingIndex(null);
    setLockedResult(null);
    setEliminatedIndices([]);
    setShowHint(false);
    setUsedFiftyFifty(false);
    setUsedSwap(false);
    setSwapMessage(null);
  }, [question.id, questionIndex, config.timePerQuestion]);

  const activeTeam = teams[activeTeamIndex] || teams[0];
  const zoneInfo = ISLAND_ZONES.find((z) => z.id === zoneId) || ISLAND_ZONES[0];

  // Countdown timer
  useEffect(() => {
    if (config.timePerQuestion <= 0 || paused || lockedResult) return;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [config.timePerQuestion, paused, lockedResult]);

  // Auto-submit when countdown reaches 0
  useEffect(() => {
    if (config.timePerQuestion > 0 && timeLeft === 0 && !lockedResult) {
      const outcome = onSubmitAnswer({
        selectedIndex: null,
        isSkipped: false,
        timeRemaining: 0,
        timeSpent: config.timePerQuestion,
      });
      setLockedResult({
        selectedIndex: null,
        isSkipped: false,
        ...outcome,
      });
    }
  }, [timeLeft, config.timePerQuestion, lockedResult, onSubmitAnswer]);

  const finalizeSelection = (idx: number) => {
    if (lockedResult || eliminatedIndices.includes(idx)) return;
    const spent =
      config.timePerQuestion > 0 ? config.timePerQuestion - timeLeft : 0;
    const outcome = onSubmitAnswer({
      selectedIndex: idx,
      isSkipped: false,
      timeRemaining: timeLeft,
      timeSpent: spent,
    });
    setLockedResult({
      selectedIndex: idx,
      isSkipped: false,
      ...outcome,
    });
  };

  const handleOptionClick = (idx: number) => {
    if (lockedResult || paused || eliminatedIndices.includes(idx)) return;
    if (config.requireTeacherConfirm) {
      setPendingIndex(idx);
    } else {
      finalizeSelection(idx);
    }
  };

  const handleTeacherConfirm = () => {
    if (pendingIndex === null || lockedResult) return;
    finalizeSelection(pendingIndex);
  };

  const handleSkip = () => {
    if (lockedResult) return;
    const spent =
      config.timePerQuestion > 0 ? config.timePerQuestion - timeLeft : 0;
    const outcome = onSubmitAnswer({
      selectedIndex: null,
      isSkipped: true,
      timeRemaining: timeLeft,
      timeSpent: spent,
    });
    setLockedResult({
      selectedIndex: null,
      isSkipped: true,
      ...outcome,
    });
  };

  const handleFiftyFifty = () => {
    if (usedFiftyFifty || lockedResult) return;
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== question.correctIndex);
    // Deterministic shuffle using question id hash
    const picked = wrongIndices.slice(0, 2);
    setEliminatedIndices(picked);
    setUsedFiftyFifty(true);
    if (pendingIndex !== null && picked.includes(pendingIndex)) {
      setPendingIndex(null);
    }
  };

  const handleSwap = () => {
    if (usedSwap || lockedResult) return;
    const ok = onSwapQuestion();
    setUsedSwap(true);
    if (!ok) {
      setSwapMessage('Không còn câu hỏi dự phòng phù hợp trong ngân hàng.');
    }
  };

  const handleReadAloud = () => {
    const fullText = [
      question.passage ? `Đoạn văn: ${question.passage}.` : '',
      question.content,
      ...question.options.map((opt, idx) => `Phương án ${OPTION_LETTERS[idx]}: ${opt}`),
    ]
      .filter(Boolean)
      .join(' ');
    onSpeakQuestion(fullText);
  };

  // Keyboard shortcuts 1-4 / A-D
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (lockedResult || paused) return;
      const key = e.key.toUpperCase();
      const map: Record<string, number> = {
        '1': 0,
        A: 0,
        '2': 1,
        B: 1,
        '3': 2,
        C: 2,
        '4': 3,
        D: 3,
      };
      if (key in map) {
        handleOptionClick(map[key]);
      } else if (key === 'ENTER' && config.requireTeacherConfirm && pendingIndex !== null) {
        handleTeacherConfirm();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const timePercent = useMemo(() => {
    if (config.timePerQuestion <= 0) return 100;
    return Math.max(0, Math.round((timeLeft / config.timePerQuestion) * 100));
  }, [timeLeft, config.timePerQuestion]);

  return (
    <div className="relative z-20 w-full h-full overflow-y-auto bg-[#082B3D]/95 p-3 md:p-6 flex flex-col justify-between gap-4">
      {/* TOP BAR: Logo, Active Team, Question #, Score, Keys, Countdown */}
      <header className="max-w-6xl w-full mx-auto card-3d-navy rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMap}
            className="p-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/10 text-[#FFD166] cursor-pointer"
            title="Xem Bản đồ 3D"
          >
            <Compass className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold text-[#61DDB5]">
              {zoneInfo.name} · {question.subject} Lớp {question.grade} · {question.difficulty}
            </div>
            <div className="font-display text-lg md:text-xl font-extrabold text-[#FFF6DF] tabular-nums">
              Câu {questionIndex + 1} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Active Team (Teacher-controlled mode lets teacher switch team) */}
        <div className="flex items-center gap-3 flex-wrap">
          {config.gameMode === 'teacher_control' && !lockedResult ? (
            <div className="flex items-center gap-1.5 bg-[#061f2d] p-1 rounded-xl border border-[#61DDB5]/30">
              {teams.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => onSelectActiveTeam(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    idx === activeTeamIndex
                      ? 'bg-[#FFD166] text-[#082B3D]'
                      : 'text-[#FFF6DF]/75 hover:text-white'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 bg-[#061f2d] px-4 py-2 rounded-xl border border-[#FFD166]/45">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: activeTeam.color }}
              />
              <span className="font-display font-bold text-sm md:text-base text-[#FFF6DF]">
                {activeTeam.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 bg-[#061f2d] px-4 py-2 rounded-xl border border-white/10 text-sm font-bold tabular-nums">
            <span className="text-[#FFD166]">{activeTeam.score} điểm</span>
            <span className="text-[#61DDB5] inline-flex items-center gap-1">
              <KeyRound className="w-4 h-4" />
              {activeTeam.keys}
            </span>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-display font-extrabold text-lg tabular-nums ${
              config.timePerQuestion > 0 && timeLeft <= 5
                ? 'bg-rose-900/80 border-rose-400 text-rose-200'
                : 'bg-[#061f2d] border-[#61DDB5]/35 text-[#FFF6DF]'
            }`}
          >
            <Clock className="w-5 h-5 text-[#FF9F43]" />
            {config.timePerQuestion > 0 ? `${timeLeft}s` : '∞'}
          </div>
        </div>

        {/* Countdown Progress Bar */}
        {config.timePerQuestion > 0 && (
          <div className="w-full h-2 rounded-full bg-[#061f2d] overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${timePercent}%`,
                backgroundColor: timeLeft <= 5 ? '#f43f5e' : '#61DDB5',
              }}
            />
          </div>
        )}
      </header>

      {/* CENTER: Large Projector-Friendly Question Card */}
      <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center gap-4">
        <div
          className={`card-3d-navy rounded-3xl p-5 md:p-8 space-y-5 relative ${
            lockedResult && !lockedResult.isCorrect && !lockedResult.isSkipped
              ? 'animate-gentle-shake border-rose-400/70'
              : lockedResult?.isCorrect
                ? 'border-[#FFD166] shadow-[0_0_32px_rgba(255,209,102,0.3)]'
                : ''
          }`}
        >
          {/* Floating Gold Coins on Correct Answer */}
          {lockedResult?.isCorrect && (
            <div className="pointer-events-none absolute right-8 top-4 flex gap-2">
              {['🪙', '🔑', '🪙'].map((ic, i) => (
                <span
                  key={i}
                  className="text-3xl animate-coin-float"
                  style={{ animationDelay: `${i * 110}ms` }}
                >
                  {ic}
                </span>
              ))}
            </div>
          )}

          {/* Optional Passage */}
          {question.passage && (
            <div className="rounded-2xl bg-[#061f2d] px-5 py-4 border border-[#61DDB5]/30 text-base md:text-lg leading-relaxed text-[#FFF6DF] italic">
              “{question.passage}”
            </div>
          )}

          {/* Main Question Prompt */}
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-snug text-[#FFF6DF] [text-wrap:balance]">
            {question.content}
          </h2>

          {/* Optional Formula, Illustration, Table */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            {question.illustration && (
              <QuestionVisual illustration={question.illustration} />
            )}

            {question.formula && (
              <div className="rounded-2xl bg-[#061f2d] px-6 py-4 border border-[#FFD166]/45 font-mono text-xl md:text-2xl font-extrabold text-[#FFD166] tracking-wide">
                {question.formula}
              </div>
            )}

            {question.tableData && (
              <div className="w-full max-w-lg overflow-x-auto rounded-xl border border-[#61DDB5]/30 bg-[#061f2d]">
                <table className="w-full text-left text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-white/15 bg-[#087E9A]/40">
                      {question.tableData.headers.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-bold text-[#FFD166]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {question.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b last:border-b-0 border-white/10">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-4 py-2 tabular-nums text-[#FFF6DF]"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hint Banner */}
          {showHint && (
            <div className="rounded-xl bg-[#087E9A]/35 border border-[#61DDB5] px-4 py-3 text-sm md:text-base text-[#FFF6DF] flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#FFD166] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#FFD166]">Gợi ý: </strong>
                {question.hint}
              </div>
            </div>
          )}

          {swapMessage && (
            <div className="text-xs text-[#FF9F43] font-semibold">{swapMessage}</div>
          )}

          {/* 4 Tactile 3D Answer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {question.options.map((optText, idx) => {
              const isEliminated = eliminatedIndices.includes(idx);
              const isSelectedPending = pendingIndex === idx && !lockedResult;
              const isCorrectOption = idx === question.correctIndex;
              const isPickedWrong =
                lockedResult &&
                lockedResult.selectedIndex === idx &&
                !lockedResult.isCorrect;

              let cardClasses =
                'bg-[#0a3850] border-2 border-[#61DDB5]/30 text-[#FFF6DF] hover:border-[#FFD166]';

              if (isEliminated) {
                cardClasses =
                  'bg-[#061f2d]/45 border-2 border-white/5 text-[#FFF6DF]/25 opacity-45 cursor-not-allowed';
              } else if (lockedResult) {
                if (isCorrectOption) {
                  cardClasses =
                    'bg-[#238B55] border-2 border-[#FFD166] text-white';
                } else if (isPickedWrong) {
                  cardClasses =
                    'bg-rose-800/85 border-2 border-rose-400 text-white';
                } else {
                  cardClasses =
                    'bg-[#061f2d]/70 border-2 border-white/10 text-[#FFF6DF]/55';
                }
              } else if (isSelectedPending) {
                cardClasses =
                  'bg-[#087E9A] border-2 border-[#FFD166] text-white';
              }

              return (
                <button
                  key={idx}
                  disabled={Boolean(lockedResult) || isEliminated || paused}
                  onClick={() => handleOptionClick(idx)}
                  className={`answer-card-3d rounded-2xl px-5 py-4 text-left flex items-center gap-4 cursor-pointer disabled:cursor-default ${cardClasses}`}
                >
                  <span
                    className={`w-11 h-11 rounded-xl font-display text-xl font-extrabold flex items-center justify-center shrink-0 ${
                      lockedResult && isCorrectOption
                        ? 'bg-[#FFD166] text-[#082B3D]'
                        : isSelectedPending
                          ? 'bg-[#FFD166] text-[#082B3D]'
                          : 'bg-[#061f2d] text-[#FFD166] border border-[#FFD166]/40'
                    }`}
                  >
                    {OPTION_LETTERS[idx]}
                  </span>
                  <span className="font-semibold text-base md:text-xl leading-snug flex-1">
                    {isEliminated ? '— Đã loại trừ —' : optText}
                  </span>
                  {lockedResult && isCorrectOption && (
                    <CheckCircle2 className="w-6 h-6 text-[#FFD166] shrink-0" />
                  )}
                  {isPickedWrong && (
                    <XCircle className="w-6 h-6 text-rose-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation Box after Answering */}
          {lockedResult && (
            <div
              className={`rounded-2xl p-4 md:p-5 border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                lockedResult.isCorrect
                  ? 'bg-[#175c39]/90 border-[#61DDB5]'
                  : 'bg-[#061f2d] border-[#FF9F43]'
              }`}
            >
              <div className="space-y-1">
                <div className="font-display text-lg font-extrabold flex items-center gap-2">
                  {lockedResult.isCorrect ? (
                    <span className="text-[#FFD166]">
                      CHÍNH XÁC! +{lockedResult.pointsAwarded} ĐIỂM
                      {lockedResult.stageBonusPoints > 0
                        ? ` (Bao gồm +${lockedResult.stageBonusPoints} điểm thưởng chặng!)`
                        : ''}
                      {' · +1 CHÌA KHÓA VÀNG'}
                    </span>
                  ) : lockedResult.isSkipped ? (
                    <span className="text-[#FF9F43]">
                      Đã bỏ qua câu hỏi · Đáp án đúng là {OPTION_LETTERS[question.correctIndex]}
                    </span>
                  ) : (
                    <span className="text-[#FF9F43]">
                      {lockedResult.selectedIndex === null
                        ? 'Hết thời gian! '
                        : 'Chưa chính xác! '}
                      Đáp án đúng là {OPTION_LETTERS[question.correctIndex]}
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-[#FFF6DF]/90">
                  <strong>Giải thích: </strong>
                  {question.explanation}
                </p>
              </div>

              <button
                onClick={onProceedNext}
                className="btn-3d-gold px-6 py-3.5 rounded-xl font-display text-base font-extrabold inline-flex items-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
              >
                {questionIndex + 1 >= totalQuestions
                  ? 'ĐẾN RƯƠNG KHO BÁU'
                  : 'TIẾP TỤC HÀNH TRÌNH'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM LIFELINE & TEACHER CONTROL BAR */}
      <footer className="max-w-5xl w-full mx-auto card-3d-navy rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {config.lifelines.fiftyFifty && (
            <button
              onClick={handleFiftyFifty}
              disabled={usedFiftyFifty || Boolean(lockedResult)}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Split className="w-4 h-4 text-[#FFD166]" />
              50:50
            </button>
          )}
          {config.lifelines.hint && (
            <button
              onClick={() => setShowHint(true)}
              disabled={showHint}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#61DDB5]" />
              Gợi ý
            </button>
          )}
          {config.lifelines.readAloud && (
            <button
              onClick={handleReadAloud}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4 text-[#FF9F43]" />
              Nghe câu hỏi
            </button>
          )}
          {config.lifelines.swap && (
            <button
              onClick={handleSwap}
              disabled={usedSwap || Boolean(lockedResult)}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs md:text-sm font-bold text-[#FFF6DF] inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 text-[#61DDB5]" />
              Đổi câu hỏi
            </button>
          )}
          {config.lifelines.skip && (
            <button
              onClick={handleSkip}
              disabled={Boolean(lockedResult)}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs md:text-sm font-bold text-[#FFF6DF]/90 inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <SkipForward className="w-4 h-4 text-[#FF9F43]" />
              Bỏ qua (GV)
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPaused((p) => !p)}
            disabled={Boolean(lockedResult)}
            className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs md:text-sm font-bold inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            {paused ? (
              <>
                <Play className="w-4 h-4 text-[#61DDB5]" /> Tiếp tục
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 text-[#FFD166]" /> Tạm dừng
              </>
            )}
          </button>

          {config.requireTeacherConfirm && !lockedResult && (
            <button
              onClick={handleTeacherConfirm}
              disabled={pendingIndex === null}
              className="btn-3d-emerald px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              Giáo viên xác nhận
            </button>
          )}
        </div>
      </footer>

      {/* Pause Overlay */}
      {paused && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
          <div className="card-3d-navy rounded-3xl p-8 max-w-md w-full text-center space-y-4">
            <h3 className="font-display text-2xl font-extrabold text-[#FFD166]">
              Trò chơi đang tạm dừng
            </h3>
            <p className="text-sm text-[#FFF6DF]/85">
              Đồng hồ đếm ngược đã tạm ngừng để giáo viên trao đổi cùng học sinh.
            </p>
            <button
              onClick={() => setPaused(false)}
              className="btn-3d-gold px-7 py-3 rounded-2xl font-display font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Tiếp tục thi đấu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
