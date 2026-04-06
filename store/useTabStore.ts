import { create } from 'zustand';

export interface TabItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  enabled: boolean;
}

interface TabState {
  tabs: TabItem[];
  enableTab: (id: string) => void;
  disableTab: (id: string) => void;
  reorderTabs: (newTabs: TabItem[]) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tabs: [
    { 
      id: 'tasks', 
      title: 'Task', 
      description: 'Manage your task with lists and filters.', 
      iconName: 'CheckmarkSquare02Icon', 
      enabled: true 
    },
    { 
      id: 'calendar', 
      title: 'Calendar', 
      description: 'Manage your task with five calendar views.', 
      iconName: 'Calendar02Icon', 
      enabled: true 
    },
    { 
      id: 'pomodoro', 
      title: 'Pomodoro', 
      description: 'Use the Pomo timer or stopwatch to keep focus.', 
      iconName: 'Timer01Icon', 
      enabled: true 
    },
    { 
      id: 'habits', 
      title: 'Habit Tracker', 
      description: 'Develop a habit and keep track of it.', 
      iconName: 'Target01Icon', 
      enabled: true 
    },
    { 
      id: 'countdown', 
      title: 'Countdown', 
      description: 'Remember every special day.', 
      iconName: 'CalendarFavorite02Icon', 
      enabled: true 
    },
    { 
      id: 'settings', 
      title: 'Settings', 
      description: 'Make changes to the current settings.', 
      iconName: 'Settings03Icon', 
      enabled: true 
    },
    { 
      id: 'matrix', 
      title: 'Eisenhower Matrix', 
      description: "Focus on what's important and urgent.", 
      iconName: 'Grid02Icon', 
      enabled: false 
    },
    { 
      id: 'search', 
      title: 'Search', 
      description: 'Do a quick search easily.', 
      iconName: 'Search01Icon', 
      enabled: false 
    },
  ],
  enableTab: (id) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, enabled: true } : t)
  })),
  disableTab: (id) => set((state) => ({
    tabs: state.tabs.map(t => t.id === id ? { ...t, enabled: false } : t)
  })),
  reorderTabs: (newTabs) => set({ tabs: newTabs }),
}));
