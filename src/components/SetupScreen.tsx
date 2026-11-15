import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Award,
  CheckSquare,
  Play,
  SlidersHorizontal,
  Users,
  Volume2,
} from 'lucide-react';
import {
  TEAM_PALETTE,
  type DifficultyFilter,
  type GameConfig,
  type GameMode,
  type GameSettings,
  type GradeFilter,
  type Question,
  type SubjectFilter,
} from '../types/game';

interface SetupScreenProps {
  config: GameConfig;
  settings: GameSettings;
  questions: Question[];
  onChangeConfig: (next: GameConfig) => void;
  onChangeSettings: (next: GameSettings) => void;
  onBack: () => void;
  onStartGame: () => void;
}

export function filterMatchingQuestions(
  questions: Question[],
  config: Pick<GameConfig, 'subjectFilter' | 'gradeFilter' | 'difficultyFilter'>,
): Question[] {
  return questions.filter((q) => {
    if (config.subjectFilter !== 'Tổng hợp' && q.subject !== config.subjectFilter) {
      return false;
    }
    if (config.gradeFilter !== 'all' && q.grade !== config.gradeFilter) {
      return false;
    }
    if (config.difficultyFilter !== 'all' && q.difficulty !== config.difficultyFilter) {
      return false;
    }
    return true;
  });
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  config,
  settings,
  questions,
  onChangeConfig,
  onChangeSettings,
  onBack,
  onStartGame,
}) => {
  const matching = useMemo(
    () => filterMatchingQuestions(questions, config),
    [questions, config],
  );

  const effectiveCount = Math.min(config.questionCount, matching.length);

  const handleTeamCountChange = (count: 2 | 3 | 4) => {
    const defaults = ['Đội Hải Âu', 'Đội Sư Tử', 'Đội Đại Bàng', 'Đội Cá Heo'];
    const nextNames = [...config.teamNames];
    while (nextNames.length < 4) {
      nextNames.push(defaults[nextNames.length] || `Đội ${nextNames.length + 1}`);
    }
    onChangeConfig({ ...config, teamCount: count, teamNames: nextNames });
  };

  return (
    <div className="relative z-10 w-full h-full overflow-y-auto bg-[#082B3D]/92 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/25 text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </button>
          <div className="text-center md:text-left">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#FFD166]">
              THIẾT LẬP HÀNH TRÌNH KHÁM PHÁ
            </h1>
            <p className="text-xs md:text-sm text-[#FFF6DF]/75">
              Tùy chỉnh lớp học, môn học, số đội và luật chơi trước khi xuất phát
            </p>
          </div>
          <div className="rounded-xl bg-[#061f2d] px-4 py-2.5 border border-[#61DDB5]/30 text-sm">
            Câu hỏi phù hợp:{' '}
            <span
              className={`font-display font-extrabold tabular-nums ${
                matching.length > 0 ? 'text-[#61DDB5]' : 'text-rose-400'
              }`}
            >
              {matching.length} câu
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Class, Subject, Grade, Difficulty */}
          <div className="card-3d-navy rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <SlidersHorizontal className="w-5 h-5 text-[#FFD166]" />
              <h2 className="font-display text-lg font-bold text-[#FFF6DF]">
                1. Thông tin lớp & Nội dung
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">Tên lớp</span>
                <input
                  type="text"
                  value={config.className}
                  onChange={(e) =>
                    onChangeConfig({ ...config, className: e.target.value })
                  }
                  placeholder="Ví dụ: Lớp 3A1"
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-[#61DDB5]/30 px-3.5 py-2.5 text-sm text-[#FFF6DF] focus:outline-none focus:border-[#FFD166]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">Tên hoạt động</span>
                <input
                  type="text"
                  value={config.activityName}
                  onChange={(e) =>
                    onChangeConfig({ ...config, activityName: e.target.value })
                  }
                  placeholder="Ví dụ: Ôn tập Giữa học kì I"
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-[#61DDB5]/30 px-3.5 py-2.5 text-sm text-[#FFF6DF] focus:outline-none focus:border-[#FFD166]"
                />
              </label>
            </div>

            {/* Subject Selection */}
            <div>
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block mb-2">
                Chọn môn học
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Toán', 'Tiếng Việt', 'Tổng hợp'] as SubjectFilter[]).map((subj) => (
                  <button
                    key={subj}
                    onClick={() =>
                      onChangeConfig({ ...config, subjectFilter: subj })
                    }
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      config.subjectFilter === subj
                        ? 'bg-[#FFD166] text-[#082B3D] border-[#FFD166]'
                        : 'bg-[#061f2d] text-[#FFF6DF]/85 border-white/15 hover:border-[#61DDB5]'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div>
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block mb-2">
                Chọn khối lớp (1 – 5)
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {(['all', 1, 2, 3, 4, 5] as GradeFilter[]).map((g) => (
                  <button
                    key={String(g)}
                    onClick={() => onChangeConfig({ ...config, gradeFilter: g })}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      config.gradeFilter === g
                        ? 'bg-[#61DDB5] text-[#082B3D] border-[#61DDB5]'
                        : 'bg-[#061f2d] text-[#FFF6DF]/85 border-white/15 hover:border-[#61DDB5]'
                    }`}
                  >
                    {g === 'all' ? '1–5' : `Lớp ${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block mb-2">
                Mức độ câu hỏi
              </span>
              <select
                value={config.difficultyFilter}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    difficultyFilter: e.target.value as DifficultyFilter,
                  })
                }
                className="w-full rounded-xl bg-[#061f2d] border border-[#61DDB5]/30 px-3.5 py-2.5 text-sm text-[#FFF6DF] focus:outline-none focus:border-[#FFD166]"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng nâng cao">Vận dụng nâng cao</option>
              </select>
            </div>

            {/* Question Count & Time per Question */}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Số lượng câu hỏi
                </span>
                <select
                  value={config.questionCount}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      questionCount: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-[#61DDB5]/30 px-3 py-2.5 text-sm text-[#FFF6DF]"
                >
                  {[5, 8, 10, 12, 15, 20, 25, 30].map((n) => (
                    <option key={n} value={n}>
                      {n} câu hỏi
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Thời gian mỗi câu
                </span>
                <select
                  value={config.timePerQuestion}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      timePerQuestion: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-[#61DDB5]/30 px-3 py-2.5 text-sm text-[#FFF6DF]"
                >
                  <option value={15}>15 giây</option>
                  <option value={20}>20 giây</option>
                  <option value={30}>30 giây</option>
                  <option value={45}>45 giây</option>
                  <option value={60}>60 giây</option>
                  <option value={0}>Không giới hạn</option>
                </select>
              </label>
            </div>
          </div>

          {/* Column 2: Teams & Game Modes */}
          <div className="card-3d-navy rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Users className="w-5 h-5 text-[#61DDB5]" />
              <h2 className="font-display text-lg font-bold text-[#FFF6DF]">
                2. Đội chơi & Chế độ thi đấu
              </h2>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block mb-2">
                Số đội tham gia (2 – 4 đội)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {([2, 3, 4] as const).map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => handleTeamCountChange(cnt)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                      config.teamCount === cnt
                        ? 'bg-[#FF9F43] text-[#082B3D] border-[#FF9F43]'
                        : 'bg-[#061f2d] text-[#FFF6DF]/85 border-white/15 hover:border-[#FF9F43]'
                    }`}
                  >
                    {cnt} Đội
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block">
                Nhập tên từng đội
              </span>
              {Array.from({ length: config.teamCount }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: TEAM_PALETTE[idx].color }}
                  />
                  <input
                    type="text"
                    value={config.teamNames[idx] || ''}
                    onChange={(e) => {
                      const next = [...config.teamNames];
                      next[idx] = e.target.value;
                      onChangeConfig({ ...config, teamNames: next });
                    }}
                    placeholder={`Tên Đội ${idx + 1}`}
                    className="flex-1 rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm text-[#FFF6DF] focus:outline-none focus:border-[#FFD166]"
                  />
                </div>
              ))}
            </div>

            <div>
              <span className="text-xs font-semibold text-[#FFF6DF]/80 block mb-2">
                Chế độ chơi
              </span>
              <div className="space-y-2">
                {(
                  [
                    {
                      id: 'turn_based',
                      title: 'Chơi theo lượt',
                      desc: 'Các đội lần lượt trả lời tuần tự qua 5 khu vực đảo',
                    },
                    {
                      id: 'team_battle',
                      title: 'Thi đấu giữa các đội',
                      desc: 'Tranh đua điểm số & thưởng tốc độ trực tiếp trên bảng xếp hạng',
                    },
                    {
                      id: 'teacher_control',
                      title: 'Giáo viên điều khiển',
                      desc: 'Giáo viên chọn đội trả lời và xác nhận trước khi khóa đáp án',
                    },
                    {
                      id: 'projector_fullscreen',
                      title: 'Trình chiếu toàn màn hình',
                      desc: 'Tự động bật toàn màn hình tối ưu cho máy chiếu lớp học',
                    },
                  ] as { id: GameMode; title: string; desc: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      onChangeConfig({
                        ...config,
                        gameMode: m.id,
                        requireTeacherConfirm:
                          m.id === 'teacher_control'
                            ? true
                            : config.requireTeacherConfirm,
                        scoring: {
                          ...config.scoring,
                          speedBonus: m.id === 'team_battle',
                        },
                      })
                    }
                    className={`w-full text-left rounded-xl px-3.5 py-2.5 border transition-colors cursor-pointer ${
                      config.gameMode === m.id
                        ? 'bg-[#087E9A] border-[#61DDB5] text-white'
                        : 'bg-[#061f2d] border-white/10 text-[#FFF6DF]/85 hover:border-[#61DDB5]/50'
                    }`}
                  >
                    <div className="font-bold text-sm">{m.title}</div>
                    <div className="text-xs opacity-80">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Scoring, Lifelines, Audio & MC */}
          <div className="card-3d-navy rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Award className="w-5 h-5 text-[#FF9F43]" />
              <h2 className="font-display text-lg font-bold text-[#FFF6DF]">
                3. Tính điểm, Trợ giúp & Âm thanh
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Trả lời đúng (+)
                </span>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={config.scoring.correctPoints}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      scoring: {
                        ...config.scoring,
                        correctPoints: Math.max(10, Number(e.target.value) || 100),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm tabular-nums text-[#FFD166] font-bold"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Trả lời sai (-)
                </span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={config.scoring.wrongPenalty}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      scoring: {
                        ...config.scoring,
                        wrongPenalty: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm tabular-nums text-[#FFF6DF]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Thưởng qua chặng
                </span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={config.scoring.stageBonus}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      scoring: {
                        ...config.scoring,
                        stageBonus: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm tabular-nums text-[#61DDB5]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[#FFF6DF]/80">
                  Mở rương cuối
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={config.scoring.chestBonus}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      scoring: {
                        ...config.scoring,
                        chestBonus: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm tabular-nums text-[#FF9F43]"
                />
              </label>
            </div>

            {/* Lifeline Permissions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FFF6DF]/80">
                <CheckSquare className="w-4 h-4 text-[#61DDB5]" />
                Quyền trợ giúp được phép sử dụng
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'fiftyFifty' as const, label: '50:50 (Loại 2 đáp án)' },
                  { key: 'hint' as const, label: 'Gợi ý kiến thức' },
                  { key: 'readAloud' as const, label: 'MC đọc câu hỏi' },
                  { key: 'swap' as const, label: 'Đổi câu hỏi' },
                  { key: 'skip' as const, label: 'GV bỏ qua câu' },
                ].map((lf) => (
                  <label
                    key={lf.key}
                    className="flex items-center gap-2 rounded-lg bg-[#061f2d] px-2.5 py-2 border border-white/10 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={config.lifelines[lf.key]}
                      onChange={(e) =>
                        onChangeConfig({
                          ...config,
                          lifelines: {
                            ...config.lifelines,
                            [lf.key]: e.target.checked,
                          },
                        })
                      }
                      className="accent-[#61DDB5]"
                    />
                    <span>{lf.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Audio & Shuffle Toggles */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#FFF6DF]/80">
                <Volume2 className="w-4 h-4 text-[#FFD166]" />
                Tùy chọn điều phối & âm thanh
              </div>

              <label className="flex items-center justify-between rounded-lg bg-[#061f2d] px-3 py-2 border border-white/10 cursor-pointer">
                <span>Bật hiệu ứng âm thanh</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onChangeSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="accent-[#FFD166]"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg bg-[#061f2d] px-3 py-2 border border-white/10 cursor-pointer">
                <span>Bật giọng đọc MC 3D</span>
                <input
                  type="checkbox"
                  checked={settings.mcVoiceEnabled}
                  onChange={(e) =>
                    onChangeSettings({
                      ...settings,
                      mcVoiceEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#FFD166]"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg bg-[#061f2d] px-3 py-2 border border-white/10 cursor-pointer">
                <span>Trộn thứ tự câu hỏi & phương án</span>
                <input
                  type="checkbox"
                  checked={config.shuffleQuestions}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      shuffleQuestions: e.target.checked,
                      shuffleOptions: e.target.checked,
                    })
                  }
                  className="accent-[#61DDB5]"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg bg-[#061f2d] px-3 py-2 border border-white/10 cursor-pointer">
                <span>Giáo viên xác nhận trước khi chấm</span>
                <input
                  type="checkbox"
                  checked={config.requireTeacherConfirm}
                  onChange={(e) =>
                    onChangeConfig({
                      ...config,
                      requireTeacherConfirm: e.target.checked,
                    })
                  }
                  className="accent-[#FF9F43]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Start Bar */}
        <div className="card-3d-navy rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#FFF6DF]/90">
            {matching.length === 0 ? (
              <span className="text-rose-400 font-bold">
                Không có câu hỏi nào khớp với bộ lọc hiện tại. Hãy chọn "Tổng hợp" hoặc thêm câu hỏi trong Ngân hàng!
              </span>
            ) : (
              <span>
                Sẵn sàng xuất phát với{' '}
                <strong className="text-[#FFD166] tabular-nums">{effectiveCount} câu hỏi</strong>{' '}
                cho <strong className="text-[#61DDB5]">{config.teamCount} đội</strong> ({config.className || 'Lớp học'}).
              </span>
            )}
          </div>

          <button
            onClick={onStartGame}
            disabled={matching.length === 0}
            className="btn-3d-gold px-8 py-3.5 rounded-2xl font-display text-lg font-extrabold inline-flex items-center gap-2.5 disabled:opacity-45 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-5 h-5 fill-current" />
            LÊN ĐẢO KHO BÁU ({effectiveCount} CÂU)
          </button>
        </div>
      </div>
    </div>
  );
};
