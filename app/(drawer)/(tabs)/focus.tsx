import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PomodoroTimer } from '@/components/PomodoroTimer';

export default function FocusScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="mb-12 items-center">
          <Text className="text-3xl font-bold dark:text-white">Focus Time</Text>
          <Text className="text-slate-500 mt-2">Stay productive, stay focused.</Text>
        </View>
        <PomodoroTimer />
      </ScrollView>
    </SafeAreaView>
  );
}

