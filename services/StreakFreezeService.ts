import AsyncStorage from '@react-native-async-storage/async-storage';

interface FreezeState {
  monthKey: string; // e.g., 2025-08
  usedPasses: number;
  frozenDates: string[]; // YYYY-MM-DD strings
}

const STORAGE_KEY = 'streak_freeze_state_v1';
const MONTHLY_ALLOWANCE = 2;

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${y}-${m}`;
}

async function loadState(): Promise<FreezeState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as FreezeState;
    } catch {}
  }
  const now = new Date();
  return { monthKey: getMonthKey(now), usedPasses: 0, frozenDates: [] };
}

async function saveState(state: FreezeState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const StreakFreezeService = {
  async getRemainingPasses(): Promise<number> {
    let state = await loadState();
    const now = new Date();
    const currentMonthKey = getMonthKey(now);
    if (state.monthKey !== currentMonthKey) {
      state = { monthKey: currentMonthKey, usedPasses: 0, frozenDates: [] };
      await saveState(state);
    }
    return Math.max(0, MONTHLY_ALLOWANCE - state.usedPasses);
  },

  async isDateFrozen(dateIso: string): Promise<boolean> {
    const state = await loadState();
    return state.frozenDates.includes(dateIso);
  },

  async useFreezeForToday(): Promise<boolean> {
    const todayIso = new Date().toISOString().split('T')[0];
    let state = await loadState();
    const currentMonthKey = getMonthKey(new Date());
    if (state.monthKey !== currentMonthKey) {
      state = { monthKey: currentMonthKey, usedPasses: 0, frozenDates: [] };
    }
    if (state.frozenDates.includes(todayIso)) return true;
    if (state.usedPasses >= MONTHLY_ALLOWANCE) return false;
    state.usedPasses += 1;
    state.frozenDates.push(todayIso);
    await saveState(state);
    return true;
  }
};

