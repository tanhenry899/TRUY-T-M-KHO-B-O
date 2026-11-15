import type {
  AnswerRecord,
  ScoringConfig,
  Team,
  ZoneId,
} from '../types/game';

export const DEFAULT_SCORING: ScoringConfig = {
  correctPoints: 100,
  wrongPenalty: 0,
  stageBonus: 50,
  chestBonus: 200,
  speedBonus: false,
};

export function getZoneForQuestionIndex(
  questionIndex: number,
  totalQuestions: number,
): ZoneId {
  if (totalQuestions <= 0) return 1;
  const ratio = (questionIndex + 1) / totalQuestions;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  if (ratio <= 0.8) return 4;
  return 5;
}

export function isStageCompletedAtQuestion(
  questionIndex: number,
  totalQuestions: number,
): ZoneId | null {
  const currentZone = getZoneForQuestionIndex(questionIndex, totalQuestions);
  if (questionIndex === totalQuestions - 1) return currentZone;
  const nextZone = getZoneForQuestionIndex(questionIndex + 1, totalQuestions);
  return nextZone > currentZone ? currentZone : null;
}

export function calculateAnswerScore(params: {
  isCorrect: boolean;
  isSkipped: boolean;
  timeRemainingSeconds: number;
  timeLimitSeconds: number;
  scoring: ScoringConfig;
  completedZone: ZoneId | null;
}): {
  basePoints: number;
  speedBonusPoints: number;
  stageBonusPoints: number;
  totalPoints: number;
  keysEarned: number;
} {
  if (params.isSkipped) {
    return {
      basePoints: 0,
      speedBonusPoints: 0,
      stageBonusPoints: 0,
      totalPoints: 0,
      keysEarned: 0,
    };
  }

  if (!params.isCorrect) {
    return {
      basePoints: -Math.abs(params.scoring.wrongPenalty),
      speedBonusPoints: 0,
      stageBonusPoints: 0,
      totalPoints: -Math.abs(params.scoring.wrongPenalty),
      keysEarned: 0,
    };
  }

  const basePoints = params.scoring.correctPoints;
  let speedBonusPoints = 0;
  if (
    params.scoring.speedBonus &&
    params.timeLimitSeconds > 0 &&
    params.timeRemainingSeconds > 0
  ) {
    const ratio = params.timeRemainingSeconds / params.timeLimitSeconds;
    speedBonusPoints = Math.round(ratio * 30);
  }

  const stageBonusPoints = params.completedZone ? params.scoring.stageBonus : 0;

  return {
    basePoints,
    speedBonusPoints,
    stageBonusPoints,
    totalPoints: basePoints + speedBonusPoints + stageBonusPoints,
    keysEarned: 1,
  };
}

export function computeAccuracyPercent(team: Team): number {
  const answered = team.correctCount + team.wrongCount;
  if (answered === 0) return 0;
  return Math.round((team.correctCount / answered) * 100);
}

export function rankTeams(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.keys !== a.keys) return b.keys - a.keys;
    return b.correctCount - a.correctCount;
  });
}

export function summarizeRecordsByTeam(teams: Team[], records: AnswerRecord[]) {
  return teams.map((team) => {
    const teamRecords = records.filter((r) => r.teamId === team.id);
    return {
      team,
      accuracy: computeAccuracyPercent(team),
      avgSeconds:
        teamRecords.length > 0
          ? Math.round(
              teamRecords.reduce((acc, r) => acc + r.timeSpentSeconds, 0) /
                teamRecords.length,
            )
          : 0,
    };
  });
}
