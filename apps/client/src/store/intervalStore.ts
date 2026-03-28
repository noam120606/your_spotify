import { create } from "zustand";

interface IntervalState {
  startDate: Date | null;
  endDate: Date | null;
  index: number;
  setInterval: (start: Date | null, end: Date | null, index: number) => void;
}

export const useIntervalStore = create<IntervalState>((set) => ({
  startDate: null,
  endDate: null,
  index: 0,
  setInterval: (start, end, index) => set({ startDate: start, endDate: end, index }),
}));
