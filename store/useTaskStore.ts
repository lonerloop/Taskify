import { create } from 'zustand';

export type Priority = 'none' | 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: string;
  time?: string;
  repeat?: any;
  reminders?: any[];
  list_id?: string;
  tags?: string[];
  created_at: string;
}

export interface List {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface TaskState {
  tasks: Task[];
  lists: List[];
  selectedListId: string;
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setLists: (lists: List[]) => void;
  setSelectedListId: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [
    {
      id: '1',
      title: 'Design TickTick Clone UI',
      completed: false,
      priority: 'high',
      due_date: 'Today',
      list_id: 'today',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Configure Supabase Auth',
      completed: false,
      priority: 'medium',
      due_date: 'Today',
      list_id: 'today',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Setup Zustand Store',
      completed: true,
      priority: 'low',
      due_date: 'Yesterday',
      list_id: 'inbox',
      created_at: new Date().toISOString(),
    },
  ],
  lists: [
    { id: 'inbox', name: 'Inbox', icon: 'Inbox', color: '#3b82f6' },
    { id: 'today', name: 'Today', icon: 'Calendar', color: '#ef4444' },
    { id: 'work', name: 'Work', icon: 'Briefcase', color: '#8b5cf6' },
  ],
  selectedListId: 'today',
  isLoading: false,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  setLists: (lists) => set({ lists }),
  setSelectedListId: (id) => set({ selectedListId: id }),
}));
