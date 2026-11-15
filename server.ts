import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      aiAvailable: Boolean(process.env.GEMINI_API_KEY),
      timestamp: Date.now(),
    });
  });

  app.post('/api/questions/generate', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(400).json({
        error:
          'Chưa có khóa GEMINI_API_KEY trên máy chủ. Trò chơi vẫn hoạt động đầy đủ ngoại tuyến với ngân hàng câu hỏi có sẵn hoặc nhập từ tệp CSV.',
      });
      return;
    }

    const {
      subject = 'Toán',
      grade = 3,
      topic = 'Tổng hợp kiến thức trọng tâm',
      difficulty = 'Thông hiểu',
      count = 3,
      customPrompt = '',
    } = req.body ?? {};

    const safeCount = Math.min(Math.max(Number(count) || 3, 1), 10);

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Bạn là chuyên gia giáo dục tiểu học Việt Nam (chương trình GDPT 2018).
Hãy biên soạn câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) chuẩn sư phạm, rõ ràng, phù hợp lứa tuổi học sinh lớp ${grade}.
Mỗi câu hỏi chỉ có DUY NHẤT 1 đáp án đúng, kèm lời giải thích ngắn gọn dễ hiểu và 1 gợi ý nhẹ giúp học sinh suy luận.
Trả về JSON đúng cấu trúc yêu cầu.`;

      const userPrompt = `Tạo ${safeCount} câu hỏi môn ${subject} cho học sinh Lớp ${grade}.
Chủ đề: ${topic}.
Mức độ nhận thức: ${difficulty}.
${customPrompt ? `Yêu cầu thêm của giáo viên: ${customPrompt}` : ''}
Đảm bảo tiếng Việt chuẩn xác, câu từ thân thiện, số liệu toán học chính xác tuyệt đối.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING, description: 'Tên chủ đề kiến thức' },
                lesson: { type: Type.STRING, description: 'Tên bài học ngắn gọn' },
                difficulty: {
                  type: Type.STRING,
                  description:
                    'Một trong: Nhận biết, Thông hiểu, Vận dụng, Vận dụng nâng cao',
                },
                content: { type: Type.STRING, description: 'Nội dung câu hỏi' },
                formula: {
                  type: Type.STRING,
                  description: 'Công thức toán học nếu có, nếu không để chuỗi rỗng',
                },
                passage: {
                  type: Type.STRING,
                  description: 'Đoạn văn ngắn Tiếng Việt nếu có, nếu không để chuỗi rỗng',
                },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Đúng 4 phương án trả lời',
                },
                correctIndex: {
                  type: Type.INTEGER,
                  description: 'Chỉ số đáp án đúng từ 0 đến 3',
                },
                explanation: {
                  type: Type.STRING,
                  description: 'Lời giải thích chi tiết cho học sinh',
                },
                hint: {
                  type: Type.STRING,
                  description: 'Gợi ý suy luận không lộ ngay đáp án',
                },
              },
              required: [
                'topic',
                'lesson',
                'difficulty',
                'content',
                'options',
                'correctIndex',
                'explanation',
                'hint',
              ],
            },
          },
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);

      if (!Array.isArray(parsed)) {
        res.status(502).json({ error: 'Dữ liệu AI trả về không đúng định dạng danh sách.' });
        return;
      }

      const validDifficulties = new Set([
        'Nhận biết',
        'Thông hiểu',
        'Vận dụng',
        'Vận dụng nâng cao',
      ]);

      const drafts = parsed.map((item, idx) => {
        const opts = Array.isArray(item.options) ? item.options.slice(0, 4).map(String) : [];
        while (opts.length < 4) opts.push(`Phương án ${opts.length + 1}`);
        const ci = Number(item.correctIndex);
        return {
          id: `AI-${Date.now()}-${idx + 1}`,
          subject: subject === 'Tiếng Việt' ? 'Tiếng Việt' : 'Toán',
          grade: Math.min(Math.max(Number(grade) || 3, 1), 5),
          topic: String(item.topic || topic),
          lesson: String(item.lesson || 'Bài luyện tập'),
          difficulty: validDifficulties.has(String(item.difficulty))
            ? String(item.difficulty)
            : difficulty,
          content: String(item.content || ''),
          formula: item.formula ? String(item.formula) : undefined,
          passage: item.passage ? String(item.passage) : undefined,
          options: [opts[0], opts[1], opts[2], opts[3]],
          correctIndex: ci >= 0 && ci <= 3 ? ci : 0,
          explanation: String(item.explanation || 'Giáo viên kiểm tra và bổ sung lời giải thích.'),
          hint: String(item.hint || 'Đọc kỹ đề bài và thử loại trừ từng phương án.'),
        };
      });

      res.json({ drafts });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định khi gọi AI.';
      res.status(500).json({
        error: `Không thể tạo câu hỏi từ AI: ${message}`,
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRUY TÌM KHO BÁU 3D server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
