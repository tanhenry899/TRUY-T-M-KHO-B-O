export type Subject = 'Toán' | 'Tiếng Việt';
export type SubjectFilter = 'Toán' | 'Tiếng Việt' | 'Tổng hợp';
export type GradeLevel = 1 | 2 | 3 | 4 | 5;
export type GradeFilter = GradeLevel | 'all';
export type DifficultyLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng nâng cao';
export type DifficultyFilter = DifficultyLevel | 'all';

export type GameMode =
  | 'turn_based'
  | 'team_battle'
  | 'teacher_control'
  | 'projector_fullscreen';

export type ScreenId =
  | 'home'
  | 'setup'
  | 'map'
  | 'question'
  | 'chest'
  | 'results'
  | 'bank';

export type McAnimationState =
  | 'idle'
  | 'talking'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'pointing'
  | 'celebrating';

export type ZoneId = 1 | 2 | 3 | 4 | 5;

export interface IslandZoneInfo {
  id: ZoneId;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

export type QuestionIllustration =
  | {
      type: 'counting';
      item: 'apple' | 'star' | 'shell' | 'coin' | 'flower';
      groupA: number;
      groupB?: number;
      operator?: '+' | '-';
    }
  | {
      type: 'clock';
      hour: number;
      minute: number;
    }
  | {
      type: 'fraction';
      numerator: number;
      denominator: number;
      shape: 'circle' | 'bar';
    }
  | {
      type: 'geometry';
      shape: 'square' | 'rectangle' | 'triangle' | 'circle';
      labels: string[];
    }
  | {
      type: 'scale';
      leftText: string;
      rightText: string;
    }
  | {
      type: 'image_data';
      dataUrl: string;
      caption?: string;
    };

export interface QuestionTableData {
  headers: string[];
  rows: string[][];
}

export interface Question {
  id: string;
  subject: Subject;
  grade: GradeLevel;
  topic: string;
  lesson: string;
  difficulty: DifficultyLevel;
  content: string;
  passage?: string;
  formula?: string;
  tableData?: QuestionTableData;
  illustration?: QuestionIllustration;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  hint: string;
}

export interface LifelineConfig {
  fiftyFifty: boolean;
  hint: boolean;
  readAloud: boolean;
  skip: boolean;
  swap: boolean;
}

export interface ScoringConfig {
  correctPoints: number;
  wrongPenalty: number;
  stageBonus: number;
  chestBonus: number;
  speedBonus: boolean;
}

export interface GameConfig {
  className: string;
  activityName: string;
  subjectFilter: SubjectFilter;
  gradeFilter: GradeFilter;
  teamCount: 2 | 3 | 4;
  teamNames: string[];
  questionCount: number;
  timePerQuestion: number; // seconds, 0 = unlimited
  difficultyFilter: DifficultyFilter;
  scoring: ScoringConfig;
  lifelines: LifelineConfig;
  gameMode: GameMode;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  requireTeacherConfirm: boolean;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  badgeText: string;
  score: number;
  keys: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  progressStep: number; // 0..totalQuestions
  completedZones: ZoneId[];
}

export interface GameSettings {
  graphicsQuality: 'high' | 'low';
  enableParticles: boolean;
  enableShadows: boolean;
  soundEnabled: boolean;
  mcVoiceEnabled: boolean;
  musicEnabled: boolean;
  mcSpeechRate: number;
}

export interface AnswerRecord {
  questionIndex: number;
  questionId: string;
  questionContent: string;
  subject: Subject;
  grade: GradeLevel;
  teamId: string;
  teamName: string;
  selectedOptionIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  isSkipped: boolean;
  pointsAwarded: number;
  timeSpentSeconds: number;
}

export interface GameSessionHistory {
  id: string;
  playedAt: string;
  className: string;
  activityName: string;
  subjectFilter: SubjectFilter;
  gradeFilter: GradeFilter;
  gameMode: GameMode;
  totalQuestions: number;
  winnerTeamName: string;
  teams: Team[];
  records: AnswerRecord[];
}

export const ISLAND_ZONES: IslandZoneInfo[] = [
  {
    id: 1,
    name: 'Khu vực 1 – Rừng Khởi Đầu',
    subtitle: 'Cổng chào cổ thụ & đường mòn tri thức',
    description: 'Khởi động hành trình qua cổng gỗ cổ kính giữa rừng nhiệt đới xanh mướt.',
    accentColor: '#238B55',
  },
  {
    id: 2,
    name: 'Khu vực 2 – Cầu Ánh Sáng',
    subtitle: 'Cầu gỗ vượt sông & thác nước ngọc bích',
    description: 'Băng qua dòng thác nhiều tầng với những viên đá phát sáng dẫn đường.',
    accentColor: '#61DDB5',
  },
  {
    id: 3,
    name: 'Khu vực 3 – Hang Động Bí Ẩn',
    subtitle: 'Hang pha lê rực rỡ sắc màu',
    description: 'Giải mã bí ẩn giữa những cụm pha lê phát sáng và rương báu nhỏ.',
    accentColor: '#087E9A',
  },
  {
    id: 4,
    name: 'Khu vực 4 – Núi Lửa Thử Thách',
    subtitle: 'Cầu đá vượt dòng dung nham rực sáng',
    description: 'Vượt qua thử thách cuối trước khi chạm tới ngôi đền kho báu.',
    accentColor: '#FF9F43',
  },
  {
    id: 5,
    name: 'Khu vực 5 – Đảo Kho Báu',
    subtitle: 'Đền cổ bãi biển & Rương Vàng Huyền Thoại',
    description: 'Chinh phục ngôi đền cổ dưới hàng dừa và mở khóa Rương Kho Báu Vàng!',
    accentColor: '#FFD166',
  },
];

export const TEAM_PALETTE = [
  { color: '#FFD166', label: 'Vàng Ánh Dương' },
  { color: '#61DDB5', label: 'Ngọc Bích' },
  { color: '#FF9F43', label: 'Cam Phiêu Lưu' },
  { color: '#56CFE1', label: 'Xanh Đại Dương' },
];
