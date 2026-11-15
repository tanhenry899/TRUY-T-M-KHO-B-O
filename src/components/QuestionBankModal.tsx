import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Database,
  Download,
  Edit3,
  FileSpreadsheet,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  DifficultyLevel,
  GameSessionHistory,
  GradeLevel,
  Question,
  Subject,
} from '../types/game';
import {
  exportQuestionsToCsv,
  parseCsvToQuestions,
  SAMPLE_QUESTIONS,
  TEMPLATE_CSV_CONTENT,
} from '../data/sampleQuestions';
import {
  downloadOfflineTeacherKitZip,
  exportFullBackupJson,
  triggerFileDownload,
} from '../engine/report';

interface QuestionBankModalProps {
  questions: Question[];
  history: GameSessionHistory[];
  onSaveQuestions: (next: Question[]) => void;
  onBack: () => void;
}

const EMPTY_FORM = (): Omit<Question, 'id'> => ({
  subject: 'Toán',
  grade: 3,
  topic: '',
  lesson: '',
  difficulty: 'Thông hiểu',
  content: '',
  passage: '',
  formula: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  hint: '',
});

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  questions,
  history,
  onSaveQuestions,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterDiff, setFilterDiff] = useState<string>('all');

  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'ai'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Question, 'id'>>(EMPTY_FORM());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // AI Drafts awaiting teacher verification
  const [aiSubject, setAiSubject] = useState<Subject>('Toán');
  const [aiGrade, setAiGrade] = useState<GradeLevel>(3);
  const [aiTopic, setAiTopic] = useState('Phép nhân và chia trong phạm vi 1000');
  const [aiDiff, setAiDiff] = useState<DifficultyLevel>('Thông hiểu');
  const [aiCount, setAiCount] = useState(3);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDrafts, setAiDrafts] = useState<Question[]>([]);

  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const qLower = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
      if (filterGrade !== 'all' && String(q.grade) !== filterGrade) return false;
      if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
      if (!qLower) return true;
      return (
        q.id.toLowerCase().includes(qLower) ||
        q.content.toLowerCase().includes(qLower) ||
        q.topic.toLowerCase().includes(qLower) ||
        q.lesson.toLowerCase().includes(qLower)
      );
    });
  }, [questions, search, filterSubject, filterGrade, filterDiff]);

  const openNewEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setActiveTab('editor');
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setForm({
      subject: q.subject,
      grade: q.grade,
      topic: q.topic,
      lesson: q.lesson,
      difficulty: q.difficulty,
      content: q.content,
      passage: q.passage || '',
      formula: q.formula || '',
      illustration: q.illustration,
      tableData: q.tableData,
      options: [...q.options] as [string, string, string, string],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      hint: q.hint,
    });
    setActiveTab('editor');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setStatusMsg('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    const cleanOpts = form.options.map((o, idx) =>
      o.trim() ? o.trim() : `Phương án ${idx + 1}`,
    ) as [string, string, string, string];

    const record: Question = {
      id: editingId || `GV-${Date.now().toString().slice(-6)}`,
      subject: form.subject,
      grade: form.grade,
      topic: form.topic.trim() || 'Kiến thức trọng tâm',
      lesson: form.lesson.trim() || 'Bài ôn tập',
      difficulty: form.difficulty,
      content: form.content.trim(),
      passage: form.passage?.trim() || undefined,
      formula: form.formula?.trim() || undefined,
      illustration: form.illustration,
      tableData: form.tableData,
      options: cleanOpts,
      correctIndex: form.correctIndex,
      explanation: form.explanation.trim() || 'Đáp án đúng theo chuẩn kiến thức tiểu học.',
      hint: form.hint.trim() || 'Đọc kỹ yêu cầu đề bài và loại trừ phương án chưa hợp lý.',
    };

    const next = editingId
      ? questions.map((item) => (item.id === editingId ? record : item))
      : [record, ...questions];
    onSaveQuestions(next);
    setStatusMsg(
      editingId
        ? `Đã cập nhật câu hỏi ${record.id}.`
        : `Đã thêm mới câu hỏi ${record.id} vào ngân hàng.`,
    );
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    const next = questions.filter((q) => q.id !== id);
    onSaveQuestions(next);
    setStatusMsg(`Đã xóa câu hỏi ${id}.`);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const { questions: imported, errors } = parseCsvToQuestions(text);
    if (imported.length === 0) {
      setStatusMsg(errors[0] || 'Không đọc được câu hỏi nào từ tệp CSV.');
      return;
    }
    const existingIds = new Set(questions.map((q) => q.id));
    const merged = [
      ...imported.map((item) =>
        existingIds.has(item.id) ? { ...item, id: `${item.id}-${Date.now()}` } : item,
      ),
      ...questions,
    ];
    onSaveQuestions(merged);
    setStatusMsg(
      `Đã nhập thành công ${imported.length} câu hỏi từ CSV.${
        errors.length > 0 ? ` (${errors.length} dòng bị bỏ qua do thiếu cột)` : ''
      }`,
    );
  };

  const handleJsonRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed?.questions;
      if (!Array.isArray(list) || list.length === 0) {
        setStatusMsg('Tệp sao lưu JSON không chứa danh sách câu hỏi hợp lệ.');
        return;
      }
      onSaveQuestions(list as Question[]);
      setStatusMsg(`Đã khôi phục ${list.length} câu hỏi từ tệp sao lưu.`);
    } catch {
      setStatusMsg('Tệp JSON không hợp lệ.');
    }
  };

  const handleRestoreDefaults = () => {
    const existingIds = new Set(questions.map((q) => q.id));
    const missing = SAMPLE_QUESTIONS.filter((s) => !existingIds.has(s.id));
    if (missing.length === 0) {
      setStatusMsg('Tất cả câu hỏi mẫu chuẩn lớp 1–5 đã có sẵn trong ngân hàng.');
      return;
    }
    onSaveQuestions([...questions, ...missing]);
    setStatusMsg(`Đã bổ sung lại ${missing.length} câu hỏi mẫu mặc định.`);
  };

  const handleGenerateAi = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const resp = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          grade: aiGrade,
          topic: aiTopic,
          difficulty: aiDiff,
          count: aiCount,
          customPrompt: aiCustomPrompt,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setAiError(data.error || 'Không thể tạo câu hỏi từ AI.');
        return;
      }
      setAiDrafts(data.drafts || []);
    } catch {
      setAiError(
        'Hiện đang ngoại tuyến hoặc không kết nối được máy chủ AI. Bạn vẫn có thể thêm câu hỏi trực tiếp hoặc nhập từ CSV UTF-8.',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const approveDraft = (draft: Question) => {
    onSaveQuestions([draft, ...questions]);
    setAiDrafts((prev) => prev.filter((d) => d.id !== draft.id));
    setStatusMsg(`Giáo viên đã kiểm duyệt và thêm câu hỏi ${draft.id} vào ngân hàng chính thức.`);
  };

  const approveAllDrafts = () => {
    if (aiDrafts.length === 0) return;
    onSaveQuestions([...aiDrafts, ...questions]);
    setStatusMsg(`Đã duyệt ${aiDrafts.length} câu hỏi vào ngân hàng chính thức.`);
    setAiDrafts([]);
  };

  return (
    <div className="relative z-20 w-full h-full overflow-y-auto bg-[#082B3D]/95 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5 pb-10">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/25 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang chủ
          </button>

          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#FFD166]" />
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#FFD166]">
              NGÂN HÀNG CÂU HỎI ({questions.length} CÂU)
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openNewEditor}
              className="btn-3d-gold px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm câu hỏi
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="btn-3d-emerald px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Tạo từ AI (GV duyệt)
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className="rounded-xl bg-[#087E9A]/40 border border-[#61DDB5] px-4 py-3 text-sm text-[#FFF6DF] flex items-center justify-between gap-3">
            <span>{statusMsg}</span>
            <button
              onClick={() => setStatusMsg(null)}
              className="text-xs font-bold text-[#FFD166] hover:underline cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* CSV / Excel / Backup Action Strip */}
        <div className="card-3d-navy rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <button
              onClick={() => csvInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#61DDB5]" />
              Nhập CSV UTF-8
            </button>

            <button
              onClick={() =>
                triggerFileDownload(
                  `ngan_hang_cau_hoi_${new Date().toISOString().slice(0, 10)}.csv`,
                  exportQuestionsToCsv(questions),
                  'text/csv;charset=utf-8',
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FFD166]" />
              Xuất CSV
            </button>

            <button
              onClick={() =>
                triggerFileDownload(
                  'mau_cau_hoi_excel.csv',
                  TEMPLATE_CSV_CONTENT,
                  'text/csv;charset=utf-8',
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#61DDB5]/30 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#61DDB5]" />
              Mẫu Excel (.CSV)
            </button>

            <button
              onClick={() => exportFullBackupJson({ questions, history })}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#FF9F43]" />
              Sao lưu JSON
            </button>

            <input
              ref={jsonInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleJsonRestore}
              className="hidden"
            />
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#FF9F43]" />
              Khôi phục JSON
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRestoreDefaults}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#61DDB5]" />
              Nạp lại câu mẫu
            </button>
            <button
              onClick={() => downloadOfflineTeacherKitZip(questions)}
              className="px-3.5 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-[#FFD166]/35 text-xs font-bold text-[#FFD166] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Đóng gói ZIP
            </button>
          </div>
        </div>

        {/* Sub-Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80'
            }`}
          >
            Danh sách câu hỏi ({filtered.length})
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80'
            }`}
          >
            {editingId ? `Đang sửa: ${editingId}` : 'Soạn câu hỏi mới'}
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#FFD166] text-[#082B3D]'
                : 'bg-[#061f2d] text-[#FFF6DF]/80'
            }`}
          >
            Tạo câu hỏi bằng AI ({aiDrafts.length} chờ duyệt)
          </button>
        </div>

        {/* TAB 1: LIST & FILTER */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            <div className="card-3d-navy rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#61DDB5] absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mã, nội dung, chủ đề..."
                  className="w-full rounded-xl bg-[#061f2d] border border-white/15 pl-9 pr-3 py-2 text-sm text-[#FFF6DF] focus:outline-none focus:border-[#FFD166]"
                />
              </div>

              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm text-[#FFF6DF]"
              >
                <option value="all">Tất cả môn học</option>
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
              </select>

              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm text-[#FFF6DF]"
              >
                <option value="all">Tất cả khối lớp (1–5)</option>
                {[1, 2, 3, 4, 5].map((g) => (
                  <option key={g} value={String(g)}>
                    Lớp {g}
                  </option>
                ))}
              </select>

              <select
                value={filterDiff}
                onChange={(e) => setFilterDiff(e.target.value)}
                className="rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm text-[#FFF6DF]"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="Nhận biết">Nhận biết</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng nâng cao">Vận dụng nâng cao</option>
              </select>
            </div>

            <div className="space-y-3">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className="card-3d-navy rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold text-[#61DDB5]">
                      {q.id} · {q.subject} Lớp {q.grade} · {q.difficulty} · {q.topic} ({q.lesson})
                    </div>
                    <div className="font-semibold text-base text-[#FFF6DF]">
                      {q.content}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#FFF6DF]/75">
                      {q.options.map((o, idx) => (
                        <span
                          key={idx}
                          className={
                            idx === q.correctIndex
                              ? 'text-[#FFD166] font-bold'
                              : ''
                          }
                        >
                          {['A', 'B', 'C', 'D'][idx]}. {o}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(q)}
                      className="px-3 py-2 rounded-xl bg-[#061f2d] hover:bg-[#087E9A] border border-white/15 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FFD166]" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-800 border border-rose-500/30 text-xs font-bold text-rose-200 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT FORM */}
        {activeTab === 'editor' && (
          <form
            onSubmit={handleSaveForm}
            className="card-3d-navy rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-display text-xl font-bold text-[#FFD166]">
              {editingId ? `Chỉnh sửa câu hỏi ${editingId}` : 'Thêm câu hỏi mới'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">Môn học</span>
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value as Subject })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">Khối lớp</span>
                <select
                  value={form.grade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      grade: Number(e.target.value) as GradeLevel,
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                >
                  {[1, 2, 3, 4, 5].map((g) => (
                    <option key={g} value={g}>
                      Lớp {g}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">Mức độ</span>
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      difficulty: e.target.value as DifficultyLevel,
                    })
                  }
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng nâng cao">Vận dụng nâng cao</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">Chủ đề</span>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="Ví dụ: Phân số"
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">Bài học</span>
                <input
                  type="text"
                  value={form.lesson}
                  onChange={(e) => setForm({ ...form, lesson: e.target.value })}
                  placeholder="Ví dụ: Ôn tập bảng nhân"
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">
                  Công thức toán học (tùy chọn)
                </span>
                <input
                  type="text"
                  value={form.formula || ''}
                  onChange={(e) => setForm({ ...form, formula: e.target.value })}
                  placeholder="Ví dụ: S = a × b"
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold text-[#FFF6DF]/80">
                Đoạn văn ngắn Tiếng Việt (tùy chọn)
              </span>
              <textarea
                rows={2}
                value={form.passage || ''}
                onChange={(e) => setForm({ ...form, passage: e.target.value })}
                placeholder="Nhập đoạn văn đọc hiểu nếu có..."
                className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-[#FFF6DF]/80">
                Nội dung câu hỏi *
              </span>
              <textarea
                required
                rows={3}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Nhập câu hỏi rõ ràng cho học sinh tiểu học..."
                className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([0, 1, 2, 3] as const).map((idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctIdx"
                    checked={form.correctIndex === idx}
                    onChange={() => setForm({ ...form, correctIndex: idx })}
                    className="w-4 h-4 accent-[#61DDB5] cursor-pointer"
                    title="Đánh dấu đáp án đúng"
                  />
                  <span className="font-bold text-[#FFD166] w-5">
                    {['A', 'B', 'C', 'D'][idx]}
                  </span>
                  <input
                    type="text"
                    required
                    value={form.options[idx]}
                    onChange={(e) => {
                      const nextOpts = [...form.options] as [
                        string,
                        string,
                        string,
                        string,
                      ];
                      nextOpts[idx] = e.target.value;
                      setForm({ ...form, options: nextOpts });
                    }}
                    placeholder={`Phương án ${['A', 'B', 'C', 'D'][idx]}`}
                    className="flex-1 rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">
                  Lời giải thích kiến thức
                </span>
                <textarea
                  rows={2}
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({ ...form, explanation: e.target.value })
                  }
                  placeholder="Giải thích vì sao đáp án này đúng..."
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold text-[#FFF6DF]/80">
                  Gợi ý trợ giúp (nút Gợi ý)
                </span>
                <textarea
                  rows={2}
                  value={form.hint}
                  onChange={(e) => setForm({ ...form, hint: e.target.value })}
                  placeholder="Gợi ý nhẹ giúp học sinh suy luận..."
                  className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-3d-gold px-6 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer"
              >
                {editingId ? 'Lưu cập nhật' : 'Thêm vào ngân hàng'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: AI QUESTION GENERATOR WITH MANDATORY TEACHER REVIEW */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="card-3d-navy rounded-2xl p-6 space-y-4">
              <div className="rounded-xl bg-[#FF9F43]/15 border border-[#FF9F43]/50 px-4 py-3 flex items-start gap-3 text-sm text-[#FFF6DF]">
                <AlertTriangle className="w-5 h-5 text-[#FF9F43] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#FFD166]">Quy trình kiểm duyệt bắt buộc:</strong>{' '}
                  Câu hỏi do AI gợi ý chỉ ở trạng thái bản nháp. Giáo viên phải kiểm tra kỹ nội dung kiến thức, đáp án và lời giải theo đúng chương trình tiểu học trước khi bấm <strong>Duyệt vào ngân hàng</strong>.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">Môn học</span>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value as Subject)}
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">Khối lớp</span>
                  <select
                    value={aiGrade}
                    onChange={(e) =>
                      setAiGrade(Number(e.target.value) as GradeLevel)
                    }
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((g) => (
                      <option key={g} value={g}>
                        Lớp {g}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">Mức độ</span>
                  <select
                    value={aiDiff}
                    onChange={(e) =>
                      setAiDiff(e.target.value as DifficultyLevel)
                    }
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng nâng cao">Vận dụng nâng cao</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">Số câu gợi ý</span>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  >
                    {[1, 2, 3, 5, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} câu
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">Chủ đề bài học</span>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-[#FFF6DF]/80">
                    Ghi chú thêm cho AI (tùy chọn)
                  </span>
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Ví dụ: Gắn với bối cảnh biển đảo, số liệu tròn chục..."
                    className="mt-1 w-full rounded-xl bg-[#061f2d] border border-white/15 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#FFF6DF]/65">
                  Lưu ý: Tính năng AI cần kết nối máy chủ. Khi chạy hoàn toàn offline, hãy dùng CSV hoặc soạn trực tiếp.
                </span>
                <button
                  onClick={handleGenerateAi}
                  disabled={aiLoading}
                  className="btn-3d-emerald px-6 py-2.5 rounded-xl text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiLoading ? 'Đang tạo bản nháp...' : 'Tạo bản nháp câu hỏi'}
                </button>
              </div>

              {aiError && (
                <div className="rounded-xl bg-rose-950/70 border border-rose-500/40 px-4 py-3 text-sm text-rose-200">
                  {aiError}
                </div>
              )}
            </div>

            {aiDrafts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-[#FFD166]">
                    Bản nháp chờ giáo viên kiểm duyệt ({aiDrafts.length})
                  </h3>
                  <button
                    onClick={approveAllDrafts}
                    className="btn-3d-gold px-4 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Duyệt tất cả vào ngân hàng
                  </button>
                </div>

                {aiDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="card-3d-navy rounded-2xl p-5 space-y-3 border-[#FF9F43]/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-bold text-[#FF9F43]">
                        CHỜ KIỂM DUYỆT · {draft.subject} Lớp {draft.grade} · {draft.difficulty} · {draft.topic}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => approveDraft(draft)}
                          className="btn-3d-emerald px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Duyệt
                        </button>
                        <button
                          onClick={() =>
                            setAiDrafts((prev) =>
                              prev.filter((d) => d.id !== draft.id),
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-950/70 text-xs font-bold text-rose-200 cursor-pointer"
                        >
                          Bỏ
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-base text-[#FFF6DF]">
                      {draft.content}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {draft.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg px-3 py-2 border ${
                            idx === draft.correctIndex
                              ? 'bg-[#238B55]/50 border-[#61DDB5] text-white font-bold'
                              : 'bg-[#061f2d] border-white/10 text-[#FFF6DF]/85'
                          }`}
                        >
                          {['A', 'B', 'C', 'D'][idx]}. {opt}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-[#FFF6DF]/80">
                      <strong>Giải thích:</strong> {draft.explanation} ·{' '}
                      <strong>Gợi ý:</strong> {draft.hint}
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
