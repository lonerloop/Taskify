import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon 
} from '@hugeicons/core-free-icons';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from '@/components/TaskItem';

export default function CalendarScreen() {
// ... existing logic ...
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTaskStore();

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-[14.28%] aspect-square" />);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const isToday = i === new Date().getDate() && month === new Date().getMonth();
      const isSelected = i === selectedDate.getDate();
      
      days.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setSelectedDate(new Date(year, month, i))}
          className={`w-[14.28%] aspect-square items-center justify-center rounded-full ${isSelected ? 'bg-blue-500 shadow-sm shadow-blue-500/30' : ''}`}
        >
          <Text className={`text-base font-medium ${isSelected ? 'text-white' : 'dark:text-white'} ${isToday && !isSelected ? 'text-blue-500 font-bold' : ''}`}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold dark:text-white">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity className="p-2 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl" onPress={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
            <Text className="text-slate-500 font-bold">Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity className="p-2 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl" onPress={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
            <Text className="text-slate-500 font-bold">Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 flex-row flex-wrap mb-6">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <View key={i} className="w-[14.28%] items-center py-2">
            <Text className="text-xs font-bold text-slate-400">{day}</Text>
          </View>
        ))}
        {renderCalendar()}
      </View>

      <View className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-t-[40px] px-6 pt-8 shadow-inner">
        <Text className="text-lg font-bold dark:text-white mb-4">Tasks for selected day</Text>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.id} task={task} />)
          ) : (
            <View className="flex-1 items-center justify-center pt-10">
              <Text className="text-slate-400 text-center">No tasks scheduled</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

