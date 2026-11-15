import JSZip from 'jszip';
import type {
  AnswerRecord,
  GameConfig,
  GameSessionHistory,
  Question,
  Team,
} from '../types/game';
import { computeAccuracyPercent, rankTeams } from './scoring';
import {
  exportQuestionsToCsv,
  SAMPLE_QUESTIONS,
  TEMPLATE_CSV_CONTENT,
} from '../data/sampleQuestions';

export function triggerFileDownload(
  filename: string,
  content: string | Blob,
  mimeType = 'text/plain;charset=utf-8',
) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSessionReportCsv(params: {
  config: GameConfig;
  teams: Team[];
  records: AnswerRecord[];
}) {
  const ranked = rankTeams(params.teams);
  const lines: string[] = [];

  lines.push('BÁO CÁO KẾT QUẢ - TRUY TÌM KHO BÁU 3D');
  lines.push(`Lớp học,${csvCell(params.config.className)}`);
  lines.push(`Hoạt động,${csvCell(params.config.activityName)}`);
  lines.push(`Môn học,${csvCell(params.config.subjectFilter)}`);
  lines.push(
    `Khối lớp,${params.config.gradeFilter === 'all' ? 'Tổng hợp 1-5' : `Lớp ${params.config.gradeFilter}`}`,
  );
  lines.push(`Thời gian xuất,${csvCell(new Date().toLocaleString('vi-VN'))}`);
  lines.push('');
  lines.push(
    'Thứ hạng,Tên đội,Tổng điểm,Số câu đúng,Số câu sai,Số câu bỏ qua,Tỉ lệ chính xác (%),Số chìa khóa',
  );

  ranked.forEach((team, idx) => {
    lines.push(
      [
        idx + 1,
        csvCell(team.name),
        team.score,
        team.correctCount,
        team.wrongCount,
        team.skippedCount,
        `${computeAccuracyPercent(team)}%`,
        team.keys,
      ].join(','),
    );
  });

  lines.push('');
  lines.push(
    'STT câu,Mã câu hỏi,Môn,Lớp,Đội trả lời,Kết quả,Điểm cộng,Thời gian (giây),Nội dung câu hỏi',
  );
  params.records.forEach((rec) => {
    const status = rec.isSkipped
      ? 'Bỏ qua'
      : rec.isCorrect
        ? 'Đúng'
        : 'Sai';
    lines.push(
      [
        rec.questionIndex + 1,
        csvCell(rec.questionId),
        csvCell(rec.subject),
        rec.grade,
        csvCell(rec.teamName),
        status,
        rec.pointsAwarded,
        rec.timeSpentSeconds,
        csvCell(rec.questionContent),
      ].join(','),
    );
  });

  const safeClass = (params.config.className || 'Lop').replace(/[^a-zA-Z0-9_-]/g, '_');
  triggerFileDownload(
    `bao_cao_kho_bau_${safeClass}_${Date.now()}.csv`,
    '\uFEFF' + lines.join('\r\n'),
    'text/csv;charset=utf-8',
  );
}

export function exportFullBackupJson(params: {
  questions: Question[];
  history: GameSessionHistory[];
}) {
  const payload = {
    app: 'TRUY TÌM KHO BÁU – HÀNH TRÌNH CHINH PHỤC TRI THỨC',
    exportedAt: new Date().toISOString(),
    questions: params.questions,
    history: params.history,
  };
  triggerFileDownload(
    `sao_luu_ngan_hang_cau_hoi_${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8',
  );
}

export async function downloadOfflineTeacherKitZip(questions: Question[]) {
  const zip = new JSZip();

  zip.file(
    'README.md',
    `# TRUY TÌM KHO BÁU – HÀNH TRÌNH CHINH PHỤC TRI THỨC

**Thông điệp:** HỌC TẬP VUI – KHÁM PHÁ GIỎI – CHINH PHỤC KHO BÁU!

## Bộ tài liệu giáo viên đi kèm
- \`data/sample_questions.csv\`: Ngân hàng câu hỏi mẫu Toán & Tiếng Việt lớp 1-5 (UTF-8 BOM mở trực tiếp bằng Excel).
- \`data/question_template.csv\`: Biểu mẫu chuẩn để giáo viên soạn thêm câu hỏi mới trong Excel.
- \`backup/question_bank_backup.json\`: Bản sao lưu toàn bộ ngân hàng câu hỏi hiện tại.
- \`docs/HUONG_DAN_SU_DUNG.md\`: Hướng dẫn tổ chức lớp học, trình chiếu máy chiếu và cài đặt ngoại tuyến.
`,
  );

  zip.file(
    'docs/HUONG_DAN_SU_DUNG.md',
    `# HƯỚNG DẪN SỬ DỤNG & TỔ CHỨC TRÒ CHƠI

## 1. Chuẩn bị trước giờ học
1. Vào **Ngân hàng câu hỏi** để kiểm tra hoặc nhập thêm câu hỏi từ tệp CSV UTF-8.
2. Nếu dùng Excel để soạn câu hỏi, hãy mở \`data/question_template.csv\`, điền nội dung và lưu dạng **CSV UTF-8 (Comma delimited)**.
3. Nhấn **Sao lưu JSON** định kỳ để lưu trữ an toàn ngân hàng câu hỏi riêng của lớp.

## 2. Thiết lập trận đấu (Màn hình 2)
- Chọn tên lớp, tên hoạt động, môn học (Toán / Tiếng Việt / Tổng hợp) và khối lớp (1–5).
- Chọn 2–4 đội chơi và đặt tên theo tổ/nhóm trong lớp.
- Khuyến nghị chọn chế độ **Giáo viên điều khiển** hoặc **Trình chiếu toàn màn hình** khi dạy trên bảng tương tác / máy chiếu.

## 3. Vận hành trên máy chiếu
- Dùng phím số **1, 2, 3, 4** hoặc **A, B, C, D** để chọn nhanh đáp án.
- Bật giọng đọc MC tiếng Việt để MC 3D đọc câu hỏi và nhận xét sinh động cho học sinh tiểu học.
- Nếu máy tính trường cấu hình yếu, mở **Cài đặt -> Đồ họa Thấp** và tắt hiệu ứng hạt để chạy mượt 60fps.
`,
  );

  zip.file('data/sample_questions.csv', exportQuestionsToCsv(SAMPLE_QUESTIONS));
  zip.file('data/question_template.csv', TEMPLATE_CSV_CONTENT);
  zip.file(
    'backup/question_bank_backup.json',
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        questions,
      },
      null,
      2,
    ),
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload('TRUY_TIM_KHO_BAU_BO_TAI_LIEU_GV.zip', blob, 'application/zip');
}

function csvCell(val: string | number): string {
  const s = String(val ?? '');
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
