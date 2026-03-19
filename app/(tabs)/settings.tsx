import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  UserCircleIcon, 
  Notification01Icon, 
  Shield01Icon, 
  Settings03Icon, 
  InformationCircleIcon, 
  ArrowRight01Icon, 
  Logout01Icon 
} from '@hugeicons/core-free-icons';

export default function MoreScreen() {
  const MenuItem = ({ label, color = "#64748b" }: any) => (
    <TouchableOpacity className="flex-row items-center py-4 border-b border-slate-50 dark:border-slate-900">
      <Text className="flex-1 text-base font-medium dark:text-white">{label}</Text>
      <Text className="text-slate-300 font-bold ml-2">{">"}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <ScrollView className="px-6">
        <View className="py-8">
          <Text className="text-3xl font-bold dark:text-white">Settings</Text>
          <Text className="text-slate-500">Manage your account and app</Text>
        </View>

        <View className="mb-8">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Account</Text>
          <MenuItem icon={UserCircleIcon} label="Profile" color="#3b82f6" />
          <MenuItem icon={Notification01Icon} label="Notifications" color="#ef4444" />
        </View>

        <View className="mb-8">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">App Settings</Text>
          <MenuItem icon={Shield01Icon} label="Privacy & Security" color="#10b981" />
          <MenuItem icon={Settings03Icon} label="General Settings" color="#64748b" />
          <MenuItem icon={InformationCircleIcon} label="About TickTick" color="#8b5cf6" />
        </View>

        <TouchableOpacity className="flex-row items-center py-4 mt-4">
          <HugeiconsIcon icon={Logout01Icon} size={20} color="#ef4444" />
          <Text className="ml-4 text-base font-bold text-red-500">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


