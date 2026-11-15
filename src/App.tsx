import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TEAM_PALETTE,
  type AnswerRecord,
  type GameConfig,
  type GameSessionHistory,
  type GameSettings,
  type McAnimationState,
  type Question,
  type ScreenId,
  type Team,
} from './types/game';
import { SAMPLE_QUESTIONS } from './data/sampleQuestions';
import {
  appendHistory,
  clearHistoryStorage,
  loadHistory,
  loadQuestionBank,
  loadSettings,
  saveQuestionBank,
  saveSettings,
} from './engine/storage';
import {
  calculateAnswerScore,
  DEFAULT_SCORING,
  getZoneForQuestionIndex,
  isStageCompletedAtQuestion,
  rankTeams,
} from './engine/scoring';
import { audioEngine } from './engine/audio';
import { IslandSceneController, type CameraPreset } from './three/islandScene';
import { HomeScreen } from './components/HomeScreen';
import { filterMatchingQuestions, SetupScreen } from './components/SetupScreen';
import { MapScreen } from './components/MapScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { ChestFinaleScreen } from './components/ChestFinaleScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { QuestionBankModal } from './components/QuestionBankModal';
import { ExitModal, GuideModal, SettingsModal } from './components/Modals';

const MC_SCRIPTS = {
  welcome:
    'Xin chào các nhà thám hiểm nhí! Chào mừng các bạn đến với hòn đảo kho báu! Hãy sử dụng trí thông minh để chinh phục những thử thách và tìm ra kho báu huyền thoại nhé!',
  correct: 'Hoan hô! Chính xác rồi! Đội của bạn nhận được một chìa khóa vàng!',
  wrong: 'Ôi, tiếc quá! Đáp án chưa chính xác. Đừng lo, hãy tiếp tục cố gắng nhé!',
  chest: 'Chúc mừng các nhà thám hiểm! Kho báu huyền thoại đã thuộc về các bạn!',
};

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionOptions(q: Question): Question {
  const indexed = q.options.map((text, idx) => ({
    text,
    isCorrect: idx === q.correctIndex,
  }));
  const mixed = shuffleArray(indexed);
  const nextCorrect = mixed.findIndex((m) => m.isCorrect) as 0 | 1 | 2 | 3;
  return {
    ...q,
    options: [mixed[0].text, mixed[1].text, mixed[2].text, mixed[3].text],
    correctIndex: nextCorrect >= 0 ? nextCorrect : 0,
  };
}

const INITIAL_CONFIG: GameConfig = {
  className: 'Lớp 3A1',
  activityName: 'Hành Trình Chinh Phục Tri Thức',
  subjectFilter: 'Tổng hợp',
  gradeFilter: 'all',
  teamCount: 3,
  teamNames: ['Đội Hải Âu', 'Đội Sư Tử', 'Đội Đại Bàng', 'Đội Cá Heo'],
  questionCount: 10,
  timePerQuestion: 30,
  difficultyFilter: 'all',
  scoring: { ...DEFAULT_SCORING },
  lifelines: {
    fiftyFifty: true,
    hint: true,
    readAloud: true,
    skip: true,
    swap: true,
  },
  gameMode: 'turn_based',
  shuffleQuestions: true,
  shuffleOptions: true,
  requireTeacherConfirm: false,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<IslandSceneController | null>(null);

  const [screen, setScreen] = useState<ScreenId>('home');
  const [guideOpen, setGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [history, setHistory] = useState<GameSessionHistory[]>(() => loadHistory());
  const [config, setConfig] = useState<GameConfig>(INITIAL_CONFIG);

  // Active Match State
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [reserveQuestions, setReserveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [mcDialogue, setMcDialogue] = useState(MC_SCRIPTS.welcome);
  const [isMcSpeaking, setIsMcSpeaking] = useState(false);
  const [chestBonusApplied, setChestBonusApplied] = useState(false);
  const answeredTurnLockRef = useRef<number>(-1);

  // Load Question Bank from IndexedDB / LocalStorage on startup
  useEffect(() => {
    loadQuestionBank().then((loaded) => {
      if (loaded.length > 0) setQuestions(loaded);
    });
  }, []);

  // Sync Audio Engine with Settings
  useEffect(() => {
    audioEngine.configure({
      soundEnabled: settings.soundEnabled,
      mcVoiceEnabled: settings.mcVoiceEnabled,
      musicEnabled: settings.musicEnabled,
      mcSpeechRate: settings.mcSpeechRate,
    });
    saveSettings(settings);
    sceneRef.current?.applyQualitySettings(settings);
  }, [settings]);

  // Mount Three.js 3D Island Scene once
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;
    const ctrl = new IslandSceneController(mount, settings);
    sceneRef.current = ctrl;
    return () => {
      ctrl.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track Fullscreen API state
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    } catch {
      // Safe fallback inside restricted iframes
    }
  }, []);

  const speakWithMc = useCallback(
    (text: string, animWhileTalking: McAnimationState = 'talking', endAnim: McAnimationState = 'idle') => {
      setMcDialogue(text);
      sceneRef.current?.setMcState(animWhileTalking);
      audioEngine.speakMc(text, {
        onStart: () => setIsMcSpeaking(true),
        onEnd: () => {
          setIsMcSpeaking(false);
          sceneRef.current?.setMcState(endAnim);
        },
      });
    },
    [],
  );

  const handleSaveQuestions = useCallback((next: Question[]) => {
    setQuestions(next);
    saveQuestionBank(next);
  }, []);

  const handleStartGame = useCallback(() => {
    audioEngine.playClick();
    if (config.gameMode === 'projector_fullscreen' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    const matching = filterMatchingQuestions(questions, config);
    const ordered = config.shuffleQuestions ? shuffleArray(matching) : [...matching];
    const desiredCount = Math.min(config.questionCount, ordered.length);
    const chosen = ordered.slice(0, desiredCount).map((q) =>
      config.shuffleOptions ? shuffleQuestionOptions(q) : q,
    );
    const reserve = ordered.slice(desiredCount);

    const initTeams: Team[] = Array.from({ length: config.teamCount }).map((_, idx) => ({
      id: `team-${idx + 1}`,
      name: config.teamNames[idx]?.trim() || `Đội ${idx + 1}`,
      color: TEAM_PALETTE[idx].color,
      badgeText: TEAM_PALETTE[idx].label,
      score: 0,
      keys: 0,
      correctCount: 0,
      wrongCount: 0,
      skippedCount: 0,
      progressStep: 0,
      completedZones: [],
    }));

    setTeams(initTeams);
    setSessionQuestions(chosen);
    setReserveQuestions(reserve);
    setCurrentQuestionIndex(0);
    setActiveTeamIndex(0);
    setRecords([]);
    setChestBonusApplied(false);
    answeredTurnLockRef.current = -1;

    sceneRef.current?.resetChest();
    sceneRef.current?.syncTeams(initTeams, chosen.length);
    sceneRef.current?.setCameraPreset('zone1');
    setScreen('map');
    speakWithMc(MC_SCRIPTS.welcome, 'talking', 'pointing');
  }, [config, questions, speakWithMc]);

  const currentZoneId = getZoneForQuestionIndex(
    Math.min(currentQuestionIndex, Math.max(sessionQuestions.length - 1, 0)),
    Math.max(sessionQuestions.length, 1),
  );

  const handleOpenNextChallenge = () => {
    audioEngine.playClick();
    audioEngine.stopSpeech();
    setScreen('question');
  };

  const handleSubmitAnswer = useCallback(
    (params: {
      selectedIndex: number | null;
      isSkipped: boolean;
      timeRemaining: number;
      timeSpent: number;
    }) => {
      // Prevent duplicate scoring if triggered twice on the same turn
      if (answeredTurnLockRef.current === currentQuestionIndex) {
        return {
          pointsAwarded: 0,
          stageBonusPoints: 0,
          keysEarned: 0,
          isCorrect: false,
        };
      }
      answeredTurnLockRef.current = currentQuestionIndex;

      const currentQ = sessionQuestions[currentQuestionIndex];
      const isCorrect =
        !params.isSkipped &&
        params.selectedIndex !== null &&
        params.selectedIndex === currentQ.correctIndex;

      const completedZone = isStageCompletedAtQuestion(
        currentQuestionIndex,
        sessionQuestions.length,
      );

      const calc = calculateAnswerScore({
        isCorrect,
        isSkipped: params.isSkipped,
        timeRemainingSeconds: params.timeRemaining,
        timeLimitSeconds: config.timePerQuestion,
        scoring: config.scoring,
        completedZone,
      });

      if (isCorrect) {
        audioEngine.playCorrect();
        window.setTimeout(() => audioEngine.playCoin(), 280);
        window.setTimeout(() => audioEngine.playKey(), 480);
        speakWithMc(MC_SCRIPTS.correct, 'happy', 'happy');
      } else {
        audioEngine.playWrong();
        speakWithMc(MC_SCRIPTS.wrong, 'sad', 'idle');
      }

      const activeTeam = teams[activeTeamIndex] || teams[0];

      const nextTeams = teams.map((t, idx) => {
        if (idx !== activeTeamIndex) return t;
        const nextZones =
          isCorrect && completedZone && !t.completedZones.includes(completedZone)
            ? [...t.completedZones, completedZone]
            : t.completedZones;
        return {
          ...t,
          score: Math.max(0, t.score + calc.totalPoints),
          keys: t.keys + calc.keysEarned,
          correctCount: t.correctCount + (isCorrect ? 1 : 0),
          wrongCount: t.wrongCount + (!isCorrect && !params.isSkipped ? 1 : 0),
          skippedCount: t.skippedCount + (params.isSkipped ? 1 : 0),
          progressStep: isCorrect ? t.progressStep + 1 : t.progressStep,
          completedZones: nextZones,
        };
      });

      setTeams(nextTeams);
      sceneRef.current?.syncTeams(nextTeams, sessionQuestions.length);

      setRecords((prev) => [
        ...prev,
        {
          questionIndex: currentQuestionIndex,
          questionId: currentQ.id,
          questionContent: currentQ.content,
          subject: currentQ.subject,
          grade: currentQ.grade,
          teamId: activeTeam.id,
          teamName: activeTeam.name,
          selectedOptionIndex: params.selectedIndex,
          correctIndex: currentQ.correctIndex,
          isCorrect,
          isSkipped: params.isSkipped,
          pointsAwarded: calc.totalPoints,
          timeSpentSeconds: params.timeSpent,
        },
      ]);

      return {
        pointsAwarded: calc.totalPoints,
        stageBonusPoints: calc.stageBonusPoints,
        keysEarned: calc.keysEarned,
        isCorrect,
      };
    },
    [
      activeTeamIndex,
      config.scoring,
      config.timePerQuestion,
      currentQuestionIndex,
      sessionQuestions,
      speakWithMc,
      teams,
    ],
  );

  const handleSwapQuestion = useCallback(() => {
    audioEngine.playLifeline();
    if (reserveQuestions.length === 0) return false;
    const [replacement, ...rest] = reserveQuestions;
    const prepared = config.shuffleOptions
      ? shuffleQuestionOptions(replacement)
      : replacement;
    setReserveQuestions(rest);
    setSessionQuestions((prev) =>
      prev.map((q, idx) => (idx === currentQuestionIndex ? prepared : q)),
    );
    return true;
  }, [config.shuffleOptions, currentQuestionIndex, reserveQuestions]);

  const handleProceedNext = () => {
    audioEngine.playClick();
    audioEngine.stopSpeech();
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= sessionQuestions.length) {
      setCurrentQuestionIndex(nextIdx);
      sceneRef.current?.setCameraPreset('chest');
      sceneRef.current?.setMcState('excited');
      setScreen('chest');
      return;
    }

    setCurrentQuestionIndex(nextIdx);
    if (config.gameMode !== 'teacher_control') {
      setActiveTeamIndex((prev) => (prev + 1) % teams.length);
    }

    const nextZone = getZoneForQuestionIndex(nextIdx, sessionQuestions.length);
    sceneRef.current?.focusZone(nextZone);
    setScreen('map');
    const nextTeam =
      teams[
        config.gameMode !== 'teacher_control'
          ? (activeTeamIndex + 1) % teams.length
          : activeTeamIndex
      ];
    setMcDialogue(
      `Tiến tới câu hỏi số ${nextIdx + 1}! Xin mời ${nextTeam?.name || 'đội tiếp theo'} chuẩn bị vượt thử thách!`,
    );
  };

  const handleTriggerOpenChest = () => {
    audioEngine.playChestCreak();
    window.setTimeout(() => audioEngine.playChestOpenFanfare(), 750);
    sceneRef.current?.triggerChestOpening();
    speakWithMc(MC_SCRIPTS.chest, 'celebrating', 'celebrating');

    if (!chestBonusApplied) {
      setChestBonusApplied(true);
      const ranked = rankTeams(teams);
      const winnerId = ranked[0]?.id;
      const updated = teams.map((t) =>
        t.id === winnerId ? { ...t, score: t.score + config.scoring.chestBonus } : t,
      );
      setTeams(updated);

      const newEntry: GameSessionHistory = {
        id: `HIS-${Date.now()}`,
        playedAt: new Date().toISOString(),
        className: config.className,
        activityName: config.activityName,
        subjectFilter: config.subjectFilter,
        gradeFilter: config.gradeFilter,
        gameMode: config.gameMode,
        totalQuestions: sessionQuestions.length,
        winnerTeamName: ranked[0]?.name || 'Đội chiến thắng',
        teams: updated,
        records,
      };
      setHistory(appendHistory(newEntry));
    }
  };

  const handleGoHome = () => {
    audioEngine.playClick();
    audioEngine.stopSpeech();
    sceneRef.current?.resetChest();
    sceneRef.current?.setMcState('idle');
    sceneRef.current?.setCameraPreset('home');
    setScreen('home');
  };

  const handleFocusCamera = (preset: CameraPreset) => {
    audioEngine.playClick();
    sceneRef.current?.setCameraPreset(preset);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#082B3D] text-[#FFF6DF]">
      {/* Persistent 3D WebGL Island Canvas */}
      <div
        ref={canvasMountRef}
        className="fixed inset-0 z-0 w-full h-full"
        aria-label="Sân khấu Đảo Kho Báu 3D"
      />

      {/* Screen 1: Trang chủ */}
      {screen === 'home' && (
        <HomeScreen
          onStartSetup={() => {
            audioEngine.playClick();
            setScreen('setup');
          }}
          onOpenGuide={() => {
            audioEngine.playClick();
            setGuideOpen(true);
          }}
          onOpenBank={() => {
            audioEngine.playClick();
            setScreen('bank');
          }}
          onOpenSettings={() => {
            audioEngine.playClick();
            setSettingsOpen(true);
          }}
          onOpenExit={() => {
            audioEngine.playClick();
            setExitOpen(true);
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          questionCount={questions.length}
        />
      )}

      {/* Screen 2: Thiết lập trò chơi */}
      {screen === 'setup' && (
        <SetupScreen
          config={config}
          settings={settings}
          questions={questions}
          onChangeConfig={setConfig}
          onChangeSettings={setSettings}
          onBack={handleGoHome}
          onStartGame={handleStartGame}
        />
      )}

      {/* Screen 3 & 4: Bản đồ kho báu 3D + MC 3D */}
      {screen === 'map' && (
        <MapScreen
          config={config}
          teams={teams}
          activeTeamIndex={activeTeamIndex}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={sessionQuestions.length}
          currentZoneId={currentZoneId}
          mcDialogue={mcDialogue}
          isMcSpeaking={isMcSpeaking}
          isFinishedAllQuestions={currentQuestionIndex >= sessionQuestions.length}
          onFocusCamera={handleFocusCamera}
          onReplayMcSpeech={() => speakWithMc(mcDialogue, 'talking', 'pointing')}
          onOpenNextChallenge={handleOpenNextChallenge}
          onOpenTreasureChest={() => {
            sceneRef.current?.setCameraPreset('chest');
            setScreen('chest');
          }}
          onExitHome={handleGoHome}
        />
      )}

      {/* Screen 5 & 6: Giao diện câu hỏi & Hệ thống trợ giúp */}
      {screen === 'question' && sessionQuestions[currentQuestionIndex] && (
        <QuestionScreen
          config={config}
          question={sessionQuestions[currentQuestionIndex]}
          questionIndex={currentQuestionIndex}
          totalQuestions={sessionQuestions.length}
          zoneId={currentZoneId}
          teams={teams}
          activeTeamIndex={activeTeamIndex}
          onSelectActiveTeam={setActiveTeamIndex}
          onSubmitAnswer={handleSubmitAnswer}
          onSwapQuestion={handleSwapQuestion}
          onSpeakQuestion={(txt) => speakWithMc(txt, 'talking', 'idle')}
          onProceedNext={handleProceedNext}
          onBackToMap={() => {
            sceneRef.current?.focusZone(currentZoneId);
            setScreen('map');
          }}
        />
      )}

      {/* Screen 7: Mở rương kho báu 3D */}
      {screen === 'chest' && (
        <ChestFinaleScreen
          teams={teams}
          chestBonusPoints={config.scoring.chestBonus}
          onTriggerOpenChest={handleTriggerOpenChest}
          onViewResults={() => {
            audioEngine.playClick();
            setScreen('results');
          }}
        />
      )}

      {/* Screen 8: Bảng kết quả & Lịch sử */}
      {screen === 'results' && (
        <ResultsScreen
          config={config}
          teams={teams}
          records={records}
          history={history}
          onPlayAgain={handleStartGame}
          onGoHome={handleGoHome}
          onClearHistory={() => {
            clearHistoryStorage();
            setHistory([]);
          }}
        />
      )}

      {/* Ngân hàng câu hỏi */}
      {screen === 'bank' && (
        <QuestionBankModal
          questions={questions}
          history={history}
          onSaveQuestions={handleSaveQuestions}
          onBack={handleGoHome}
        />
      )}

      {/* Global Modals */}
      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        questions={questions}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={setSettings}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <ExitModal
        open={exitOpen}
        onCancel={() => setExitOpen(false)}
        onConfirmReset={handleGoHome}
      />
    </div>
  );
}
