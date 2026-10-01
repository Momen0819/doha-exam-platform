import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExamSessionState {
  accessCode: string;
  studentName: string;
  examTitle: string;
  durationMins: number;
  remainingSeconds: number;
  isStarted: boolean;
  isSubmitted: boolean;
  answers: Record<string, string>; // questionId -> studentAnswer
  audioPlays: Record<string, number>; // questionId -> playCount
  tabSwitchCount: number;
  currentQuestionIndex: number;
  lastSavedAt: string | null;

  // Actions
  initSession: (data: {
    accessCode: string;
    studentName: string;
    examTitle: string;
    durationMins: number;
    remainingSeconds?: number;
    initialAnswers?: Record<string, string>;
  }) => void;
  startExam: () => void;
  setAnswer: (questionId: string, answer: string) => void;
  incrementAudioPlay: (questionId: string) => number;
  recordTabSwitch: () => number;
  decrementTimer: () => void;
  setQuestionIndex: (idx: number) => void;
  markSubmitted: () => void;
  setLastSaved: (timeStr: string) => void;
  resetSession: () => void;
}

export const useExamStore = create<ExamSessionState>()(
  persist(
    (set, get) => ({
      accessCode: '',
      studentName: '',
      examTitle: '',
      durationMins: 30,
      remainingSeconds: 1800,
      isStarted: false,
      isSubmitted: false,
      answers: {},
      audioPlays: {},
      tabSwitchCount: 0,
      currentQuestionIndex: 0,
      lastSavedAt: null,

      initSession: (data) =>
        set((state) => {
          // If already in-progress session for same accessCode, preserve answers
          if (state.accessCode === data.accessCode && state.isStarted && !state.isSubmitted) {
            return {
              ...state,
              studentName: data.studentName,
              examTitle: data.examTitle,
              durationMins: data.durationMins,
            };
          }
          return {
            accessCode: data.accessCode,
            studentName: data.studentName,
            examTitle: data.examTitle,
            durationMins: data.durationMins,
            remainingSeconds: data.remainingSeconds ?? data.durationMins * 60,
            isStarted: false,
            isSubmitted: false,
            answers: data.initialAnswers || {},
            audioPlays: {},
            tabSwitchCount: 0,
            currentQuestionIndex: 0,
            lastSavedAt: null,
          };
        }),

      startExam: () =>
        set({
          isStarted: true,
        }),

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

      incrementAudioPlay: (questionId) => {
        const currentPlays = get().audioPlays[questionId] || 0;
        const nextPlays = currentPlays + 1;
        set((state) => ({
          audioPlays: { ...state.audioPlays, [questionId]: nextPlays },
        }));
        return nextPlays;
      },

      recordTabSwitch: () => {
        const nextCount = get().tabSwitchCount + 1;
        set({ tabSwitchCount: nextCount });
        return nextCount;
      },

      decrementTimer: () =>
        set((state) => ({
          remainingSeconds: Math.max(0, state.remainingSeconds - 1),
        })),

      setQuestionIndex: (idx) => set({ currentQuestionIndex: idx }),

      markSubmitted: () => set({ isSubmitted: true }),

      setLastSaved: (timeStr) => set({ lastSavedAt: timeStr }),

      resetSession: () =>
        set({
          accessCode: '',
          studentName: '',
          examTitle: '',
          durationMins: 30,
          remainingSeconds: 1800,
          isStarted: false,
          isSubmitted: false,
          answers: {},
          audioPlays: {},
          tabSwitchCount: 0,
          currentQuestionIndex: 0,
          lastSavedAt: null,
        }),
    }),
    {
      name: 'doha-exam-storage',
    }
  )
);
