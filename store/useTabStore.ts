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
  maxTabs: number;
  enableTab: (id: string) => void;
  disableTab: (id: string) => void;
  reorderTabs: (newTabs: TabItem[]) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  setMaxTabs: (num: number) => void;
}

export const useTabStore = create<TabState>((set) => ({
  maxTabs: 5,
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
  enableTab: (id) => set((state) => {
    const tab = state.tabs.find(t => t.id === id);
    if (!tab) return state;
    const others = state.tabs.filter(t => t.id !== id);
    return { tabs: [...others, { ...tab, enabled: true }] };
  }),
  disableTab: (id) => set((state) => {
    const tab = state.tabs.find(t => t.id === id);
    if (!tab) return state;
    const others = state.tabs.filter(t => t.id !== id);
    return { tabs: [...others, { ...tab, enabled: false }] };
  }),
  reorderTabs: (newTabs) => set({ tabs: newTabs }),
  moveTab: (fromIndex, toIndex) => set((state) => {
    const newTabs = [...state.tabs];
    const [movedItem] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, movedItem);
    return { tabs: newTabs };
  }),
  setMaxTabs: (num) => set({ maxTabs: num }),
}));
