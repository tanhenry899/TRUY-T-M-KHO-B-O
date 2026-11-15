import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  HardDrive,
  Maximize2,
  Minimize2,
  Monitor,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { GameSettings, Question } from '../types/game';
import { downloadOfflineTeacherKitZip } from '../engine/report';

interface GuideModalProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
}

export const GuideModal: React.FC<GuideModalProps> = ({ open, onClose, questions }) => {
  const [tab, setTab] = useState<'play' | 'teacher' | 'offline'>('play');
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const handleDownloadKit = async () => {
    setDownloading(true);
    try {
      await downloadOfflineTeacherKitZip(questions);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="card-3d-navy w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#61DDB5]/25">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#FFD166]" />
            <h2 className="font-display text-xl font-bold text-[#FFF6DF]">
              Hướng Dẫn & Cài Đặt Ngoại Tuyến
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#FFF6DF]/80 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Đóng hướng dẫn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
          <button
            onClick={() => setTab('play')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
              tab === 'play'
                ? 'bg-[#087E9A] text-white'
                : 'text-[#FFF6DF]/70 hover:text-white'
            }`}
          >
            Luật chơi phiêu lưu
          </button>
          <button
            onClick={() => setTab('teacher')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
              tab === 'teacher'
                ? 'bg-[#087E9A] text-white'
                : 'text-[#FFF6DF]/70 hover:text-white'
            }`}
          >
            Trình chiếu lớp học
          </button>
          <button
            onClick={() => setTab('offline')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
              tab === 'offline'
                ? 'bg-[#087E9A] text-white'
                : 'text-[#FFF6DF]/70 hover:text-white'
            }`}
          >
            Chạy Offline & Gói ZIP
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#FFF6DF]/90">
          {tab === 'play' && (
            <>
              <div className="rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
                <h3 className="font-display text-base font-bold text-[#FFD166] mb-2">
                  Hành trình qua 5 khu vực trên Đảo Kho Báu 3D
                </h3>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    <strong>Khu vực 1 – Rừng Khởi Đầu:</strong> Vượt cổng gỗ cổ thụ để bắt đầu cuộc thám hiểm.
                  </li>
                  <li>
                    <strong>Khu vực 2 – Cầu Ánh Sáng:</strong> Băng qua cầu treo và thác nước ngọc bích nhiều tầng.
                  </li>
                  <li>
                    <strong>Khu vực 3 – Hang Động Bí Ẩn:</strong> Khám phá hang đá pha lê nhiều màu phát sáng.
                  </li>
                  <li>
                    <strong>Khu vực 4 – Núi Lửa Thử Thách:</strong> Vượt cầu đá qua dòng dung nham rực sáng.
                  </li>
                  <li>
                    <strong>Khu vực 5 – Đảo Kho Báu:</strong> Tiến lên Đền Cổ và mở Rương Vàng Huyền Thoại!
                  </li>
                </ol>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#061f2d] p-4 border border-white/10">
                  <h4 className="font-bold text-[#61DDB5] mb-1">Điểm thưởng mặc định</h4>
                  <ul className="space-y-1 text-xs text-[#FFF6DF]/85">
                    <li>• Trả lời đúng: +100 điểm và 1 Chìa khóa vàng</li>
                    <li>• Hoàn thành mỗi khu vực: +50 điểm thưởng</li>
                    <li>• Mở Rương Kho Báu cuối cùng: +200 điểm</li>
                    <li>• Trả lời sai: 0 điểm (không trừ điểm mặc định)</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-[#061f2d] p-4 border border-white/10">
                  <h4 className="font-bold text-[#FF9F43] mb-1">Hệ thống trợ giúp</h4>
                  <ul className="space-y-1 text-xs text-[#FFF6DF]/85">
                    <li>• 50:50 — Loại bỏ 2 đáp án sai</li>
                    <li>• Gợi ý — Hiện gợi ý kiến thức từ MC</li>
                    <li>• Nghe câu hỏi — MC đọc to bằng giọng tiếng Việt</li>
                    <li>• Đổi câu hỏi / Bỏ qua — Dành cho giáo viên điều phối</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {tab === 'teacher' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
                <h3 className="font-display text-base font-bold text-[#FFD166] mb-2">
                  Phím tắt & Điều khiển nhanh trên máy chiếu
                </h3>
                <ul className="space-y-1.5">
                  <li>
                    • Nhấn phím <kbd className="px-2 py-0.5 rounded bg-[#082B3D] border border-white/20">1</kbd>{' '}
                    <kbd className="px-2 py-0.5 rounded bg-[#082B3D] border border-white/20">2</kbd>{' '}
                    <kbd className="px-2 py-0.5 rounded bg-[#082B3D] border border-white/20">3</kbd>{' '}
                    <kbd className="px-2 py-0.5 rounded bg-[#082B3D] border border-white/20">4</kbd> hoặc{' '}
                    <kbd className="px-2 py-0.5 rounded bg-[#082B3D] border border-white/20">A-D</kbd> để chọn đáp án.
                  </li>
                  <li>
                    • Trong chế độ <strong>Giáo viên điều khiển</strong>, giáo viên có thể chuyển đổi đội đang trả lời ngay trên màn hình câu hỏi và bấm <em>Xác nhận đáp án</em> trước khi chấm điểm.
                  </li>
                  <li>
                    • Kéo chuột trên Bản đồ 3D để xoay góc nhìn toàn cảnh hòn đảo; nhấn vào tên khu vực ở thanh công cụ dưới cùng để camera bay tới khu vực đó.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'offline' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#061f2d] p-4 border border-[#61DDB5]/25">
                <div className="flex items-start gap-3">
                  <HardDrive className="w-5 h-5 text-[#61DDB5] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-base font-bold text-[#FFF6DF]">
                      Hoạt động 100% không cần Internet
                    </h3>
                    <p className="mt-1 text-xs text-[#FFF6DF]/80">
                      Toàn bộ mô hình 3D, vật liệu, âm thanh Web Audio, phông chữ tiếng Việt, hình minh họa SVG và ngân hàng câu hỏi đều được đóng gói cục bộ trong ứng dụng và lưu an toàn bằng IndexedDB / LocalStorage. Không sử dụng CDN ngoài và không yêu cầu đăng nhập.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[#061f2d] p-4 border border-[#FFD166]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#FFD166]">
                    Tải gói tài liệu & biểu mẫu giáo viên (.ZIP)
                  </h4>
                  <p className="text-xs text-[#FFF6DF]/80 mt-1">
                    Bao gồm: sample_questions.csv, question_template.csv (chuẩn Excel UTF-8), bản sao lưu JSON và hướng dẫn sử dụng.
                  </p>
                </div>
                <button
                  onClick={handleDownloadKit}
                  disabled={downloading}
                  className="btn-3d-gold px-4 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shrink-0 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  {downloading ? 'Đang đóng gói...' : 'Tải gói ZIP'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-3d-emerald px-6 py-2 rounded-xl font-bold text-sm"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdate: (next: GameSettings) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  settings,
  onUpdate,
  isFullscreen,
  onToggleFullscreen,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="card-3d-navy w-full max-w-lg rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#61DDB5]/25">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-[#FFD166]" />
            <h2 className="font-display text-xl font-bold text-[#FFF6DF]">
              Cài Đặt Hệ Thống & Đồ Họa 3D
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#FFF6DF]/80 hover:bg-white/10 hover:text-white"
            aria-label="Đóng cài đặt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          {/* Graphics Quality */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-4 h-4 text-[#61DDB5]" />
              <div>
                <div className="font-semibold">Chất lượng đồ họa 3D</div>
                <div className="text-xs text-[#FFF6DF]/65">Chọn Thấp cho máy tính lớp học cấu hình nhẹ</div>
              </div>
            </div>
            <div className="flex rounded-lg bg-[#061f2d] p-1 border border-white/10">
              <button
                onClick={() => onUpdate({ ...settings, graphicsQuality: 'high' })}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  settings.graphicsQuality === 'high'
                    ? 'bg-[#61DDB5] text-[#082B3D]'
                    : 'text-[#FFF6DF]/75'
                }`}
              >
                Cao
              </button>
              <button
                onClick={() =>
                  onUpdate({
                    ...settings,
                    graphicsQuality: 'low',
                    enableShadows: false,
                  })
                }
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  settings.graphicsQuality === 'low'
                    ? 'bg-[#FFD166] text-[#082B3D]'
                    : 'text-[#FFF6DF]/75'
                }`}
              >
                Thấp
              </button>
            </div>
          </div>

          {/* Toggles */}
          {[
            {
              key: 'enableShadows' as const,
              label: 'Bóng đổ mềm 3D (Shadows)',
              sub: 'Tắt giúp tăng tốc độ khung hình khi trình chiếu',
              icon: <Sparkles className="w-4 h-4 text-[#FFD166]" />,
            },
            {
              key: 'enableParticles' as const,
              label: 'Hiệu ứng hạt (Khói núi lửa, pháo hoa, xu bay)',
              sub: 'Tắt nếu muốn giao diện tĩnh và nhẹ hơn',
              icon: <Sparkles className="w-4 h-4 text-[#FF9F43]" />,
            },
            {
              key: 'soundEnabled' as const,
              label: 'Hiệu ứng âm thanh trò chơi',
              sub: 'Âm thanh chọn đáp án, đồng xu, mở rương',
              icon: settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#61DDB5]" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ),
            },
            {
              key: 'musicEnabled' as const,
              label: 'Nhạc nền phiêu lưu nhẹ nhàng',
              sub: 'Giai điệu vui tươi phù hợp học sinh tiểu học',
              icon: <Volume2 className="w-4 h-4 text-[#FFD166]" />,
            },
            {
              key: 'mcVoiceEnabled' as const,
              label: 'Giọng đọc MC tiếng Việt',
              sub: 'Sử dụng giọng đọc tự nhiên trên thiết bị',
              icon: <Volume2 className="w-4 h-4 text-[#61DDB5]" />,
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-xl bg-[#061f2d] px-4 py-3 border border-white/10 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <div>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs text-[#FFF6DF]/65">{item.sub}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(e) =>
                  onUpdate({ ...settings, [item.key]: e.target.checked })
                }
                className="w-5 h-5 accent-[#61DDB5] cursor-pointer"
              />
            </label>
          ))}

          {/* Speech Rate */}
          <div className="rounded-xl bg-[#061f2d] px-4 py-3 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold">Tốc độ đọc MC</span>
              <span className="tabular-nums text-xs font-bold text-[#FFD166]">
                {settings.mcSpeechRate.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min={0.8}
              max={1.3}
              step={0.05}
              value={settings.mcSpeechRate}
              onChange={(e) =>
                onUpdate({ ...settings, mcSpeechRate: Number(e.target.value) })
              }
              className="w-full accent-[#FFD166]"
            />
          </div>

          {/* Fullscreen */}
          <div className="flex items-center justify-between rounded-xl bg-[#061f2d] px-4 py-3 border border-white/10">
            <span className="font-semibold">Chế độ trình chiếu toàn màn hình</span>
            <button
              onClick={onToggleFullscreen}
              className="px-3.5 py-1.5 rounded-lg bg-[#087E9A] hover:bg-[#0a95b5] text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" /> Thu nhỏ
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" /> Toàn màn hình
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="btn-3d-gold px-6 py-2 rounded-xl font-bold text-sm"
          >
            Lưu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExitModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirmReset: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  open,
  onCancel,
  onConfirmReset,
}) => {
  const [exited, setExited] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="card-3d-navy w-full max-w-md rounded-2xl p-6 text-center space-y-4">
        {!exited ? (
          <>
            <h2 className="font-display text-2xl font-bold text-[#FFD166]">
              Kết thúc phiên thám hiểm?
            </h2>
            <p className="text-sm text-[#FFF6DF]/85">
              Ngân hàng câu hỏi và lịch sử thi đấu của lớp vẫn được lưu trữ an toàn trên thiết bị.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm"
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  setExited(true);
                  onConfirmReset();
                }}
                className="btn-3d-orange px-5 py-2.5 rounded-xl font-bold text-sm"
              >
                Thoát phiên chơi
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold text-[#61DDB5]">
              Hẹn gặp lại các nhà thám hiểm!
            </h2>
            <p className="text-sm text-[#FFF6DF]/85">
              HỌC TẬP VUI – KHÁM PHÁ GIỎI – CHINH PHỤC KHO BÁU! Bạn có thể đóng tab trình duyệt hoặc nhấn nút bên dưới để mở lại hành trình bất cứ lúc nào.
            </p>
            <button
              onClick={() => {
                setExited(false);
                onCancel();
              }}
              className="btn-3d-gold px-6 py-2.5 rounded-xl font-bold text-sm"
            >
              Mở lại Trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};
