import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavState {
  collapsed: boolean;
  activeSection: string;
  toggleCollapse: () => void;
  setActiveSection: (section: string) => void;
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      collapsed: false,
      activeSection: 'dashboard',
      toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
      setActiveSection: (section: string) => set({ activeSection: section }),
    }),
    {
      name: 'nav-storage',
    }
  )
);
