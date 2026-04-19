import { BottomNavbar } from '@/components/BottomNavbar';
import { TabItem, useTabStore } from '@/store/useTabStore';
import {
  AddSquareIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Calendar02Icon,
  CalendarFavorite02Icon,
  CheckmarkSquare02Icon,
  DragDropVerticalIcon,
  Grid02Icon,
  RemoveSquareIcon,
  Search01Icon,
  Settings03Icon,
  Target01Icon,
  Timer01Icon
} from '@hugeicons/core-free-icons';
import {
  HugeiconsIcon
} from '@hugeicons/react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  FadeInUp,
  FadeOutDown,
  LinearTransition,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_MAP: Record<string, any> = {
  CheckmarkSquare02Icon,
  Calendar02Icon,
  Timer01Icon,
  Target01Icon,
  CalendarFavorite02Icon,
  Settings03Icon,
  Search01Icon,
  Grid02Icon
};

// Magnetic Docking Motion (Fast arrival, silky settle)
const MAGNETIC_DOCKING_EASING = Easing.out(Easing.poly(4));
const HEAVY_LIQUID = LinearTransition.duration(400).easing(MAGNETIC_DOCKING_EASING);
const ITEM_HEIGHT = 72;

interface DraggableTabItemProps {
  item: TabItem;
  isEnabled: boolean;
  index: number;
  group: TabItem[];
  tabs: TabItem[];
  moveTab: (from: number, to: number) => void;
  enableTab: (id: string) => void;
  disableTab: (id: string) => void;
  isLast: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: (from: number, to: number) => void;
  activeDragId: string | null;
  // Shared Position Map Context
  positions: SharedValue<Record<string, number>>;
}


const PICKER_ITEM_HEIGHT = 48;

const PickerItem = React.memo(({ item, index, scrollY }: { item: string, index: number, scrollY: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const range = [(index - 2) * PICKER_ITEM_HEIGHT, (index - 1) * PICKER_ITEM_HEIGHT, index * PICKER_ITEM_HEIGHT];

    const opacity = interpolate(
      scrollY.value,
      range,
      [0.3, 1, 0.3],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      range,
      [0.8, 1.1, 0.8],
      Extrapolate.CLAMP
    );

    const rotateX = interpolate(
      scrollY.value,
      range,
      [50, 0, -50],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      range,
      [10, 0, -10],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateX: `${rotateX}deg` },
        { translateY }
      ]
    };
  });

  return (
    <Animated.View style={[{ height: PICKER_ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Text style={{
        color: 'white',
        fontSize: 24,
        fontWeight: '700'
      }}>
        {item}
      </Text>
    </Animated.View>
  );
});
PickerItem.displayName = 'PickerItem';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const PickerColumn = React.memo(({ data, selectedValue, onValueChange }: { data: string[], selectedValue: string, onValueChange: (val: string) => void }) => {
  const scrollY = useSharedValue(0);
  const lastIndex = useSharedValue(-1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const index = Math.round(event.contentOffset.y / PICKER_ITEM_HEIGHT);
      if (index !== lastIndex.value) {
        lastIndex.value = index;
        runOnJS(Haptics.selectionAsync)();
      }
    },
  });

  const initialIndex = data.indexOf(selectedValue);
  const fullData = ['', ...data, ''];

  return (
    <View style={{ height: PICKER_ITEM_HEIGHT * 3, width: 80, overflow: 'hidden' }}>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: PICKER_ITEM_HEIGHT * 0.8,
        backgroundColor: '#1c1c1e',
        opacity: 0.8,
        zIndex: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.05)'
      }} pointerEvents="none" />
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: PICKER_ITEM_HEIGHT * 0.8,
        backgroundColor: '#1c1c1e',
        opacity: 0.8,
        zIndex: 10,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255,255,255,0.05)'
      }} pointerEvents="none" />

      <AnimatedFlatList
        data={fullData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }: any) => (
          <PickerItem item={item as string} index={index} scrollY={scrollY} />
        )}
        showsVerticalScrollIndicator={false}
        snapToInterval={PICKER_ITEM_HEIGHT}
        disableIntervalMomentum={true}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
        getItemLayout={(_, index) => ({
          length: PICKER_ITEM_HEIGHT,
          offset: PICKER_ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT);
          if (data[index]) onValueChange(data[index]);
        }}
      />
    </View>
  );
});
PickerColumn.displayName = 'PickerColumn';

function TabCountPickerPopup({ isVisible, onClose, onConfirm, initialValue }: { isVisible: boolean, onClose: () => void, onConfirm: (val: number) => void, initialValue: number }) {
  const [selectedVal, setSelectedVal] = useState(initialValue.toString());
  const data = ['3', '4', '5'];

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={onClose}
        />
        <GestureHandlerRootView style={{ width: '75%' }}>
          <View style={{ backgroundColor: '#1c1c1e', width: '100%', borderRadius: 24, padding: 24 }}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 24 }}>Max Tabs</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 30 }}>
              <PickerColumn data={data} selectedValue={selectedVal} onValueChange={setSelectedVal} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ color: '#71717a', fontSize: 17, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onConfirm(parseInt(selectedVal))}>
                <Text style={{ color: '#3b82f6', fontSize: 17, fontWeight: '700' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GestureHandlerRootView>
      </View>
    </Modal>
  );
}

const DraggableTabItem = React.memo(({
  item,
  isEnabled,
  index,
  group,
  tabs,
  moveTab,
  enableTab,
  disableTab,
  isLast,
  onDragStart,
  onDragEnd,
  activeDragId,
  positions
}: DraggableTabItemProps) => {
  const isDragging = activeDragId === item.id;
  const selfTranslationY = useSharedValue(0);
  const startLocalIndex = useSharedValue(0);
  const currentSlot = useSharedValue(index);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const gesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .minDistance(10)
    .onStart(() => {
      startLocalIndex.value = index;
      currentSlot.value = index;
      runOnJS(onDragStart)(item.id);
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      selfTranslationY.value = event.translationY;

      // ABSOLUTE SLOT TARGETING:
      // Calculate where the center of the dragged item is relative to the list top
      // (index * 72) is the item's original top.
      const fingerListCenterY = (index * ITEM_HEIGHT) + (ITEM_HEIGHT / 2) + event.translationY;

      // Determine target slot by absolute grid boundary (snappy/discrete)
      const targetSlot = Math.max(0, Math.min(
        Math.floor(fingerListCenterY / ITEM_HEIGHT),
        group.length - 1
      ));

      const newPositions = { ...positions.value };
      const currentMappedIndex = newPositions[item.id];

      if (targetSlot !== currentMappedIndex) {
        // Trigger haptic ONLY on discrete slot crossing
        runOnJS(triggerHaptic)();

        // Logical swap: update ALL item positions based on the new slot
        Object.keys(newPositions).forEach(id => {
          if (id === item.id) return;
          const pos = newPositions[id];
          if (currentMappedIndex < targetSlot) {
            // Dragging down: move items between old and new slot UP
            if (pos > currentMappedIndex && pos <= targetSlot) {
              newPositions[id] = pos - 1;
            }
          } else {
            // Dragging up: move items between old and new slot DOWN
            if (pos < currentMappedIndex && pos >= targetSlot) {
              newPositions[id] = pos + 1;
            }
          }
        });

        newPositions[item.id] = targetSlot;
        positions.value = newPositions;
        currentSlot.value = targetSlot;
      }
    })
    .onFinalize((event) => {
      // Finger center calculation for final drop
      const fingerListCenterY = (index * ITEM_HEIGHT) + (ITEM_HEIGHT / 2) + event.translationY;
      const targetSlot = Math.max(0, Math.min(Math.floor(fingerListCenterY / ITEM_HEIGHT), group.length - 1));

      const fromGlobal = tabs.findIndex(t => t.id === item.id);
      const toGlobal = tabs.findIndex(t => t.id === group[targetSlot].id);

      const targetBaseOffset = (targetSlot - index) * ITEM_HEIGHT;

      // Final viscous glide to SET home
      selfTranslationY.value = withTiming(targetBaseOffset, { duration: 350, easing: MAGNETIC_DOCKING_EASING });

      runOnJS(onDragEnd)(fromGlobal, toGlobal);
      runOnJS(triggerHaptic)();
    });

  // HOVER LAYER (Locked to Absolute Finger Position)
  const hoverCardStyle = useAnimatedStyle(() => {
    // Relative to item's original render spot
    const y = isDragging ? selfTranslationY.value : 0;

    return {
      transform: [
        { translateY: y },
        { scale: withTiming(isDragging ? 1.07 : 1, { duration: 250 }) }
      ],
      backgroundColor: withTiming(isDragging ? '#1a1a1a' : '#121212', { duration: 250 }),
      zIndex: isDragging ? 20000 : 1,
      opacity: withTiming(isDragging ? 0.98 : 1, { duration: 250 }),
    };
  });

  const hoverCardContainerStyle = useAnimatedStyle(() => {
    return {
      elevation: isDragging ? 15 : 0,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: withTiming(isDragging ? 0.5 : 0, { duration: 250 }),
      shadowRadius: withTiming(isDragging ? 25 : 0, { duration: 250 }),
    };
  });

  // GHOST SLOT (Snaps Decisively to Grid Slots)
  const ghostSlotStyle = useAnimatedStyle(() => {
    const currentMappedPos = positions.value[item.id] ?? index;
    const baseOffset = (currentMappedPos - index) * ITEM_HEIGHT;

    return {
      transform: [{ translateY: withTiming(baseOffset, { duration: 350, easing: MAGNETIC_DOCKING_EASING }) }],
      opacity: isDragging ? 0.45 : 0,
      borderColor: withTiming(isDragging ? '#4b5563' : 'transparent', { duration: 200 })
    };
  });

  // Neighbors Shift logic (Silky scale shrink + Decisive move)
  const neighborShiftStyle = useAnimatedStyle(() => {
    const currentMappedPos = positions.value[item.id] ?? index;
    const isMoving = currentMappedPos !== index;
    const baseOffset = (currentMappedPos - index) * ITEM_HEIGHT;

    return {
      transform: [
        { translateY: withTiming(baseOffset, { duration: 400, easing: MAGNETIC_DOCKING_EASING }) },
        { scale: withTiming(isMoving ? 0.98 : 1, { duration: 300 }) } // Yielding effect
      ],
    };
  });

  const iconOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDragging ? 0 : 1, { duration: 350 }),
      transform: [{ scale: withTiming(isDragging ? 0.6 : 1, { duration: 300 }) }]
    };
  });

  return (
    <View style={{ height: ITEM_HEIGHT, width: '100%', zIndex: isDragging ? 20000 : 1 }}>
      {/* GHOST DROP ZONE (Fixed Grid Snapping) */}
      {isDragging && (
        <Animated.View
          style={[ghostSlotStyle, {
            position: 'absolute',
            width: '100%',
            height: ITEM_HEIGHT - 6,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: '#161618',
            borderStyle: 'dashed',
            zIndex: 1,
            pointerEvents: 'none'
          }]}
        />
      )}

      {/* DRAGGABLE MAIN CARD */}
      <Animated.View
        layout={isDragging ? undefined : HEAVY_LIQUID}
        style={[
          isDragging ? hoverCardContainerStyle : neighborShiftStyle,
          { width: '100%', zIndex: isDragging ? 20000 : 2, height: ITEM_HEIGHT }
        ]}
      >
        <Animated.View style={[hoverCardStyle, { width: '100%', borderRadius: 15, overflow: 'hidden' }]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            height: '100%',
          }}>
            <Animated.View style={iconOpacityStyle}>
              <TouchableOpacity
                onPress={() => isEnabled ? disableTab(item.id) : enableTab(item.id)}
                style={{ padding: 10, marginRight: 8 }}
              >
                <HugeiconsIcon
                  icon={isEnabled ? RemoveSquareIcon : AddSquareIcon}
                  size={22}
                  color={isEnabled ? '#ef4444' : '#10b981'}
                />
              </TouchableOpacity>
            </Animated.View>

            <View style={{ marginRight: 16, padding: 8, backgroundColor: '#27272a', borderRadius: 12 }}>
              <HugeiconsIcon icon={ICON_MAP[item.iconName] || Search01Icon} size={24} color="white" />
            </View>

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{item.title}</Text>
              <Text
                style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.description}
              </Text>
            </View>

            <GestureDetector gesture={gesture}>
              <View style={{ paddingVertical: 20, paddingHorizontal: 15 }}>
                <HugeiconsIcon icon={DragDropVerticalIcon} size={24} color={isDragging ? '#3b82f6' : '#3f3f46'} />
              </View>
            </GestureDetector>
          </View>
        </Animated.View>
      </Animated.View>

    </View>
  );
});
DraggableTabItem.displayName = 'DraggableTabItem';

export default function TabBarEditScreen() {
  const router = useRouter();
  const { tabs, enableTab, disableTab, moveTab, maxTabs, setMaxTabs } = useTabStore();

  const enabledTabs = tabs.filter(t => t.enabled);
  const disabledTabs = tabs.filter(t => !t.enabled);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // High-fidelity Position Map (id -> slot_index)
  const positions = useSharedValue<Record<string, number>>({});

  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Reset positions maps on content load/change
  useEffect(() => {
    const newPositions: Record<string, number> = {};
    enabledTabs.forEach((tab, index) => {
      newPositions[tab.id] = index;
    });
    disabledTabs.forEach((tab, index) => {
      newPositions[tab.id] = index;
    });
    positions.value = newPositions;
  }, [tabs.length, enabledTabs.length]);

  const handleDragStart = useCallback((id: string) => {
    setActiveDragId(id);
  }, []);

  const handleDragEnd = useCallback((from: number, to: number) => {
    if (from !== to) {
      moveTab(from, to);
    }
    setActiveDragId(null);
  }, [moveTab]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Tab Bar</Text>
        </View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!activeDragId}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Max Tabs Card */}
          <View style={{ marginBottom: 24, marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setIsPickerVisible(true);
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              activeOpacity={0.7}
              style={{
                backgroundColor: '#121212',
                borderRadius: 15,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Max number of tabs</Text>
                <Text style={{ color: '#71717a', fontSize: 12, marginTop: 2 }}>Limit visible icons in the navbar</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#27272a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 16, marginRight: 6 }}>{maxTabs}</Text>
                <HugeiconsIcon icon={ArrowDown01Icon} size={16} color="#3b82f6" />
              </View>
            </TouchableOpacity>
          </View>

          <TabCountPickerPopup
            isVisible={isPickerVisible}
            onClose={() => setIsPickerVisible(false)}
            initialValue={maxTabs}
            onConfirm={(val) => {
              setMaxTabs(val);
              setIsPickerVisible(false);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }}
          />

          <View style={{ width: '100%' }}>
            {/* ACTIVE Section */}
            <View>
              <Text style={{ color: '#52525b', fontWeight: 'bold', marginBottom: 16, marginLeft: 16, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5 }}>ACTIVE</Text>
              <View style={{ backgroundColor: '#121212', borderRadius: 15, overflow: 'hidden', marginBottom: 24 }}>
                {enabledTabs.map((tab, idx) => (
                  <DraggableTabItem
                    key={tab.id}
                    item={tab}
                    isEnabled={true}
                    index={idx}
                    group={enabledTabs}
                    tabs={tabs}
                    moveTab={moveTab}
                    enableTab={enableTab}
                    disableTab={disableTab}
                    isLast={idx === enabledTabs.length - 1}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    activeDragId={activeDragId}
                    positions={positions}
                  />
                ))}
              </View>
            </View>

            {/* DISABLED Section */}
            {disabledTabs.length > 0 ? (
              <Animated.View layout={HEAVY_LIQUID} entering={FadeInUp} exiting={FadeOutDown}>
                <Text style={{ color: '#52525b', fontWeight: 'bold', marginBottom: 16, marginLeft: 16, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.5 }}>DISABLED</Text>
                <View style={{ backgroundColor: '#121212', borderRadius: 15, overflow: 'hidden', marginBottom: 32 }}>
                  {disabledTabs.map((tab, idx) => (
                    <DraggableTabItem
                      key={tab.id}
                      item={tab}
                      isEnabled={false}
                      index={idx}
                      group={disabledTabs}
                      tabs={tabs}
                      moveTab={moveTab}
                      enableTab={enableTab}
                      disableTab={disableTab}
                      isLast={idx === disabledTabs.length - 1}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      activeDragId={activeDragId}
                      positions={positions}
                    />
                  ))}
                </View>
              </Animated.View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavbar hideExtension={true} />
    </GestureHandlerRootView>
  );
}
