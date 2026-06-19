import { create } from 'zustand';
import type { LoadingState, ErrorState } from '@/types';

interface UiState {
  sidebarOpen: boolean;
  loading: LoadingState;
  errors: ErrorState;
  activeFeature: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (key: keyof LoadingState, isLoading: boolean) => void;
  setError: (key: keyof ErrorState, error: string | null) => void;
  clearErrors: () => void;
  setActiveFeature: (feature: string | null) => void;
}

const initialLoadingState: LoadingState = {
  carbonMirror: false,
  receiptScanner: false,
  carbonSubtitles: false,
};

const initialErrorState: ErrorState = {
  carbonMirror: null,
  receiptScanner: null,
  carbonSubtitles: null,
  carbonBudget: null,
};

export const useUiStore = create<UiState>()((set) => ({
  sidebarOpen: true,
  loading: { ...initialLoadingState },
  errors: { ...initialErrorState },
  activeFeature: null,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setLoading: (key, isLoading) => {
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    }));
  },

  setError: (key, error) => {
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    }));
  },

  clearErrors: () => {
    set({ errors: { ...initialErrorState } });
  },

  setActiveFeature: (feature) => {
    set({ activeFeature: feature });
  },
}));
