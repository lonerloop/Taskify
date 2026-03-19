import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  Search01Icon,
  MoreVerticalIcon,
  Menu01Icon,
  Time01Icon
} from '@hugeicons/core-free-icons';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskModal } from '@/components/AddTaskModal';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'react-native';

export default function TasksScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigation = useNavigation();
  const { tasks, selectedListId, lists } = useTaskStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentList = lists.find(l => l.id === selectedListId) || { name: 'Tasks' };
  const filteredTasks = tasks.filter(t => t.list_id === selectedListId);

  const renderHeader = () => (
    <View 
      style={{ 
        paddingTop: 8, 
        paddingBottom: 24, 
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
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskItem task={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -100 }}>
              <Image 
                source={{ uri: 'file:///C:/Users/conta/.gemini/antigravity/brain/3d2a0b34-6bb8-4e3c-aa88-67b8f6c8a3db/empty_state_moon_illustration_1773844585386.png' }}
                style={{ width: 320, height: 320, marginBottom: -10 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 12 }}>No tasks today</Text>
              <Text style={{ fontSize: 18, fontWeight: '500', color: '#71717a' }}>It's late, rest early</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

