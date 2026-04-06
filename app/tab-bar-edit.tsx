import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { 
  HugeiconsIcon 
} from '@hugeicons/react-native';
import { 
  ArrowLeft01Icon,
  RemoveSquareIcon,
  AddSquareIcon,
  MoveToIcon,
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Timer01Icon,
  Target01Icon,
  CalendarFavorite02Icon,
  Settings03Icon,
  Search01Icon,
  Time01Icon,
  Grid02Icon
} from '@hugeicons/core-free-icons';
import { useTabStore, TabItem } from '@/store/useTabStore';

const ICON_MAP: Record<string, any> = {
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Timer01Icon,
  Target01Icon,
  CalendarFavorite02Icon,
  Settings03Icon,
  Search01Icon,
  Time01Icon,
  Grid02Icon
};

export default function TabBarEditScreen() {
  const router = useRouter();
  const { tabs, enableTab, disableTab } = useTabStore();

  const enabledTabs = tabs.filter(t => t.enabled);
  const disabledTabs = tabs.filter(t => !t.enabled);

  const renderItem = (item: TabItem, isEnabled: boolean) => {
    const isLast = item.id === (isEnabled ? enabledTabs[enabledTabs.length - 1].id : disabledTabs[disabledTabs.length - 1].id);
    
    return (
      <Animated.View 
        key={item.id} 
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(150)}
        layout={LinearTransition.duration(200)}
        style={{
          width: '100%',
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <TouchableOpacity 
            onPress={() => isEnabled ? disableTab(item.id) : enableTab(item.id)}
            style={{ marginRight: 14 }}
          >
            <HugeiconsIcon 
              icon={isEnabled ? RemoveSquareIcon : AddSquareIcon} 
              size={20} 
              color={isEnabled ? '#ef4444' : '#10b981'} 
            />
          </TouchableOpacity>

          <View style={{ marginRight: 14, padding: 6, backgroundColor: '#27272a', borderRadius: 10 }}>
            <HugeiconsIcon icon={ICON_MAP[item.iconName] || Search01Icon} size={22} color="white" />
          </View>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{item.title}</Text>
            <Text 
              style={{ color: '#71717a', fontSize: 11, marginTop: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          </View>

          <View style={{ marginLeft: 14 }}>
            <HugeiconsIcon icon={MoveToIcon} size={20} color="#3f3f46" />
          </View>
        </View>
        
        {!isLast && (
          <View style={{ 
            height: 1, 
            backgroundColor: '#18181b', 
            marginHorizontal: 25 
          }} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Tab Bar</Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
          {/* Enabled Section */}
          <View style={{ backgroundColor: '#121212', borderRadius: 15, overflow: 'hidden', marginBottom: 24 }}>
            {enabledTabs.map(tab => renderItem(tab, true))}
          </View>

          {/* Disabled Section */}
          {disabledTabs.length > 0 && (
            <View>
              <Text style={{ color: '#52525b', fontWeight: 'bold', marginBottom: 12, marginLeft: 12, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5 }}>DISABLED</Text>
              <View style={{ backgroundColor: '#121212', borderRadius: 15, overflow: 'hidden', marginBottom: 32 }}>
                {disabledTabs.map(tab => renderItem(tab, false))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

