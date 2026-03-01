import { create } from 'zustand';

interface IntervalState {
  startDate: Date | null;
  endDate: Date | null;
  setInterval: (start: Date | null, end: Date | null) => void;
}

export const useIntervalStore = create<IntervalState>((set) => ({
  startDate: null,
  endDate: null,
  setInterval: (start, end) => set({ startDate: start, endDate: end })
}));
