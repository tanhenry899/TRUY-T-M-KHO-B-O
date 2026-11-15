import type {
  GameSettings,
  GameSessionHistory,
  Question,
} from '../types/game';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';

const DB_NAME = 'truy_tim_kho_bau_3d_db';
const DB_VERSION = 1;
const STORE_BANK = 'question_bank';

const LS_BANK_KEY = 'ttkb_question_bank_v1';
const LS_SETTINGS_KEY = 'ttkb_settings_v1';
const LS_HISTORY_KEY = 'ttkb_history_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  enableParticles: true,
  enableShadows: true,
  soundEnabled: true,
  mcVoiceEnabled: true,
  musicEnabled: false,
  mcSpeechRate: 1.0,
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_BANK)) {
        db.createObjectStore(STORE_BANK, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadQuestionBank(): Promise<Question[]> {
  try {
    const db = await openDb();
    const items: Question[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_BANK, 'readonly');
      const store = tx.objectStore(STORE_BANK);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as Question[]) || []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (items.length > 0) {
      return items;
    }
  } catch {
    // Fallback to localStorage below
  }

  try {
    const raw = localStorage.getItem(LS_BANK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Question[];
      }
    }
  } catch {
    // Fallback to built-in sample bank
  }

  await saveQuestionBank(SAMPLE_QUESTIONS);
  return SAMPLE_QUESTIONS;
}

export async function saveQuestionBank(questions: Question[]): Promise<void> {
  try {
    localStorage.setItem(LS_BANK_KEY, JSON.stringify(questions));
  } catch {
    // Quota exceeded on large images in localStorage -> IndexedDB handles it
  }

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BANK, 'readwrite');
      const store = tx.objectStore(STORE_BANK);
      store.clear();
      for (const q of questions) {
        store.put(q);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore if IndexedDB blocked in strict private mode
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // Default
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadHistory(): GameSessionHistory[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as GameSessionHistory[];
    }
  } catch {
    // Ignore
  }
  return [];
}

export function appendHistory(session: GameSessionHistory): GameSessionHistory[] {
  const current = loadHistory();
  const next = [session, ...current].slice(0, 40);
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

export function clearHistoryStorage(): void {
  try {
    localStorage.removeItem(LS_HISTORY_KEY);
  } catch {
    // Ignore
  }
}
