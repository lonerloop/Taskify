import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  CheckmarkCircle02Icon,
  CircleIcon,
  Flag01Icon,
  RepeatIcon,
  AlarmClockIcon,
  CheckmarkSquare02Icon
} from '@hugeicons/core-free-icons';
import { Task, useTaskStore, Priority } from '@/store/useTaskStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useRouter } from 'expo-router';

import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

interface TaskItemProps {
  task: Task;
  onPress?: (task: Task) => void;
}

const priorityColors: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  none: '#a1a1aa', // Zinc 400
};

export function TaskItem({ task, onPress }: TaskItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const toggleTask = useTaskStore((state) => state.toggleTask);
  const router = useRouter();

  return (
    <Animated.View 
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
    >
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => onPress ? onPress(task) : router.push(`/task/${task.id}`)}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingVertical: 12, 
          paddingHorizontal: 16 
        }}
      >
        <TouchableOpacity 
          style={{ marginRight: 20 }}
          onPress={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
        >
          <View style={{ 
            width: 24, 
            height: 24, 
            borderRadius: 6, 
            borderWidth: task.completed ? 0 : 2, 
            borderColor: task.completed ? 'transparent' : priorityColors[task.priority],
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {task.completed ? (
              <HugeiconsIcon icon={CheckmarkSquare02Icon} size={24} color="#52525b" />
            ) : null}
          </View>
        </TouchableOpacity>
        
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ 
              fontSize: 16, 
              fontWeight: '500', 
              color: task.completed ? '#52525b' : 'white'
            }}
          >
            {task.title}
          </Text>
        </View>

        {(task.time !== 'None' || (task.reminders && task.reminders.length > 0) || (task.repeat && task.repeat !== 'None')) && (
          <View style={{ alignItems: 'flex-end', minWidth: 60 }}>
            <Text 
              style={{ 
                fontSize: 12, 
                fontWeight: '600', 
                color: task.completed ? '#3f3f46' : (task.due_date === 'Yesterday' ? '#ef4444' : '#3b82f6'),
                textTransform: 'uppercase'
              }}
            >
              {task.time !== 'None' ? task.time : task.due_date}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 2, gap: 4 }}>
              {task.repeat && task.repeat !== 'None' && (
                <HugeiconsIcon icon={RepeatIcon} size={12} color={task.completed ? '#3f3f46' : '#71717a'} />
              )}
              {task.reminders && task.reminders.length > 0 && (
                <HugeiconsIcon icon={AlarmClockIcon} size={12} color={task.completed ? '#3f3f46' : '#71717a'} />
              )}
            </View>
          </View>
        )}


      </TouchableOpacity>
    </Animated.View>
  );
}

