import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  CheckmarkCircle02Icon,
  CircleIcon,
  Flag01Icon
} from '@hugeicons/core-free-icons';
import { Task, useTaskStore, Priority } from '@/store/useTaskStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TaskItemProps {
  task: Task;
}

const priorityColors: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  none: '#a1a1aa', // Zinc 400
};

import { useRouter } from 'expo-router';

import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

export function TaskItem({ task }: TaskItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const router = useRouter();

  return (
    <Animated.View 
      entering={FadeInRight.duration(400)}
      exiting={FadeOutLeft.duration(300)}
      layout={LinearTransition}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/task/${task.id}`)}
        className="mx-4 my-1.5 p-4 bg-white dark:bg-[#0a0a0a] rounded-3xl flex-row items-center border border-zinc-100 dark:border-zinc-900 shadow-sm"
      >
        <TouchableOpacity 
          className="mr-4"
          onPress={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
        >
          <View style={{ 
            width: 24, 
            height: 24, 
            borderRadius: 12, 
            borderWidth: 2, 
            borderColor: task.completed ? '#10b981' : priorityColors[task.priority],
            backgroundColor: task.completed ? '#10b981' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* No icon - pure geometric state */}
          </View>
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text 
            className={`text-base font-semibold dark:text-white ${task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : ''}`}
          >
            {task.title}
          </Text>
          {task.due_date && (
            <Text className="text-xs text-zinc-400 font-medium mt-1">{task.due_date}</Text>
          )}
        </View>

        {task.priority !== 'none' && !task.completed && (
          <View style={{ 
            width: 4, 
            height: 20, 
            borderRadius: 2, 
            backgroundColor: priorityColors[task.priority],
            marginLeft: 12
          }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

