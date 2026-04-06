import React, { useState, useEffect } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, Platform, BackHandler, TouchableWithoutFeedback } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate,
  interpolateColor,
  Extrapolate,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Target01Icon,
  Time01Icon,
  MoreHorizontalIcon,
  Settings03Icon,
  CalendarFavorite02Icon,
  Add01Icon,
  Search01Icon,
  Timer01Icon,
  Grid02Icon
} from '@hugeicons/core-free-icons';
import { AddTaskModal } from '@/components/AddTaskModal';
import { useTabStore } from '@/store/useTabStore';
import { BottomNavbar } from '@/components/BottomNavbar';

const ICON_MAP: Record<string, any> = {
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Target01Icon,
  Time01Icon,
  Settings03Icon,
  CalendarFavorite02Icon,
  Grid02Icon,
  Search01Icon,
  Timer01Icon
};

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const expansion = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const { tabs, maxTabs } = useTabStore();
  const enabledTabs = tabs.filter(t => t.enabled);
  
  // Cutoff is maxTabs - 1 to account for the "More" button
  const mainTabs = enabledTabs.slice(0, maxTabs - 1);
  const moreTabs = enabledTabs.slice(maxTabs - 1);

  const toggleExpanded = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    expansion.value = withSpring(nextState ? 1 : 0, {
      damping: 38, 
      stiffness: 350,
      overshootClamping: true,
    });
  };

  useEffect(() => {
    const backAction = () => {
      if (isExpanded) {
        toggleExpanded();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [isExpanded]);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            expansion.value,
            [0, 1],
            [100, 0]
          ),
        },
      ],
      opacity: expansion.value,
      display: expansion.value > 0 ? 'flex' : 'none',
      position: 'absolute',
      bottom: 74,
      left: 0,
      right: 0,
      backgroundColor: '#0a0a0a',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      padding: 0,
      zIndex: 90,
    };
  });

  const animatedFabStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isExpanded ? 0 : 1, { duration: 200 }) }
      ],
      opacity: withTiming(isExpanded ? 0 : 1, { duration: 200 })
    };
  }, [isExpanded]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Tasks' }} />
        <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
        <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
        <Tabs.Screen name="focus" options={{ title: 'Focus' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>

      {/* Backdrop for Expanded Tools */}
      {isExpanded && (
        <TouchableWithoutFeedback onPress={toggleExpanded}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 80,
            }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Expanded Tools Panel */}
      <Animated.View style={[animatedContentStyle, { height: moreTabs.length > 4 ? 200 : 100, justifyContent: 'space-between', paddingVertical: 12 }]}>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: '#52525b', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>MORE</Text>
          <TouchableOpacity onPress={() => { toggleExpanded(); router.push('/tab-bar-edit'); }}>
            <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Icons Grid */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap',
          width: '100%',
          paddingBottom: 8
        }}>
          {moreTabs.map((tab) => (
            <View key={tab.id} style={{ width: '20%', alignItems: 'center', justifyContent: 'center', marginVertical: 8 }}>
              <TouchableOpacity className="p-2" onPress={() => toggleExpanded()}>
                <HugeiconsIcon icon={ICON_MAP[tab.iconName] || Search01Icon} size={28} color="#71717a" />
              </TouchableOpacity>
            </View>
          ))}
          {moreTabs.length === 0 && (
            <View style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ color: '#3f3f46', fontSize: 12 }}>No more items</Text>
            </View>
          )}
        </View>

        {/* Floating Separator */}
        <View style={{ 
          height: 1, 
          backgroundColor: '#18181b',
          marginHorizontal: 25,
          marginTop: 4
        }} />
      </Animated.View>

      {/* Fixed Bottom Tab Bar */}
      <BottomNavbar 
        isExpanded={isExpanded}
        onToggleExpanded={toggleExpanded}
        expansion={expansion}
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setIsAddTaskVisible(true)}
        style={{ 
          position: 'absolute', 
          bottom: 100, 
          right: 20, 
          zIndex: 1000,
          pointerEvents: isExpanded ? 'none' : 'auto'
        }}
      >
        <Animated.View 
          style={[
            {
              width: 56, 
              height: 56, 
              backgroundColor: '#3b82f6', 
              borderRadius: 28, 
              alignItems: 'center', 
              justifyContent: 'center',
            },
            animatedFabStyle
          ]}
        >
          <HugeiconsIcon icon={Add01Icon} size={32} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>

      <AddTaskModal 
        isVisible={isAddTaskVisible} 
        onClose={() => setIsAddTaskVisible(false)} 
      />
    </View>
  );
}
