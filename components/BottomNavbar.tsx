import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Animated, { interpolateColor, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Target01Icon,
  Time01Icon,
  MoreHorizontalIcon,
  Settings03Icon,
  CalendarFavorite02Icon,
  Grid02Icon,
  Search01Icon,
  Timer01Icon
} from '@hugeicons/core-free-icons';
import { useTabStore } from '@/store/useTabStore';

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

interface BottomNavbarProps {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  expansion?: SharedValue<number>;
  hideExtension?: boolean;
}

export const BottomNavbar = ({ 
  isExpanded = false, 
  onToggleExpanded, 
  expansion,
  hideExtension = false 
}: BottomNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { tabs, maxTabs } = useTabStore();
  
  const enabledTabs = tabs.filter(t => t.enabled);
  const mainTabs = enabledTabs.slice(0, maxTabs - 1);
  
  const tabWidth = `${100 / maxTabs}%`;

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: '#0a0a0a',
    };
  });

  return (
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
      {mainTabs.map((tab, index) => {
        const routes = ['/', '/calendar', '/habits', '/focus'];
        const isFocused = pathname === routes[index];
        
        return (
          <View key={tab.id} style={{ width: tabWidth as any, alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => !hideExtension && router.push(routes[index] as any)}
              disabled={hideExtension}
            >
              <CustomTabIcon icon={ICON_MAP[tab.iconName]} focused={isFocused} label={tab.title} />
            </TouchableOpacity>
          </View>
        );
      })}

      {/* More Button */}
      <View style={{ width: tabWidth as any, alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={onToggleExpanded}
          activeOpacity={0.7}
          disabled={hideExtension}
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
  );
};
