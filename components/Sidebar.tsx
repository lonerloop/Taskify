import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  InboxIcon,
  Calendar01Icon,
  Add01Icon,
  LabelIcon,
  Settings03Icon
} from '@hugeicons/core-free-icons';
import { useTaskStore } from '@/store/useTaskStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function Sidebar() {
  const colorScheme = useColorScheme() ?? 'light';
  const { lists, tasks, selectedListId, setSelectedListId } = useTaskStore();
  const router = useRouter();
  const navigation = useNavigation();

  const handleListSelect = (id: string) => {
    setSelectedListId(id);
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const MenuItem = ({ label, count, onPress, id }: any) => {
    const isActive = selectedListId === id;
    
    return (
      <TouchableOpacity 
        onPress={onPress}
        className={`flex-row items-center px-4 py-3 mx-2 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        <Text className={`flex-1 text-base font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'dark:text-white'}`}>
          {label}
        </Text>
        {count !== undefined && (
          <Text className={`text-sm font-medium ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>{count}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold dark:text-white tracking-tight">Taskify</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="mb-6">
          <MenuItem 
            id="inbox" 
            label="Inbox" 
            count={tasks.filter(t => t.list_id === 'inbox').length} 
            onPress={() => handleListSelect('inbox')}
          />
          <MenuItem 
            id="today" 
            label="Today" 
            count={tasks.filter(t => t.list_id === 'today').length} 
            onPress={() => handleListSelect('today')}
          />
        </View>

        <View className="px-6 mb-2 flex-row items-center justify-between">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lists</Text>
          <TouchableOpacity>
            <Text className="text-xs font-bold text-blue-500">+ NEW</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          {lists.filter(l => l.id !== 'inbox' && l.id !== 'today').map((list) => (
            <MenuItem 
              key={list.id} 
              id={list.id}
              label={list.name} 
              count={tasks.filter(t => t.list_id === list.id).length}
              onPress={() => handleListSelect(list.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="p-4 border-t border-slate-100 dark:border-slate-800">
        <MenuItem 
          label="Settings" 
          onPress={() => router.push('/settings')} 
        />
      </View>
    </SafeAreaView>
  );
}

