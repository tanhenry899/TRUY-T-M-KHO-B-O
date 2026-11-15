import type { DifficultyLevel, GradeLevel, Question, Subject } from '../types/game';

export const SAMPLE_QUESTIONS: Question[] = [
  // ==================== LỚP 1 - TOÁN ====================
  {
    id: 'T1-001',
    subject: 'Toán',
    grade: 1,
    topic: 'Phép cộng trong phạm vi 10',
    lesson: 'Phép cộng qua hình ảnh',
    difficulty: 'Nhận biết',
    content: 'Quan sát hình bên dưới và cho biết có tất cả bao nhiêu quả táo?',
    illustration: { type: 'counting', item: 'apple', groupA: 4, groupB: 3, operator: '+' },
    formula: '4 + 3 = ?',
    options: ['6 quả táo', '7 quả táo', '8 quả táo', '5 quả táo'],
    correctIndex: 1,
    explanation: 'Đếm gộp 4 quả táo ở nhóm bên trái và 3 quả táo ở nhóm bên phải: 4 + 3 = 7 quả táo.',
    hint: 'Hãy đếm số táo ở mỗi bên rồi cộng lại với nhau nhé!',
  },
  {
    id: 'T1-002',
    subject: 'Toán',
    grade: 1,
    topic: 'Phép trừ trong phạm vi 10',
    lesson: 'Tìm số còn lại',
    difficulty: 'Thông hiểu',
    content: 'Trên bờ biển có 9 vỏ sò, sóng cuốn đi 4 vỏ sò. Hỏi trên bờ biển còn lại mấy vỏ sò?',
    illustration: { type: 'counting', item: 'shell', groupA: 9, groupB: 4, operator: '-' },
    formula: '9 - 4 = ?',
    options: ['4 vỏ sò', '6 vỏ sò', '5 vỏ sò', '3 vỏ sò'],
    correctIndex: 2,
    explanation: 'Ta thực hiện phép trừ: 9 - 4 = 5 (vỏ sò).',
    hint: 'Có 9 vỏ sò, bớt đi 4 vỏ sò thì ta dùng phép tính trừ.',
  },
  {
    id: 'T1-003',
    subject: 'Toán',
    grade: 1,
    topic: 'Hình học trực quan',
    lesson: 'Nhận biết hình cơ bản',
    difficulty: 'Nhận biết',
    content: 'Hình dưới đây là hình gì?',
    illustration: { type: 'geometry', shape: 'triangle', labels: ['3 cạnh', '3 đỉnh'] },
    options: ['Hình vuông', 'Hình tròn', 'Hình chữ nhật', 'Hình tam giác'],
    correctIndex: 3,
    explanation: 'Hình có 3 cạnh và 3 đỉnh khép kín là hình tam giác.',
    hint: 'Hãy đếm số cạnh của hình màu cam ở trên.',
  },
  {
    id: 'T1-004',
    subject: 'Toán',
    grade: 1,
    topic: 'Xem đồng hồ',
    lesson: 'Xem giờ đúng',
    difficulty: 'Thông hiểu',
    content: 'Đồng hồ trên bản đồ kho báu đang chỉ mấy giờ?',
    illustration: { type: 'clock', hour: 8, minute: 0 },
    options: ['8 giờ', '12 giờ', '4 giờ', '9 giờ'],
    correctIndex: 0,
    explanation: 'Kim ngắn chỉ số 8, kim dài chỉ số 12. Vậy đồng hồ chỉ đúng 8 giờ.',
    hint: 'Kim ngắn chỉ giờ, kim dài chỉ số 12 là giờ đúng.',
  },

  // ==================== LỚP 1 - TIẾNG VIỆT ====================
  {
    id: 'TV1-001',
    subject: 'Tiếng Việt',
    grade: 1,
    topic: 'Ghép vần & Chính tả',
    lesson: 'Vần ươm / ươn',
    difficulty: 'Nhận biết',
    content: 'Chọn từ viết đúng chính tả để điền vào chỗ trống: "Đàn ... bay lượn trên bãi hoa."',
    options: ['bướm', 'bươm', 'bướn', 'bướng'],
    correctIndex: 0,
    explanation: 'Từ đúng chính tả là "bướm" (vần ươm, thanh sắc): "Đàn bướm bay lượn trên bãi hoa."',
    hint: 'Con vật có cánh sặc sỡ thường hút mật hoa.',
  },
  {
    id: 'TV1-002',
    subject: 'Tiếng Việt',
    grade: 1,
    topic: 'Từ vựng & Mở rộng vốn từ',
    lesson: 'Từ chỉ sự vật',
    difficulty: 'Thông hiểu',
    content: 'Trong các từ sau, từ nào chỉ loài cây sống ở vùng biển đảo?',
    options: ['Cây dừa', 'Cái bàn', 'Quyển vở', 'Đám mây'],
    correctIndex: 0,
    explanation: '"Cây dừa" là từ chỉ loài cây gắn liền với bãi biển và các hòn đảo nhiệt đới.',
    hint: 'Loài cây cho quả ngọt mát thường mọc dọc bãi cát vàng.',
  },
  {
    id: 'TV1-003',
    subject: 'Tiếng Việt',
    grade: 1,
    topic: 'Đọc hiểu câu ngắn',
    lesson: 'Hiểu nội dung câu',
    difficulty: 'Thông hiểu',
    passage: 'Buổi sáng, mặt trời nhô lên đỏ rực trên mặt biển xanh biếc.',
    content: 'Theo câu văn trên, mặt trời nhô lên vào buổi nào?',
    options: ['Buổi tối', 'Buổi trưa', 'Buổi sáng', 'Buổi chiều'],
    correctIndex: 2,
    explanation: 'Ngay đầu câu văn đã nêu rõ: "Buổi sáng, mặt trời nhô lên...".',
    hint: 'Đọc kỹ hai chữ đầu tiên của đoạn văn nhé!',
  },
  {
    id: 'TV1-004',
    subject: 'Tiếng Việt',
    grade: 1,
    topic: 'Quy tắc chính tả',
    lesson: 'Phân biệt c / k',
    difficulty: 'Vận dụng',
    content: 'Từ nào viết ĐÚNG quy tắc chính tả tiếng Việt?',
    options: ['cái kéo', 'kái kéo', 'cái céo', 'kái céo'],
    correctIndex: 0,
    explanation: 'Trước âm e, ê, i ta viết "k" (kéo); trước các âm khác như a ta viết "c" (cái). Vậy "cái kéo" đúng.',
    hint: 'Nhớ quy tắc: k chỉ đứng trước i, e, ê.',
  },

  // ==================== LỚP 2 - TOÁN ====================
  {
    id: 'T2-001',
    subject: 'Toán',
    grade: 2,
    topic: 'Phép cộng có nhớ trong phạm vi 100',
    lesson: 'Tính nhẩm và đặt tính',
    difficulty: 'Nhận biết',
    content: 'Nhà thám hiểm nhặt được 28 đồng xu vàng ở bãi biển và 15 đồng xu trong hang đá. Hỏi có tất cả bao nhiêu đồng xu?',
    formula: '28 + 15 = ?',
    options: ['33 đồng xu', '43 đồng xu', '42 đồng xu', '38 đồng xu'],
    correctIndex: 1,
    explanation: '28 + 15 = 43 (8 cộng 5 bằng 13, viết 3 nhớ 1; 2 cộng 1 bằng 3, thêm 1 bằng 4).',
    hint: 'Khi cộng hàng đơn vị 8 + 5 = 13, nhớ 1 sang hàng chục nhé!',
  },
  {
    id: 'T2-002',
    subject: 'Toán',
    grade: 2,
    topic: 'Bảng nhân 2 và bảng nhân 5',
    lesson: 'Phép nhân cơ bản',
    difficulty: 'Thông hiểu',
    content: 'Mỗi chiếc rương nhỏ chứa 5 viên pha lê. Hỏi 4 chiếc rương như thế có bao nhiêu viên pha lê?',
    formula: '5 × 4 = ?',
    options: ['9 viên', '15 viên', '20 viên', '25 viên'],
    correctIndex: 2,
    explanation: 'Mỗi rương có 5 viên, 4 rương có: 5 × 4 = 20 (viên pha lê).',
    hint: 'Hãy nhẩm bảng nhân 5: 5 nhân 4 bằng bao nhiêu?',
  },
  {
    id: 'T2-003',
    subject: 'Toán',
    grade: 2,
    topic: 'Xem đồng hồ',
    lesson: 'Xem giờ rưỡi (30 phút)',
    difficulty: 'Thông hiểu',
    content: 'Kim ngắn giữa số 3 và số 4, kim dài chỉ số 6. Đồng hồ đang chỉ mấy giờ?',
    illustration: { type: 'clock', hour: 3, minute: 30 },
    options: ['3 giờ 15 phút', '3 giờ 30 phút', '4 giờ 30 phút', '6 giờ 15 phút'],
    correctIndex: 1,
    explanation: 'Kim giờ đã qua số 3 và chưa tới số 4, kim phút chỉ số 6 (30 phút). Vậy là 3 giờ 30 phút (3 giờ rưỡi).',
    hint: 'Kim dài chỉ số 6 tương ứng với 30 phút.',
  },
  {
    id: 'T2-004',
    subject: 'Toán',
    grade: 2,
    topic: 'Đo độ dài & Khối lượng',
    lesson: 'Cân thăng bằng',
    difficulty: 'Vận dụng',
    content: 'Quan sát chiếc cân thăng bằng dưới đây. Hỏi 1 túi vàng nặng bao nhiêu ki-lô-gam?',
    illustration: { type: 'scale', leftText: '1 túi vàng + 2 kg', rightText: '7 kg' },
    options: ['9 kg', '5 kg', '4 kg', '6 kg'],
    correctIndex: 1,
    explanation: 'Cân thăng bằng nghĩa là hai bên nặng bằng nhau: Túi vàng + 2 kg = 7 kg ⇒ Túi vàng = 7 - 2 = 5 kg.',
    hint: 'Lấy tổng khối lượng bên phải trừ đi quả cân 2 kg ở bên trái.',
  },

  // ==================== LỚP 2 - TIẾNG VIỆT ====================
  {
    id: 'TV2-001',
    subject: 'Tiếng Việt',
    grade: 2,
    topic: 'Từ chỉ hoạt động & Trạng thái',
    lesson: 'Phân loại từ loại',
    difficulty: 'Nhận biết',
    content: 'Từ nào dưới đây là từ chỉ hoạt động?',
    options: ['Thám hiểm', 'Hòn đảo', 'Lấp lánh', 'Xanh biếc'],
    correctIndex: 0,
    explanation: '"Thám hiểm" là từ chỉ hoạt động di chuyển, tìm tòi khám phá. "Hòn đảo" là từ chỉ sự vật; "lấp lánh, xanh biếc" là từ chỉ đặc điểm.',
    hint: 'Hãy tìm từ nói về việc làm của con người.',
  },
  {
    id: 'TV2-002',
    subject: 'Tiếng Việt',
    grade: 2,
    topic: 'Từ trái nghĩa',
    lesson: 'Mở rộng vốn từ',
    difficulty: 'Thông hiểu',
    content: 'Cặp từ nào dưới đây là cặp từ có nghĩa trái ngược nhau?',
    options: ['Rộng lớn - Bao la', 'Dũng cảm - Nhút nhát', 'Tươi sáng - Rực rỡ', 'Chăm chỉ - Cần cù'],
    correctIndex: 1,
    explanation: '"Dũng cảm" và "nhút nhát" là hai từ có nghĩa trái ngược nhau; các cặp còn lại là từ gần nghĩa.',
    hint: 'Tìm cặp từ có ý nghĩa đối lập hoàn toàn với nhau.',
  },
  {
    id: 'TV2-003',
    subject: 'Tiếng Việt',
    grade: 2,
    topic: 'Dấu câu',
    lesson: 'Dấu chấm, dấu hỏi, dấu chấm than',
    difficulty: 'Thông hiểu',
    content: 'Cuối câu "Chiếc rương kho báu đẹp quá!" sử dụng dấu chấm than nhằm mục đích gì?',
    options: ['Để hỏi thông tin', 'Để bộc lộ cảm xúc ngạc nhiên, khen ngợi', 'Để kể lại một sự việc bình thường', 'Để ngăn cách các từ'],
    correctIndex: 1,
    explanation: 'Câu cảm bộc lộ cảm xúc vui mừng, khen ngợi, ngạc nhiên kết thúc bằng dấu chấm than (!).',
    hint: 'Khi khen một vật đẹp, ta đang thể hiện điều gì?',
  },
  {
    id: 'TV2-004',
    subject: 'Tiếng Việt',
    grade: 2,
    topic: 'Đọc hiểu đoạn văn ngắn',
    lesson: 'Tìm ý chính',
    difficulty: 'Vận dụng',
    passage: 'Thác Ánh Sáng đổ xuống từ vách đá cao, tung bọt trắng xóa. Dưới ánh nắng, hơi nước tạo thành cầu vồng bảy sắc lung linh.',
    content: 'Cầu vồng bảy sắc được tạo thành nhờ điều gì?',
    options: ['Nhờ gió thổi mạnh vào cây cối', 'Nhờ ánh nắng chiếu qua hơi nước của thác', 'Nhờ những con cá bơi dưới suối', 'Nhờ tiếng chim hót trong rừng'],
    correctIndex: 1,
    explanation: 'Đoạn văn viết rõ: "Dưới ánh nắng, hơi nước tạo thành cầu vồng bảy sắc lung linh."',
    hint: 'Đọc lại câu thứ hai của đoạn văn nhé!',
  },

  // ==================== LỚP 3 - TOÁN ====================
  {
    id: 'T3-001',
    subject: 'Toán',
    grade: 3,
    topic: 'Chu vi hình học',
    lesson: 'Chu vi hình vuông',
    difficulty: 'Nhận biết',
    content: 'Một phiến đá cổ hình vuông có cạnh dài 8 cm. Chu vi của phiến đá cổ đó là bao nhiêu?',
    illustration: { type: 'geometry', shape: 'square', labels: ['8 cm', '8 cm'] },
    formula: 'P = a × 4',
    options: ['16 cm', '32 cm', '64 cm', '24 cm'],
    correctIndex: 1,
    explanation: 'Chu vi hình vuông bằng độ dài một cạnh nhân với 4: 8 × 4 = 32 (cm).',
    hint: 'Hình vuông có 4 cạnh bằng nhau, mỗi cạnh dài 8 cm.',
  },
  {
    id: 'T3-002',
    subject: 'Toán',
    grade: 3,
    topic: 'Nhân, chia số có ba chữ số',
    lesson: 'Tìm thành phần chưa biết',
    difficulty: 'Thông hiểu',
    content: 'Tìm số mật mã x để mở cổng hang động bí ẩn biết: x × 6 = 144',
    formula: 'x × 6 = 144',
    options: ['22', '24', '26', '28'],
    correctIndex: 1,
    explanation: 'Muốn tìm thừa số chưa biết, ta lấy tích chia cho thừa số đã biết: x = 144 : 6 = 24.',
    hint: 'Lấy 144 chia cho 6 để tìm x.',
  },
  {
    id: 'T3-003',
    subject: 'Toán',
    grade: 3,
    topic: 'Đọc bảng số liệu thống kê',
    lesson: 'Phân tích bảng biểu',
    difficulty: 'Vận dụng',
    content: 'Bảng dưới đây ghi lại số đồng xu vàng các đội nhặt được trong chặng 1. Tổng số đồng xu của cả 3 đội là bao nhiêu?',
    tableData: {
      headers: ['Đội thám hiểm', 'Số đồng xu vàng'],
      rows: [
        ['Đội Hải Âu', '125'],
        ['Đội Sư Tử', '140'],
        ['Đội Đại Bàng', '135'],
      ],
    },
    options: ['390 đồng xu', '400 đồng xu', '410 đồng xu', '395 đồng xu'],
    correctIndex: 1,
    explanation: 'Tổng số đồng xu của cả 3 đội là: 125 + 140 + 135 = (125 + 135) + 140 = 260 + 140 = 400 (đồng xu).',
    hint: 'Nhóm 125 với 135 trước cho tròn chục rồi cộng tiếp với 140 nhé!',
  },
  {
    id: 'T3-004',
    subject: 'Toán',
    grade: 3,
    topic: 'Chu vi và diện tích',
    lesson: 'Hình chữ nhật',
    difficulty: 'Vận dụng nâng cao',
    content: 'Cây cầu gỗ hình chữ nhật dài 15 m và rộng 3 m. Diện tích mặt cầu gỗ là bao nhiêu mét vuông?',
    illustration: { type: 'geometry', shape: 'rectangle', labels: ['15 m', '3 m'] },
    formula: 'S = a × b',
    options: ['18 m²', '36 m²', '45 m²', '54 m²'],
    correctIndex: 2,
    explanation: 'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng (cùng đơn vị đo): 15 × 3 = 45 (m²).',
    hint: 'Nhân chiều dài 15 m với chiều rộng 3 m.',
  },

  // ==================== LỚP 3 - TIẾNG VIỆT ====================
  {
    id: 'TV3-001',
    subject: 'Tiếng Việt',
    grade: 3,
    topic: 'Biện pháp tu từ so sánh',
    lesson: 'Nhận biết hình ảnh so sánh',
    difficulty: 'Nhận biết',
    content: 'Trong câu "Mặt biển êm ả như một tấm gương khổng lồ", sự vật nào được so sánh với nhau?',
    options: ['Mặt biển và bầu trời', 'Mặt biển và tấm gương khổng lồ', 'Con thuyền và cánh chim', 'Sóng biển và ngọn núi'],
    correctIndex: 1,
    explanation: 'Từ so sánh "như" nối hai sự vật được so sánh với nhau là "mặt biển" và "một tấm gương khổng lồ".',
    hint: 'Tìm hai sự vật đứng ở hai bên từ "như".',
  },
  {
    id: 'TV3-002',
    subject: 'Tiếng Việt',
    grade: 3,
    topic: 'Câu kiểu Ai thế nào?',
    lesson: 'Cấu tạo câu',
    difficulty: 'Thông hiểu',
    content: 'Câu nào sau đây thuộc mẫu câu "Ai thế nào?"?',
    options: ['Các bạn học sinh đang giải mật thư.', 'Những viên pha lê trong hang động tỏa sáng rực rỡ.', 'Nhà thám hiểm là người dẫn đường.', 'Đội trưởng bước qua cây cầu gỗ.'],
    correctIndex: 1,
    explanation: 'Câu "Những viên pha lê trong hang động tỏa sáng rực rỡ." nêu đặc điểm, trạng thái của sự vật (trả lời cho câu hỏi "thế nào?").',
    hint: 'Mẫu câu "Ai thế nào?" có vị ngữ chỉ đặc điểm, tính chất.',
  },
  {
    id: 'TV3-003',
    subject: 'Tiếng Việt',
    grade: 3,
    topic: 'Từ cùng nghĩa & Từ trái nghĩa',
    lesson: 'Vốn từ về tính cách',
    difficulty: 'Thông hiểu',
    content: 'Từ nào cùng nghĩa với từ "kiên trì"?',
    options: ['Bỏ cuộc', 'Nhẫn nại', 'Vội vàng', 'Nản lòng'],
    correctIndex: 1,
    explanation: '"Nhẫn nại" có nghĩa giống với "kiên trì" — bền bỉ theo đuổi mục tiêu đến cùng.',
    hint: 'Tìm từ nói về sự bền bỉ, không dễ nản chí.',
  },
  {
    id: 'TV3-004',
    subject: 'Tiếng Việt',
    grade: 3,
    topic: 'Đọc hiểu văn bản',
    lesson: 'Rút ra bài học',
    difficulty: 'Vận dụng',
    passage: 'Đường lên đỉnh núi lửa rất dốc. Cả bốn bạn nắm tay nhau cùng bước, bạn khỏe đỡ bạn mệt. Nhờ vậy, cả đội đã vượt qua chặng thử thách an toàn.',
    content: 'Yếu tố nào giúp cả đội vượt qua đỉnh núi lửa an toàn?',
    options: ['Mỗi người tự chạy thật nhanh về phía trước', 'Tinh thần đoàn kết, biết giúp đỡ lẫn nhau', 'Đợi trực thăng đến đón', 'Quay trở lại rừng khởi đầu'],
    correctIndex: 1,
    explanation: 'Cả bốn bạn nắm tay nhau, bạn khỏe đỡ bạn mệt — đó là biểu hiện của tinh thần đoàn kết và giúp đỡ lẫn nhau.',
    hint: 'Chú ý hành động "nắm tay nhau" và "bạn khỏe đỡ bạn mệt".',
  },

  // ==================== LỚP 4 - TOÁN ====================
  {
    id: 'T4-001',
    subject: 'Toán',
    grade: 4,
    topic: 'Phân số',
    lesson: 'Khái niệm phân số',
    difficulty: 'Nhận biết',
    content: 'Hình tròn dưới đây được chia thành các phần bằng nhau. Phân số chỉ phần đã tô màu là bao nhiêu?',
    illustration: { type: 'fraction', numerator: 3, denominator: 4, shape: 'circle' },
    options: ['1/4', '3/4', '4/3', '2/4'],
    correctIndex: 1,
    explanation: 'Hình tròn chia làm 4 phần bằng nhau, tô màu 3 phần. Vậy phân số biểu diễn là 3/4.',
    hint: 'Tử số là số phần tô màu, mẫu số là tổng số phần bằng nhau.',
  },
  {
    id: 'T4-002',
    subject: 'Toán',
    grade: 4,
    topic: 'Trung bình cộng',
    lesson: 'Tìm số trung bình cộng',
    difficulty: 'Thông hiểu',
    content: 'Trong 3 ngày thám hiểm, đoàn tìm được lần lượt 42, 54 và 39 viên ngọc. Trung bình mỗi ngày đoàn tìm được bao nhiêu viên ngọc?',
    formula: '(42 + 54 + 39) : 3 = ?',
    options: ['43 viên ngọc', '45 viên ngọc', '46 viên ngọc', '48 viên ngọc'],
    correctIndex: 1,
    explanation: 'Tổng số viên ngọc là 42 + 54 + 39 = 135. Trung bình mỗi ngày: 135 : 3 = 45 (viên ngọc).',
    hint: 'Cộng cả 3 số rồi chia cho 3.',
  },
  {
    id: 'T4-003',
    subject: 'Toán',
    grade: 4,
    topic: 'Dấu hiệu chia hết',
    lesson: 'Chia hết cho 2, 5, 9',
    difficulty: 'Vận dụng',
    content: 'Số nào dưới đây vừa chia hết cho 5 vừa chia hết cho 9?',
    options: ['135', '125', '182', '240'],
    correctIndex: 0,
    explanation: 'Số 135 có tận cùng là 5 nên chia hết cho 5; tổng các chữ số 1 + 3 + 5 = 9 nên chia hết cho 9.',
    hint: 'Số chia hết cho 5 có tận cùng là 0 hoặc 5; chia hết cho 9 có tổng các chữ số chia hết cho 9.',
  },
  {
    id: 'T4-004',
    subject: 'Toán',
    grade: 4,
    topic: 'Tìm hai số khi biết tổng và hiệu',
    lesson: 'Giải toán có lời văn',
    difficulty: 'Vận dụng nâng cao',
    content: 'Hai chiếc rương chứa tổng cộng 120 đồng xu vàng. Rương lớn nhiều hơn rương nhỏ 24 đồng xu. Hỏi rương lớn có bao nhiêu đồng xu?',
    formula: 'Số lớn = (Tổng + Hiệu) : 2',
    options: ['62 đồng xu', '72 đồng xu', '48 đồng xu', '84 đồng xu'],
    correctIndex: 1,
    explanation: 'Số đồng xu ở rương lớn là: (120 + 24) : 2 = 144 : 2 = 72 (đồng xu).',
    hint: 'Áp dụng công thức tìm số lớn: lấy (Tổng + Hiệu) chia cho 2.',
  },

  // ==================== LỚP 4 - TIẾNG VIỆT ====================
  {
    id: 'TV4-001',
    subject: 'Tiếng Việt',
    grade: 4,
    topic: 'Cấu tạo từ',
    lesson: 'Từ ghép và từ láy',
    difficulty: 'Nhận biết',
    content: 'Từ nào dưới đây là từ láy?',
    options: ['Sách vở', 'Long lanh', 'Bàn ghế', 'Rừng núi'],
    correctIndex: 1,
    explanation: '"Long lanh" là từ láy âm đầu l- (chỉ có tiếng "long" hoặc cả hai tiếng phối hợp âm thanh gợi tả). Các từ còn lại là từ ghép.',
    hint: 'Tìm từ có hai tiếng lặp lại âm đầu và mang tính gợi tả.',
  },
  {
    id: 'TV4-002',
    subject: 'Tiếng Việt',
    grade: 4,
    topic: 'Biện pháp nhân hóa',
    lesson: 'Nhận diện nhân hóa',
    difficulty: 'Thông hiểu',
    content: 'Câu văn nào sử dụng biện pháp nhân hóa?',
    options: ['Những ngọn dừa cao vút trên bãi cát.', 'Bác Cổ Thụ dang rộng vòng tay che mát cho đoàn thám hiểm.', 'Hang động có nhiều thạch nhũ đẹp.', 'Nước thác chảy từ trên cao xuống.'],
    correctIndex: 1,
    explanation: 'Cây cổ thụ được gọi là "Bác" và có hành động "dang rộng vòng tay" như con người.',
    hint: 'Tìm câu mà sự vật được gọi hoặc tả hành động giống con người.',
  },
  {
    id: 'TV4-003',
    subject: 'Tiếng Việt',
    grade: 4,
    topic: 'Thành ngữ, tục ngữ',
    lesson: 'Chủ điểm Có chí thì nên',
    difficulty: 'Vận dụng',
    content: 'Câu tục ngữ nào khuyên chúng ta không nản chí khi gặp khó khăn?',
    options: ['Có công mài sắt, có ngày nên kim.', 'Ăn quả nhớ kẻ trồng cây.', 'Tốt gỗ hơn tốt nước sơn.', 'Gần mực thì đen, gần đèn thì rạng.'],
    correctIndex: 0,
    explanation: '"Có công mài sắt, có ngày nên kim" khuyên con người kiên trì, nhẫn nại vượt khó sẽ thành công.',
    hint: 'Câu tục ngữ nói về việc kiên trì mài một thanh sắt cứng.',
  },
  {
    id: 'TV4-004',
    subject: 'Tiếng Việt',
    grade: 4,
    topic: 'Trạng ngữ trong câu',
    lesson: 'Trạng ngữ chỉ nơi chốn',
    difficulty: 'Vận dụng nâng cao',
    content: 'Trong câu "Trên đỉnh đền cổ, chiếc rương vàng tỏa ánh sáng rực rỡ.", bộ phận trạng ngữ là gì?',
    options: ['chiếc rương vàng', 'Trên đỉnh đền cổ', 'tỏa ánh sáng rực rỡ', 'đền cổ'],
    correctIndex: 1,
    explanation: '"Trên đỉnh đền cổ" đứng đầu câu, ngăn cách bởi dấu phẩy, trả lời cho câu hỏi "Ở đâu?" nên là trạng ngữ chỉ nơi chốn.',
    hint: 'Bộ phận nào đứng trước dấu phẩy để chỉ vị trí diễn ra sự việc?',
  },

  // ==================== LỚP 5 - TOÁN ====================
  {
    id: 'T5-001',
    subject: 'Toán',
    grade: 5,
    topic: 'Tỉ số phần trăm',
    lesson: 'Tìm tỉ số phần trăm của hai số',
    difficulty: 'Nhận biết',
    content: 'Đội thám hiểm có 20 thử thách và đã hoàn thành xuất sắc 15 thử thách. Tỉ số phần trăm số thử thách đã hoàn thành là bao nhiêu?',
    formula: '(15 : 20) × 100% = ?',
    options: ['65%', '75%', '80%', '70%'],
    correctIndex: 1,
    explanation: '15 : 20 = 0,75 = 75%. Vậy đội đã hoàn thành 75% số thử thách.',
    hint: 'Lấy 15 chia cho 20 rồi nhân nhẩm với 100 và viết thêm kí hiệu %.',
  },
  {
    id: 'T5-002',
    subject: 'Toán',
    grade: 5,
    topic: 'Số thập phân',
    lesson: 'Phép tính với số thập phân',
    difficulty: 'Thông hiểu',
    content: 'Tính giá trị biểu thức: 12,5 × 4 + 25,6',
    formula: '12,5 × 4 + 25,6 = ?',
    options: ['75,6', '74,6', '76,5', '50,6'],
    correctIndex: 0,
    explanation: 'Thực hiện nhân trước, cộng sau: 12,5 × 4 = 50; 50 + 25,6 = 75,6.',
    hint: 'Nhớ quy tắc nhân chia trước, cộng trừ sau; 12,5 × 4 = 50.',
  },
  {
    id: 'T5-003',
    subject: 'Toán',
    grade: 5,
    topic: 'Chuyển động đều',
    lesson: 'Tính vận tốc / quãng đường',
    difficulty: 'Vận dụng',
    content: 'Một con thuyền buồm đi từ bến cảng ra Đảo Kho Báu dài 54 km hết 1 giờ 30 phút. Vận tốc của con thuyền là bao nhiêu km/giờ?',
    formula: 'v = s : t',
    options: ['32 km/giờ', '36 km/giờ', '40 km/giờ', '27 km/giờ'],
    correctIndex: 1,
    explanation: 'Đổi 1 giờ 30 phút = 1,5 giờ. Vận tốc v = 54 : 1,5 = 36 (km/giờ).',
    hint: 'Đổi 1 giờ 30 phút ra số thập phân (1,5 giờ) rồi lấy quãng đường chia cho thời gian.',
  },
  {
    id: 'T5-004',
    subject: 'Toán',
    grade: 5,
    topic: 'Hình tròn & Diện tích',
    lesson: 'Diện tích hình tròn',
    difficulty: 'Vận dụng nâng cao',
    content: 'Mặt giếng pha lê hình tròn có bán kính r = 2 m. Diện tích mặt giếng là bao nhiêu mét vuông? (Lấy π = 3,14)',
    illustration: { type: 'geometry', shape: 'circle', labels: ['r = 2 m'] },
    formula: 'S = r × r × 3,14',
    options: ['6,28 m²', '12,56 m²', '25,12 m²', '9,42 m²'],
    correctIndex: 1,
    explanation: 'Diện tích hình tròn: S = 2 × 2 × 3,14 = 4 × 3,14 = 12,56 (m²).',
    hint: 'Công thức diện tích hình tròn là bán kính × bán kính × 3,14.',
  },

  // ==================== LỚP 5 - TIẾNG VIỆT ====================
  {
    id: 'TV5-001',
    subject: 'Tiếng Việt',
    grade: 5,
    topic: 'Từ đồng âm & Từ nhiều nghĩa',
    lesson: 'Phân biệt nghĩa của từ',
    difficulty: 'Thông hiểu',
    content: 'Trong hai cụm từ "mũi thuyền" và "mũi người", từ "mũi" có quan hệ gì?',
    options: ['Từ đồng âm khác nghĩa', 'Từ nhiều nghĩa (nghĩa gốc và nghĩa chuyển)', 'Từ trái nghĩa', 'Từ láy'],
    correctIndex: 1,
    explanation: '"Mũi" ở đây là từ nhiều nghĩa: "mũi người" là nghĩa gốc, "mũi thuyền" là nghĩa chuyển dựa trên sự tương đồng về vị trí nhọn ở phía trước.',
    hint: 'Hai sự vật này đều có bộ phận nhô ra ở phía đầu.',
  },
  {
    id: 'TV5-002',
    subject: 'Tiếng Việt',
    grade: 5,
    topic: 'Câu ghép & Quan hệ từ',
    lesson: 'Cặp quan hệ từ',
    difficulty: 'Thông hiểu',
    content: 'Điền cặp quan hệ từ thích hợp: "... trời đổ mưa lớn ... các nhà thám hiểm vẫn quyết tâm đi tiếp."',
    options: ['Vì ... nên ...', 'Tuy ... nhưng ...', 'Nếu ... thì ...', 'Không những ... mà ...'],
    correctIndex: 1,
    explanation: 'Hai vế câu biểu thị quan hệ tương phản (trời mưa lớn đối lập với việc vẫn quyết tâm đi tiếp), nên dùng cặp "Tuy ... nhưng ...".',
    hint: 'Hai vế câu có ý đối lập, tương phản với nhau.',
  },
  {
    id: 'TV5-003',
    subject: 'Tiếng Việt',
    grade: 5,
    topic: 'Liên kết câu trong đoạn văn',
    lesson: 'Liên kết bằng từ ngữ nối',
    difficulty: 'Vận dụng',
    passage: 'Ban đầu, con đường xuyên rừng khá gập ghềnh. Tuy nhiên, càng đi sâu vào thung lũng, cảnh vật càng hiện ra tuyệt đẹp.',
    content: 'Từ ngữ nào dùng để liên kết hai câu văn trên và biểu thị ý chuyển tiếp tương phản?',
    options: ['Ban đầu', 'Tuy nhiên', 'Cảnh vật', 'Tuyệt đẹp'],
    correctIndex: 1,
    explanation: '"Tuy nhiên" là từ ngữ nối đứng đầu câu thứ hai, liên kết và biểu thị quan hệ tương phản với câu trước.',
    hint: 'Chú ý cụm từ nối đứng ngay đầu câu văn thứ hai.',
  },
  {
    id: 'TV5-004',
    subject: 'Tiếng Việt',
    grade: 5,
    topic: 'Cảm thụ văn học',
    lesson: 'Ý nghĩa biểu tượng',
    difficulty: 'Vận dụng nâng cao',
    passage: 'Kho báu quý giá nhất mà các bạn nhỏ mang về từ hòn đảo không chỉ là những đồng xu vàng lấp lánh, mà còn là tri thức và tình bạn bền chặt.',
    content: 'Thông điệp chính của đoạn văn trên là gì?',
    options: ['Chỉ có vàng bạc mới thực sự quý giá', 'Tri thức và tình bạn là kho báu vô giá trong cuộc sống', 'Không nên đi thám hiểm một mình', 'Đồng xu vàng rất dễ tìm thấy trên đảo'],
    correctIndex: 1,
    explanation: 'Đoạn văn nhấn mạnh giá trị tinh thần cao đẹp: tri thức và tình bạn bền chặt mới là kho báu quý giá nhất.',
    hint: 'Đọc kỹ vế câu sau chữ "mà còn là...".',
  },
];

// CSV Columns:
// id,subject,grade,topic,lesson,difficulty,content,passage,formula,optionA,optionB,optionC,optionD,correctLetter,explanation,hint

const CSV_HEADER =
  'id,subject,grade,topic,lesson,difficulty,content,passage,formula,optionA,optionB,optionC,optionD,correctLetter,explanation,hint';

function escapeCsvCell(val: string | number | undefined): string {
  const s = val === undefined || val === null ? '' : String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportQuestionsToCsv(questions: Question[]): string {
  const letters = ['A', 'B', 'C', 'D'] as const;
  const rows = questions.map((q) =>
    [
      q.id,
      q.subject,
      q.grade,
      q.topic,
      q.lesson,
      q.difficulty,
      q.content,
      q.passage || '',
      q.formula || '',
      q.options[0],
      q.options[1],
      q.options[2],
      q.options[3],
      letters[q.correctIndex] || 'A',
      q.explanation,
      q.hint,
    ]
      .map(escapeCsvCell)
      .join(','),
  );
  return '\uFEFF' + [CSV_HEADER, ...rows].join('\r\n');
}

export const TEMPLATE_CSV_CONTENT =
  '\uFEFF' +
  [
    CSV_HEADER,
    [
      'MA-001',
      'Toán',
      '3',
      'Phép nhân',
      'Bảng nhân 7',
      'Thông hiểu',
      'Kết quả của phép tính 7 × 6 là bao nhiêu?',
      '',
      '7 × 6 = ?',
      '36',
      '42',
      '48',
      '49',
      'B',
      'Theo bảng nhân 7 ta có 7 × 6 = 42.',
      'Nhẩm lại bảng nhân 7 nhé!',
    ]
      .map(escapeCsvCell)
      .join(','),
    [
      'TV-001',
      'Tiếng Việt',
      '4',
      'Từ loại',
      'Từ láy',
      'Nhận biết',
      'Từ nào dưới đây là từ láy?',
      '',
      '',
      'Xinh xắn',
      'Bàn học',
      'Sách vở',
      'Cây cối',
      'A',
      'Xinh xắn là từ láy âm đầu x.',
      'Tìm từ có hai tiếng lặp âm gợi tả.',
    ]
      .map(escapeCsvCell)
      .join(','),
  ].join('\r\n');

function parseCsvMatrix(raw: string): string[][] {
  const text = raw.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(cell.trim());
        rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.length > 0));
}

export function parseCsvToQuestions(csvText: string): {
  questions: Question[];
  errors: string[];
} {
  const matrix = parseCsvMatrix(csvText);
  if (matrix.length < 2) {
    return { questions: [], errors: ['Tệp CSV trống hoặc chưa có dòng dữ liệu câu hỏi.'] };
  }

  const validDiffs = new Set<DifficultyLevel>([
    'Nhận biết',
    'Thông hiểu',
    'Vận dụng',
    'Vận dụng nâng cao',
  ]);

  const questions: Question[] = [];
  const errors: string[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const cols = matrix[r];
    if (cols.length < 14) {
      errors.push(`Dòng ${r + 1}: Thiếu cột dữ liệu (cần đủ 16 cột theo mẫu CSV).`);
      continue;
    }

    const [
      idRaw,
      subjRaw,
      gradeRaw,
      topicRaw,
      lessonRaw,
      diffRaw,
      contentRaw,
      passageRaw,
      formulaRaw,
      optA,
      optB,
      optC,
      optD,
      correctRaw,
      explanationRaw,
      hintRaw,
    ] = cols;

    if (!contentRaw) {
      errors.push(`Dòng ${r + 1}: Nội dung câu hỏi bị trống.`);
      continue;
    }

    const subject: Subject = /tiếng việt|tieng viet/i.test(subjRaw) ? 'Tiếng Việt' : 'Toán';
    const gNum = Number(gradeRaw);
    const grade: GradeLevel =
      gNum >= 1 && gNum <= 5 ? (Math.round(gNum) as GradeLevel) : 3;
    const difficulty: DifficultyLevel = validDiffs.has(diffRaw as DifficultyLevel)
      ? (diffRaw as DifficultyLevel)
      : 'Thông hiểu';

    const letterMap: Record<string, 0 | 1 | 2 | 3> = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      '0': 0,
      '1': 1,
      '2': 2,
      '3': 3,
    };
    const correctIndex = letterMap[correctRaw.toUpperCase()] ?? 0;

    questions.push({
      id: idRaw || `CSV-${Date.now()}-${r}`,
      subject,
      grade,
      topic: topicRaw || 'Kiến thức chung',
      lesson: lessonRaw || 'Bài luyện tập',
      difficulty,
      content: contentRaw,
      passage: passageRaw || undefined,
      formula: formulaRaw || undefined,
      options: [
        optA || 'Phương án A',
        optB || 'Phương án B',
        optC || 'Phương án C',
        optD || 'Phương án D',
      ],
      correctIndex,
      explanation: explanationRaw || 'Đáp án đúng đã được giáo viên biên soạn.',
      hint: hintRaw || 'Đọc kỹ câu hỏi và loại trừ dần các đáp án.',
    });
  }

  return { questions, errors };
}
