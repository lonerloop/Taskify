import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon,
  Calendar02Icon,
  CheckmarkSquare02Icon,
  MoreVerticalIcon
} from '@hugeicons/core-free-icons';
import { useTaskStore, Task } from '@/store/useTaskStore';
import { TaskItem } from '@/components/TaskItem';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Layout,
  LinearTransition
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

/**
 * Robust date matching helper
 * Handles "Today", "Tomorrow", "Yesterday" and formatted strings vs. a Date object
 */
const isDateMatch = (dueDate: string | undefined, targetDate: Date): boolean => {
  if (!dueDate) return false;
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const normalize = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };

  const targetTime = normalize(targetDate);

  if (dueDate === 'Today') return targetTime === normalize(today);
  if (dueDate === 'Tomorrow') return targetTime === normalize(tomorrow);
  if (dueDate === 'Yesterday') return targetTime === normalize(yesterday);

  // Handle formatted strings from AddTaskModal: "Apr 6" (current year implied)
  // or store standard ISO strings
  try {
    const parsed = new Date(dueDate);
    if (!isNaN(parsed.getTime())) {
      return normalize(parsed) === targetTime;
    }
    
    // Fallback for "Month Day" format
    const currentYear = new Date().getFullYear();
    const fallbackParsed = new Date(`${dueDate}, ${currentYear}`);
    return normalize(fallbackParsed) === targetTime;
  } catch (e) {
    return false;
  }
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date()); // Controls the month being viewed
  const { tasks } = useTaskStore();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => (new Date(year, month, 1).getDay() + 6) % 7; // Monday start

  const monthTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      // Simple check to see if it belongs to current view month (optimization)
      return true; // We'll do exact match in render
    });
  }, [tasks, viewDate]);

  const selectedDayTasks = useMemo(() => {
    return tasks.filter(task => isDateMatch(task.due_date, selectedDate));
  }, [tasks, selectedDate]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    triggerHaptic();
    const nextDate = new Date(viewDate);
    nextDate.setMonth(viewDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(nextDate);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const days = [];
    // Empty slots for previous month padding
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const dateForDay = new Date(year, month, i);
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
      
      const dayTasks = tasks.filter(t => isDateMatch(t.due_date, dateForDay));
      const hasTasks = dayTasks.length > 0;
      const highPriority = dayTasks.some(t => t.priority === 'high');

      days.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => {
            triggerHaptic();
            setSelectedDate(dateForDay);
          }}
          style={{
            width: '14.28%',
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
            borderWidth: isToday && !isSelected ? 1 : 0,
            borderColor: '#3b82f6',
          }}>
            <Text style={{
              fontSize: 15,
              fontWeight: isSelected || isToday ? '700' : '500',
              color: isSelected ? 'white' : isToday ? '#3b82f6' : '#e4e4e7',
            }}>
              {i}
            </Text>
            {hasTasks && !isSelected && (
              <View style={{
                position: 'absolute',
                bottom: 4,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: highPriority ? '#ef4444' : '#71717a',
              }} />
            )}
          </View>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#09090b' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 24, 
        paddingVertical: 16 
      }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: 'white' }}>
            {monthName}
          </Text>
          <Text style={{ fontSize: 14, color: '#71717a', fontWeight: '600', marginTop: 2 }}>
            {viewDate.getFullYear()}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderRadius: 16, padding: 4 }}>
          <TouchableOpacity 
            onPress={() => handleMonthChange('prev')}
            style={{ padding: 8 }}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#a1a1aa" />
          </TouchableOpacity>
          <View style={{ width: 1, height: 20, backgroundColor: '#27272a', marginHorizontal: 4 }} />
          <TouchableOpacity 
            onPress={() => handleMonthChange('next')}
            style={{ padding: 8 }}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#a1a1aa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Grid */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <View key={i} style={{ width: '14.28%', alignItems: 'center', paddingVertical: 2 }}>
              <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#52525b', letterSpacing: 0.5 }}>
                {day.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        
        <Animated.View 
          key={viewDate.getTime()}
          entering={FadeIn.duration(400)}
          style={{ flexDirection: 'row', flexWrap: 'wrap' }}
        >
          {renderCalendar()}
        </Animated.View>
      </View>

      {/* Tasks Section */}
      <View style={{ 
        flex: 1, 
        backgroundColor: '#111113', 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        paddingTop: 24,
        marginTop: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingHorizontal: 24, 
          marginBottom: 20 
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>
            {selectedDate.getDate() === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth() ? 'Today\'s Schedule' : 'Schedule'}
          </Text>
          <TouchableOpacity style={{ padding: 4 }}>
            <HugeiconsIcon icon={MoreVerticalIcon} size={20} color="#71717a" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map((task, index) => (
              <Animated.View 
                key={task.id} 
                entering={FadeIn.delay(index * 100).duration(400)}
                layout={LinearTransition}
              >
                <TaskItem task={task} />
              </Animated.View>
            ))
          ) : (
            <Animated.View 
              entering={FadeIn.duration(600)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}
            >
              <View style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 32, 
                backgroundColor: '#18181b', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <HugeiconsIcon icon={Calendar02Icon} size={32} color="#3f3f46" />
              </View>
              <Text style={{ color: '#a1a1aa', fontSize: 16, fontWeight: '600' }}>No tasks for this day</Text>
              <Text style={{ color: '#52525b', fontSize: 13, marginTop: 4 }}>Enjoy your free time!</Text>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


