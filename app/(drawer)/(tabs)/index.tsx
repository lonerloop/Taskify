import { TaskItem } from '@/components/TaskItem';
import { TaskInfoModal } from '@/components/TaskInfoModal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTaskStore } from '@/store/useTaskStore';
import {
  ArrowRight01Icon,
  Menu01Icon,
  MoreVerticalIcon
} from '@hugeicons/core-free-icons';
import {
  HugeiconsIcon
} from '@hugeicons/react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '@/store/useTaskStore';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GroupCardProps {
  item: any;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onTaskPress: (task: Task) => void;
}

const GroupCard = ({ item, isExpanded, onToggle, onTaskPress }: GroupCardProps) => {
  // Smooth icon rotation (Fast & Smooth, not springy)
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: withTiming(isExpanded ? '90deg' : '0deg', { duration: 120, easing: Easing.out(Easing.quad) }) }]
    };
  });

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
      style={{ backgroundColor: '#1a1a1a', borderRadius: 15, paddingVertical: 14, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(item.id)}
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: isExpanded ? 12 : 0 }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>{item.title.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.isOverdue ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '600', marginRight: 8 }}>Postpone</Text>
              <Text style={{ color: '#52525b', fontSize: 14, fontWeight: '600', marginRight: 8 }}>{item.tasks.length}</Text>
              <Animated.View style={animatedIconStyle}>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#52525b" />
              </Animated.View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#52525b', fontSize: 14, fontWeight: '600', marginRight: 8 }}>{item.tasks.length}</Text>
              <Animated.View style={animatedIconStyle}>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#52525b" />
              </Animated.View>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View entering={FadeIn.duration(120)} exiting={FadeOut.duration(100)}>
          {item.tasks.map((task: any) => <TaskItem key={task.id} task={task} onPress={onTaskPress} />)}
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default function TasksScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigation = useNavigation();
  const { tasks, selectedListId, lists } = useTaskStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    overdue: true,
    todo: true,
    tomorrow: true,
    later: true,
    completed: false
  });
  const [selectedTaskIdForInfo, setSelectedTaskIdForInfo] = useState<string | null>(null);
  const [isTaskInfoVisible, setIsTaskInfoVisible] = useState(false);

  const currentList = lists.find(l => l.id === selectedListId) || { name: 'Tasks' };
  const filteredTasks = tasks.filter(t => t.list_id === selectedListId);

  // Priority weights
  const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 };

  // Sort tasks by priority within each group
  const sortTasks = (tasks: any[]) => [...tasks].sort((a, b) => 
      (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
  );

  // Logic for grouping
  const overdueTasks = sortTasks(filteredTasks.filter(t => !t.completed && t.due_date === 'Yesterday'));
  const todayTasks = sortTasks(filteredTasks.filter(t => !t.completed && (t.due_date === 'Today' || !t.due_date)));
  const tomorrowTasks = sortTasks(filteredTasks.filter(t => !t.completed && t.due_date === 'Tomorrow'));
  const laterTasks = sortTasks(filteredTasks.filter(t => !t.completed && t.due_date !== 'Today' && t.due_date !== 'Tomorrow' && t.due_date !== 'Yesterday' && t.due_date));
  const completedTasks = sortTasks(filteredTasks.filter(t => t.completed));

  const sections = [];
  if (overdueTasks.length > 0) {
    sections.push({ id: 'overdue', title: 'OVERDUE', tasks: overdueTasks, isOverdue: true });
  }
  if (todayTasks.length > 0) {
    sections.push({ id: 'todo', title: 'TODAY', tasks: todayTasks, isOverdue: false });
  }
  if (tomorrowTasks.length > 0) {
    sections.push({ id: 'tomorrow', title: 'TOMORROW', tasks: tomorrowTasks, isOverdue: false });
  }
  if (laterTasks.length > 0) {
    sections.push({ id: 'later', title: 'LATER', tasks: laterTasks, isOverdue: false });
  }
  if (completedTasks.length > 0) {
    sections.push({ id: 'completed', title: 'COMPLETED', tasks: completedTasks, isOverdue: false });
  }

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTaskIdForInfo(task.id);
    setIsTaskInfoVisible(true);
  };

  const renderHeader = () => (
    <View
      style={{
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'black'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <HugeiconsIcon icon={Menu01Icon} size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', letterSpacing: -0.5, marginLeft: 4 }}>
          {currentList.name}
        </Text>
      </View>
      <View style={{ width: '20%', alignItems: 'center' }}>
        <TouchableOpacity>
          <HugeiconsIcon icon={MoreVerticalIcon} size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {renderHeader()}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {sections.length > 0 ? (
            sections.map(section => (
              <GroupCard
                key={section.id}
                item={section}
                isExpanded={expandedGroups[section.id] !== false}
                onToggle={toggleGroup}
                onTaskPress={handleTaskPress}
              />
            ))
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
              <Image
                source={{ uri: 'file:///C:/Users/conta/.gemini/antigravity/brain/3d2a0b34-6bb8-4e3c-aa88-67b8f6c8a3db/empty_state_moon_illustration_1773844585386.png' }}
                style={{ width: 320, height: 320, marginBottom: -10 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 12 }}>No tasks today</Text>
              <Text style={{ fontSize: 18, fontWeight: '500', color: '#71717a' }}>It's late, rest early</Text>
            </View>
          )}
        </ScrollView>
        <TaskInfoModal 
          isVisible={isTaskInfoVisible} 
          onClose={() => setIsTaskInfoVisible(false)} 
          taskId={selectedTaskIdForInfo} 
        />
      </SafeAreaView>
    </View>
  );
}


