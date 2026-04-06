import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Platform, BackHandler, TouchableWithoutFeedback } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
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
  Add01Icon
} from '@hugeicons/core-free-icons';
import { AddTaskModal } from '@/components/AddTaskModal';

const CustomTabIcon = ({ 
  icon, 
  focused, 
  label 
}: { 
  icon: any; 
  focused: boolean; 
  label: string 
}) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <HugeiconsIcon 
        icon={icon} 
        size={28} 
        color={focused ? '#3b82f6' : '#71717a'} 
      />
      {focused && (
        <View style={{ position: 'absolute', bottom: -1, width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6' }} />
      )}
    </View>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const expansion = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const toggleExpanded = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    expansion.value = withSpring(nextState ? 1 : 0, {
      damping: 38, 
      stiffness: 350, // Ultra-snappy "Good Fast" motion
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

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        expansion.value,
        [0, 1],
        ['transparent', '#0a0a0a']
      ),
    };
  });

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

      {/* Backdrop for Expanded Tools - Click outside to close */}
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

      {/* Expanded Tools Panel - Definitive 100px drawer with extra clearance */}
      <Animated.View style={[animatedContentStyle, { height: 100, justifyContent: 'space-between', paddingVertical: 12 }]}>
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ color: '#52525b', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>MORE</Text>
          <TouchableOpacity>
            <Text style={{ color: '#3b82f6', fontSize: 13, fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Icons Row - Surgically aligned grid, balanced clearance */}
        <View style={{ 
          flexDirection: 'row', 
          width: '100%',
          paddingBottom: 8
        }}>
          {/* Slot 1: Aligned exactly with Tasks */}
          <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity className="p-2" onPress={() => {/* Navigate */}}>
              <HugeiconsIcon icon={CalendarFavorite02Icon} size={28} color="#71717a" />
            </TouchableOpacity>
          </View>
          
          {/* Slot 2: Aligned exactly with Calendar */}
          <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity className="p-2" onPress={() => {/* Navigate */}}>
              <HugeiconsIcon icon={Settings03Icon} size={28} color="#71717a" />
            </TouchableOpacity>
          </View>
          
          {/* Slots 3, 4, 5: Empty Placeholders */}
          <View style={{ width: '20%' }} />
          <View style={{ width: '20%' }} />
          <View style={{ width: '20%' }} />
        </View>

        {/* Floating Separator */}
        <View style={{ 
          height: 1, 
          backgroundColor: '#18181b',
          marginHorizontal: 25,
          marginTop: 4
        }} />
      </Animated.View>

      {/* Fixed Bottom Tab Bar - Identical 20% slot grid */}
      <Animated.View style={[animatedTabBarStyle, { 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 74,
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingBottom: 15,
        zIndex: 100,
      }]}>
        {/* Slot 1: Tasks */}
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <CustomTabIcon icon={CheckmarkSquare02Icon} focused={true} label="Tasks" />
          </TouchableOpacity>
        </View>

        {/* Slot 2: Calendar */}
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/calendar')}>
            <CustomTabIcon icon={Calendar02Icon} focused={false} label="Calendar" />
          </TouchableOpacity>
        </View>

        {/* Slot 3: Habits */}
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/habits')}>
            <CustomTabIcon icon={Target01Icon} focused={false} label="Habits" />
          </TouchableOpacity>
        </View>

        {/* Slot 4: Focus */}
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/focus')}>
            <CustomTabIcon icon={Time01Icon} focused={false} label="Focus" />
          </TouchableOpacity>
        </View>

        {/* Slot 5: More */}
        <View style={{ width: '20%', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={toggleExpanded}
            activeOpacity={0.7}
          >
            <View className="p-2">
              <HugeiconsIcon 
                icon={MoreHorizontalIcon} 
                size={28} 
                color={isExpanded ? '#3b82f6' : '#71717a'} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Floating Action Button (FAB) - Restored for empty state reference */}
      <TouchableOpacity 
        activeOpacity={0.6}
        onLongPress={() => {}} // dummy for ripple
        onPressIn={() => {
          fabScale.value = withSpring(0.82, { damping: 12, stiffness: 400 });
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, { damping: 12, stiffness: 400 });
        }}
        onPress={() => setIsAddTaskVisible(true)}
        style={{ 
          position: 'absolute', 
          bottom: 100, 
          right: 20, 
          zIndex: 1000,
          opacity: isExpanded ? 0 : 1,
          pointerEvents: isExpanded ? 'none' : 'auto'
        }}
      >
        <Animated.View style={[{
          width: 56, 
          height: 56, 
          backgroundColor: '#3b82f6', 
          borderRadius: 28, 
          alignItems: 'center', 
          justifyContent: 'center',
          transform: [{ scale: fabScale }]
        }]}>
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
