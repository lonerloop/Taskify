import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon, 
  Delete02Icon, 
  Calendar01Icon, 
  Flag01Icon, 
  Tag01Icon, 
  CheckmarkCircle02Icon, 
  CircleIcon 
} from '@hugeicons/core-free-icons';
import { useTaskStore } from '@/store/useTaskStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const rawColorScheme = useColorScheme();
  const colorScheme = rawColorScheme === 'dark' ? 'dark' : 'light';
  const { tasks, toggleTask, deleteTask, updateTask } = useTaskStore();
  
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="dark:text-white">Task not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    deleteTask(task.id);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-900">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="p-2 -mr-2">
          <HugeiconsIcon icon={Delete02Icon} size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="flex-row items-start mb-6">
          <TouchableOpacity onPress={() => toggleTask(task.id)} className="mt-1">
            {task.completed ? (
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={28} color="#10b981" />
            ) : (
              <HugeiconsIcon icon={CircleIcon} size={28} color="#94a3b8" />
            )}
          </TouchableOpacity>
          <TextInput
            multiline
            className={`flex-1 ml-4 text-2xl font-bold dark:text-white ${task.completed ? 'line-through text-slate-400' : ''}`}
            value={task.title}
            onChangeText={(text) => updateTask(task.id, { title: text })}
            placeholder="Task Title"
          />
        </View>

        <View className="flex-row items-center py-4 border-b border-slate-50 dark:border-slate-900">
          <HugeiconsIcon icon={Calendar01Icon} size={20} color="#64748b" />
          <Text className="ml-4 text-slate-600 dark:text-slate-400">Due Date</Text>
          <Text className="flex-1 text-right font-medium dark:text-white">{task.due_date || 'No date'}</Text>
        </View>

        <View className="flex-row items-center py-4 border-b border-slate-50 dark:border-slate-900">
          <HugeiconsIcon icon={Flag01Icon} size={20} color="#64748b" />
          <Text className="ml-4 text-slate-600 dark:text-slate-400">Priority</Text>
          <Text className="flex-1 text-right font-medium capitalize dark:text-white">{task.priority}</Text>
        </View>

        <View className="mt-8">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Notes</Text>
          <TextInput
            multiline
            placeholder="Add notes here..."
            placeholderTextColor="#94a3b8"
            className="text-base text-slate-600 dark:text-slate-300 min-h-[100px]"
            textAlignVertical="top"
            value={task.description}
            onChangeText={(text) => updateTask(task.id, { description: text })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

