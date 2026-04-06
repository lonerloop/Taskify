import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  Add01Icon, 
  CheckmarkCircle02Icon, 
  FireIcon 
} from '@hugeicons/core-free-icons';

const habits = [
  { id: '1', name: 'Morning Meditation', icon: '🧘', streak: 5, completed: [true, true, true, true, true, false, false] },
  { id: '2', name: 'Read 20 Pages', icon: '📚', streak: 12, completed: [true, true, true, true, true, true, true] },
  { id: '3', name: 'Drink 2L Water', icon: '💧', streak: 3, completed: [true, true, true, false, false, false, false] },
];

export default function HabitsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView 
        className="px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-3xl font-bold dark:text-white">Habits</Text>
            <Text className="text-slate-500">Keep up the momentum!</Text>
          </View>
          <TouchableOpacity className="px-6 py-3 bg-blue-500 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30">
            <Text className="text-white font-bold">New Habit</Text>
          </TouchableOpacity>
        </View>

        {habits.map(habit => (
          <View key={habit.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center mr-4">
                  <Text className="text-2xl">{habit.icon}</Text>
                </View>
                <View>
                  <Text className="text-lg font-bold dark:text-white">{habit.name}</Text>
                  <View className="flex-row items-center">
                    <Text className="text-amber-500 text-sm font-bold">🔥 {habit.streak} day streak</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-800 items-center justify-center">
                {/* No icon */}
              </TouchableOpacity>
            </View>
            
            <View className="flex-row justify-between pt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <View key={i} className="items-center">
                  <View className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${habit.completed[i] ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {/* No icon */}
                  </View>
                  <Text className="text-[10px] font-bold text-slate-400">{day}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}


