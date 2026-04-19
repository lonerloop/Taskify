import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, Pressable, Dimensions, TouchableWithoutFeedback , ScrollView } from 'react-native';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
   withSpring,
   runOnJS,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  Cancel01Icon,
  Tick02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Clock01Icon,
  AlarmClockIcon,
  Notification03Icon,
  RepeatIcon,
  HelpCircleIcon,
  ArrowDown01Icon,
  ChatQuestion01Icon
} from '@hugeicons/core-free-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface DateTimePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: { date: Date | string, time?: string, repeat?: string, reminders?: string[] }) => void;
  initialDate?: string;
}

export function DateTimePickerModal({ isVisible, onClose, onSave, initialDate }: DateTimePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026 based on image
  const [selectedTab, setSelectedTab] = useState<'Date' | 'Duration'>('Date');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('None');
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  const [recentReminders, setRecentReminders] = useState<string[]>([]);
  const [lastCustomReminder, setLastCustomReminder] = useState<string>('');
  const [constantReminder, setConstantReminder] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [isCustomReminderVisible, setIsCustomReminderVisible] = useState(false);
  const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
  
  const [selectedRepeat, setSelectedRepeat] = useState<string>('None');
  const [isRepeatModalVisible, setIsRepeatModalVisible] = useState(false);
  const [isCustomRepeatVisible, setIsCustomRepeatVisible] = useState(false);
  const [isRepeatInfoVisible, setIsRepeatInfoVisible] = useState(false);
  
  const [repeatType, setRepeatType] = useState<'By Due Dates' | 'By Completion Date' | 'By Specific Dates'>('By Due Dates');
  const [repeatFreq, setRepeatFreq] = useState({ value: '1', unit: 'Week' });
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [skipWeekends, setSkipWeekends] = useState(false);
  
  const calendarOpacity = useSharedValue(1);
  const calendarTranslateX = useSharedValue(0);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Adjust to Monday start
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const calendar: (Date | null)[] = [];
    
    // Fill empty days before first day of month
    for (let i = 0; i < firstDay; i++) {
        calendar.push(null);
    }
    
    // Fill month days
    for (let i = 1; i <= daysInMonth; i++) {
        calendar.push(new Date(year, month, i));
    }

    // Pad to exactly 42 days (6 full weeks) for height stability
    while (calendar.length < 42) {
        calendar.push(null);
    }
    
    return calendar;
  };

  const calendarDays = React.useMemo(() => generateCalendar(), [currentMonth]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const slideOffset = 20; // Reduced from 30 for snappier feel
    const exitX = direction === 'next' ? -slideOffset : slideOffset;
    const enterX = direction === 'next' ? slideOffset : -slideOffset;

    calendarOpacity.value = withTiming(0, { duration: 120 }); // Faster from 150
    calendarTranslateX.value = withTiming(exitX, { duration: 120 });
    
    setTimeout(() => {
        setCurrentMonth(prev => {
          const next = new Date(prev);
          next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
          return next;
        });
        
        calendarTranslateX.value = enterX;
        
        calendarOpacity.value = withTiming(1, { duration: 120 });
        calendarTranslateX.value = withTiming(0, { duration: 120 });
    }, 120);
  };

  const animatedCalendarStyle = useAnimatedStyle(() => {
    return {
      opacity: calendarOpacity.value,
      transform: [
        { translateX: calendarTranslateX.value },
        { scale: calendarOpacity.value * 0.02 + 0.98 }
      ]
    };
  });

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const formattedMonth = currentMonth.toLocaleString('default', { month: 'long' });

  const getDayStyle = (date: Date) => {
    const selected = isSelected(date);
    const today = isToday(date);
    const past = isPast(date);

    let backgroundColor = 'transparent';
    let textColor = 'white';
    let borderWidth = 0;
    let borderColor = 'transparent';

    if (selected) {
      backgroundColor = past ? '#ef4444' : '#3b82f6';
      textColor = 'white';
    } else if (today) {
      backgroundColor = 'rgba(59, 130, 246, 0.15)'; // Subtle highlight for today
      textColor = '#3b82f6';
      borderWidth = 1;
      borderColor = '#3b82f6';
    }

    return {
      width: 36,
      height: 36,
      borderRadius: 8, // Rounded square
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor,
      borderWidth,
      borderColor
    };
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={{ flex: 1 }}>
        <Pressable 
          onPress={onClose} 
          style={StyleSheet.absoluteFill}
        >
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          </Animated.View>
        </Pressable>

        <View style={{ marginTop: 'auto', width: '100%' }} pointerEvents="box-none">
            <Animated.View 
              entering={SlideInDown.duration(300)}
              exiting={SlideOutDown.duration(300)}
              style={{ 
                backgroundColor: '#1a1a1a', 
                borderTopLeftRadius: 20, 
                borderTopRightRadius: 20, 
                paddingBottom: Platform.OS === 'ios' ? 40 : 20,
                height: 650 // Increased from 600 to show Clear button fully
              }}
            >
            {/* Header */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              paddingHorizontal: 16, 
              paddingVertical: 20 // Restored to 20
            }}>
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                <HugeiconsIcon icon={Cancel01Icon} size={24} color="#a1a1aa" />
              </TouchableOpacity>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                   onPress={() => setSelectedTab('Date')}
                   style={{ marginRight: 24, borderBottomWidth: selectedTab === 'Date' ? 2 : 0, borderBottomColor: '#3b82f6', paddingBottom: 4 }}
                >
                  <Text style={{ 
                    color: selectedTab === 'Date' ? '#3b82f6' : '#a1a1aa', 
                    fontSize: 18, 
                    fontWeight: '600' 
                  }}>Date</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={() => setSelectedTab('Duration')}
                   style={{ borderBottomWidth: selectedTab === 'Duration' ? 2 : 0, borderBottomColor: '#3b82f6', paddingBottom: 4 }}
                >
                  <Text style={{ 
                    color: selectedTab === 'Duration' ? '#3b82f6' : '#a1a1aa', 
                    fontSize: 18, 
                    fontWeight: '600' 
                  }}>Duration</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => onSave({ 
                  date: selectedDate, 
                  time: selectedTime, 
                  repeat: selectedRepeat, 
                  reminders: selectedReminders 
                })} 
                style={{ padding: 8 }}
              >
                <HugeiconsIcon icon={Tick02Icon} size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Calendar Header */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              paddingHorizontal: 20,
              paddingLeft: 26, 
              marginBottom: 12 // Restored to 12
            }}>
              <Animated.Text style={[{ color: 'white', fontSize: 20, fontWeight: '700' }, animatedCalendarStyle]}>
                {formattedMonth}
              </Animated.Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleMonthChange('prev')} style={{ marginRight: 24, padding: 4 }}>
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#a1a1aa" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMonthChange('next')} style={{ padding: 4 }}>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#a1a1aa" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekdays */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
              {daysOfWeek.map(day => (
                <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#52525b', fontSize: 13, fontWeight: '500' }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Days */}
            <Animated.View style={[{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              paddingHorizontal: 16, 
              marginBottom: 16, // Increased to 16
              height: 240, 
            }, animatedCalendarStyle]}>
              {calendarDays.map((date, index) => (
                <View key={index} style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  {date ? (
                    <TouchableOpacity 
                      onPress={() => handleDateSelect(date)}
                      style={getDayStyle(date)}
                    >
                      <Text style={{ 
                        color: isSelected(date) ? 'white' : isToday(date) ? '#3b82f6' : 'white', 
                        fontSize: 16, 
                        fontWeight: '500' 
                      }}>
                        {date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </Animated.View>

            {/* Options List */}
            <View style={{ paddingHorizontal: 16 }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                    <OptionRow 
                        icon={Clock01Icon} 
                        label="Time" 
                        value={isPast(selectedDate) ? 'None' : selectedTime} 
                        disabled={isPast(selectedDate)} 
                        onPress={() => !isPast(selectedDate) && setIsTimePickerVisible(true)}
                    />
                    <OptionRow 
                        icon={AlarmClockIcon} 
                        label="Reminder" 
                        value={selectedReminders.length === 0 ? 'None' : selectedReminders.join(', ')} 
                        disabled={isPast(selectedDate)} 
                        onPress={() => !isPast(selectedDate) && setIsReminderModalVisible(true)}
                        onClear={() => setSelectedReminders([])}
                    />
                    <OptionRow 
                        icon={RepeatIcon} 
                        label="Repeat" 
                        value={selectedRepeat} 
                        last 
                        disabled={isPast(selectedDate)} 
                        onPress={() => !isPast(selectedDate) && setIsRepeatModalVisible(true)}
                        onClear={() => setSelectedRepeat('None')}
                    />
                </View>
            </View>

            {/* Modals outside the main scroll view or fixed */}
            {isVisible ? (
                <>
                    <ReminderModal 
                        isVisible={isReminderModalVisible} 
                        onClose={() => setIsReminderModalVisible(false)}
                        selectedReminders={selectedReminders}
                        selectedTime={selectedTime}
                        onToggle={(val) => {
                            setSelectedReminders(prev => {
                                if (val === 'None') return [];
                                if (prev.includes(val)) {
                                    return prev.filter(r => r !== val);
                                }
                                if (prev.length >= 5) {
                                    setIsLimitModalVisible(true);
                                    return prev;
                                }
                                // Update recents
                                setRecentReminders(rPrev => {
                                    const filtered = rPrev.filter(r => r !== val);
                                    return [val, ...filtered].slice(0, 2);
                                });
                                return [...prev, val];
                            });
                        }}
                        recentReminders={recentReminders}
                        lastCustomReminder={lastCustomReminder}
                        onCustom={() => {
                            if (selectedReminders.length >= 5) {
                                setIsLimitModalVisible(true);
                            } else {
                                setIsReminderModalVisible(false);
                                setIsCustomReminderVisible(true);
                            }
                        }}
                        constantReminder={constantReminder}
                        onToggleConstant={() => setConstantReminder(!constantReminder)}
                    />

                    <LimitReachedModal 
                        isVisible={isLimitModalVisible} 
                        onClose={() => setIsLimitModalVisible(false)} 
                    />

                    <CustomReminderPopup
                        isVisible={isCustomReminderVisible}
                        onClose={() => {
                            setIsCustomReminderVisible(false);
                            setIsReminderModalVisible(true);
                        }}
                        selectedDate={selectedDate}
                        onConfirm={(reminder) => {
                            setSelectedReminders(prev => {
                                if (prev.length >= 5) {
                                    setIsLimitModalVisible(true);
                                    return prev;
                                }
                                setLastCustomReminder(reminder);
                                // Update recents
                                setRecentReminders(rPrev => {
                                    const filtered = rPrev.filter(r => r !== reminder);
                                    return [reminder, ...filtered].slice(0, 2);
                                });
                                return [...prev, reminder];
                            });
                            setIsCustomReminderVisible(false);
                        }}
                    />

                    <RepeatModal 
                        isVisible={isRepeatModalVisible}
                        onClose={() => setIsRepeatModalVisible(false)}
                        selectedRepeat={selectedRepeat}
                        selectedDate={selectedDate}
                        onSelect={(val) => {
                            if (val === 'Custom') {
                                setIsRepeatModalVisible(false);
                                setIsCustomRepeatVisible(true);
                            } else {
                                setSelectedRepeat(val);
                                setIsRepeatModalVisible(false);
                            }
                        }}
                    />

                    <CustomRepeatModal 
                        isVisible={isCustomRepeatVisible}
                        onClose={() => {
                            setIsCustomRepeatVisible(false);
                            setIsRepeatModalVisible(true);
                        }}
                        onConfirm={(repeat) => {
                            setSelectedRepeat(repeat);
                            setIsCustomRepeatVisible(false);
                        }}
                        selectedDate={selectedDate}
                        onShowInfo={() => setIsRepeatInfoVisible(true)}
                        repeatType={repeatType}
                        setRepeatType={setRepeatType}
                        repeatFreq={repeatFreq}
                        setRepeatFreq={setRepeatFreq}
                        repeatDays={repeatDays}
                        setRepeatDays={setRepeatDays}
                        specificDates={specificDates}
                        setSpecificDates={setSpecificDates}
                        skipWeekends={skipWeekends}
                        setSkipWeekends={setSkipWeekends}
                    />

                    <RepeatTypeInfoModal 
                        isVisible={isRepeatInfoVisible}
                        onClose={() => setIsRepeatInfoVisible(false)}
                    />
                </>
            ) : null}

            <TimePickerPopup 
                isVisible={isTimePickerVisible} 
                onClose={() => setIsTimePickerVisible(false)}
                onConfirm={(time) => {
                    setSelectedTime(time);
                    setIsTimePickerVisible(false);
                }}
                initialTime={selectedTime}
            />

            {/* Clear Button */}
            <TouchableOpacity 
              onPress={() => {
                  setSelectedDate(new Date());
                  setCurrentMonth(new Date());
                  setSelectedTime('None');
                  setSelectedReminders([]);
                  setSelectedRepeat('None');
                  setRepeatType('By Due Dates');
                  setRepeatFreq({ value: '1', unit: 'Week' });
                  setRepeatDays([]);
                  setSpecificDates([]);
                  setSkipWeekends(false);
              }}
              style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}
            >
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
function OptionRow({ icon, label, value, disabled, onPress, last, onClear }: { 
    icon: any, 
    label: string, 
    value: string, 
    disabled?: boolean, 
    onPress?: () => void, 
    last?: boolean,
    onClear?: () => void
}) {
    return (
        <View style={{ 
            borderBottomWidth: last ? 0 : 0.5,
            borderBottomColor: 'rgba(255,255,255,0.05)',
            opacity: disabled ? 0.3 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 16
        }}>
            <TouchableOpacity 
                onPress={onPress} 
                style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    paddingVertical: 14,
                    paddingLeft: 16
                }} 
                disabled={disabled}
            >
                <HugeiconsIcon icon={icon} size={22} color={disabled ? '#71717a' : '#a1a1aa'} />
                <Text style={{ color: 'white', fontSize: 16, marginLeft: 12, fontWeight: '500' }}>{label}</Text>
                
                <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 20 }}>
                    <Text 
                        numberOfLines={1} 
                        style={{ color: value === 'None' ? '#71717a' : '#3b82f6', fontSize: 16 }}
                    >
                        {value}
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {(onClear && value !== 'None') ? (
                    <TouchableOpacity onPress={onClear} style={{ padding: 8 }}>
                        <HugeiconsIcon icon={Cancel01Icon} size={16} color="#71717a" />
                    </TouchableOpacity>
                ) : (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#71717a" />
                )}
            </View>
        </View>
    );
}



function CustomReminderPopup({ isVisible, onClose, onConfirm, selectedDate }: { 
    isVisible: boolean, 
    onClose: () => void, 
    onConfirm: (reminder: string) => void,
    selectedDate: Date
}) {
    const [tab, setTab] = useState<'Day' | 'Week'>('Day');
    
    const dayOffsets = ['On the day', '1 day early', '2 days early', '3 days early', '4 days early', '5 days early', '6 days early'];
    const weekOffsets = ['On the day', '1 week early', '2 weeks early', '3 weeks early', '4 weeks early'];
    
    const [offset, setOffset] = useState('On the day');
    const [hour, setHour] = useState('09');
    const [minute, setMinute] = useState('00');
    const [period, setPeriod] = useState('AM');

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const getPreviewText = () => {
        const dateStr = selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
        return `Remind at ${hour}:${minute}${period} on ${dateStr}`;
    };

    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={onClose}
            />
            <GestureHandlerRootView style={{ width: '90%' }}>
                <View style={{ backgroundColor: '#1c1c1e', width: '100%', borderRadius: 24, padding: 24 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                        <TouchableOpacity onPress={() => setTab('Day')} style={{ marginRight: 24, borderBottomWidth: tab === 'Day' ? 2 : 0, borderBottomColor: '#3b82f6', paddingBottom: 4 }}>
                            <Text style={{ color: tab === 'Day' ? '#3b82f6' : '#a1a1aa', fontSize: 18, fontWeight: '700' }}>Day</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTab('Week')} style={{ borderBottomWidth: tab === 'Week' ? 2 : 0, borderBottomColor: '#3b82f6', paddingBottom: 4 }}>
                            <Text style={{ color: tab === 'Week' ? '#3b82f6' : '#a1a1aa', fontSize: 18, fontWeight: '700' }}>Week</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                        <View style={{ width: 140 }}>
                           <PickerColumn 
                                data={tab === 'Day' ? dayOffsets : weekOffsets} 
                                selectedValue={offset} 
                                onValueChange={setOffset} 
                                width={140} 
                           />
                        </View>
                        <View style={{ width: 10 }} />
                        <PickerColumn data={hours} selectedValue={hour} onValueChange={setHour} width={50} />
                        <PickerColumn data={minutes} selectedValue={minute} onValueChange={setMinute} width={50} />
                        <PickerColumn data={periods} selectedValue={period} onValueChange={setPeriod} width={50} />
                    </View>

                    <Text style={{ color: '#a1a1aa', fontSize: 13, textAlign: 'center', marginTop: 20 }}>{getPreviewText()}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30 }}>
                        <TouchableOpacity onPress={onClose} style={{ marginRight: 24 }}>
                            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm(`${offset} (${hour}:${minute} ${period})`)}>
                            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '700' }}>DONE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </GestureHandlerRootView>
        </View>
        </Modal>
    );
}


function ReminderModal({ 
    isVisible, onClose, selectedReminders, onToggle, onCustom, constantReminder, onToggleConstant, recentReminders, lastCustomReminder, selectedTime 
}: { 
    isVisible: boolean, 
    onClose: () => void, 
    selectedReminders: string[], 
    onToggle: (val: string) => void,
    onCustom: () => void,
    constantReminder: boolean,
    onToggleConstant: () => void,
    recentReminders: string[],
    lastCustomReminder: string,
    selectedTime: string
}) {
    const defaultTimeStr = selectedTime === 'None' ? ' (06:00)' : '';
    const options = [
        { label: 'None', value: 'None' },
        { label: 'On the day', time: defaultTimeStr, value: `On the day${defaultTimeStr}` },
        { label: '1 day early', time: defaultTimeStr, value: `1 day early${defaultTimeStr}` },
        { label: '2 days early', time: defaultTimeStr, value: `2 days early${defaultTimeStr}` },
        { label: '3 days early', time: defaultTimeStr, value: `3 days early${defaultTimeStr}` },
        { label: '1 week early', time: defaultTimeStr, value: `1 week early${defaultTimeStr}` },
    ];

    const switchX = useSharedValue(constantReminder ? 20 : 2);
    useEffect(() => {
        switchX.value = withTiming(constantReminder ? 20 : 2, { duration: 200 });
    }, [constantReminder]);

    const animatedSwitchStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: switchX.value }]
    }));

    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={onClose}
            />
            <View style={{ backgroundColor: '#1c1c1e', width: '85%', borderRadius: 24, paddingVertical: 16 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12 }}>Reminder</Text>
                    
                    {options.map((opt) => {
                        const isSelected = (opt.value === 'None' ? selectedReminders.length === 0 : selectedReminders.some(r => r.startsWith(opt.label)));
                        return (
                            <TouchableOpacity 
                                key={opt.value}
                                onPress={() => onToggle(opt.value)}
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    paddingVertical: 10,
                                    paddingHorizontal: 24
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ color: isSelected && opt.value !== 'None' ? '#3b82f6' : 'white', fontSize: 16 }}>{opt.label}</Text>
                                    {opt.time ? <Text style={{ color: isSelected ? '#3b82f6' : '#71717a', fontSize: 14, marginLeft: 6 }}>{opt.time}</Text> : null}
                                </View>
                                {isSelected ? (
                                    <HugeiconsIcon icon={Tick02Icon} size={20} color="#3b82f6" />
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}

                    {lastCustomReminder ? (
                        <TouchableOpacity 
                            onPress={() => onToggle(lastCustomReminder)}
                            style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                paddingVertical: 10,
                                paddingHorizontal: 24
                            }}
                        >
                            <Text style={{ color: selectedReminders.includes(lastCustomReminder) ? '#3b82f6' : 'white', fontSize: 16 }}>{lastCustomReminder}</Text>
                            {selectedReminders.includes(lastCustomReminder) ? (
                                <HugeiconsIcon icon={Tick02Icon} size={20} color="#3b82f6" />
                            ) : null}
                        </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity 
                        onPress={onCustom}
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            paddingVertical: 10,
                            paddingHorizontal: 24
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16 }}>Custom</Text>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#71717a" />
                    </TouchableOpacity>

                    {recentReminders.length > 0 && (
                        <>
                            <View style={{ height: 1, backgroundColor: '#333333', marginVertical: 8, marginHorizontal: 24 }} />
                            <Text style={{ color: '#71717a', fontSize: 14, fontWeight: '600', paddingHorizontal: 24, marginVertical: 6 }}>Recents</Text>
                            {recentReminders.map((rec) => {
                                return (
                                    <TouchableOpacity 
                                        key={rec}
                                        onPress={() => onToggle(rec)}
                                        style={{ 
                                            flexDirection: 'row', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                            paddingHorizontal: 24
                                        }}
                                    >
                                        <Text style={{ color: '#a1a1aa', fontSize: 16 }}>{rec}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}

                    <View style={{ height: 1, backgroundColor: '#333333', marginVertical: 10, marginHorizontal: 24 }} />

                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingHorizontal: 24,
                        paddingVertical: 8
                    }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Constant Reminder</Text>
                        <TouchableOpacity 
                            onPress={onToggleConstant}
                            style={{ 
                                width: 44, 
                                height: 24, 
                                borderRadius: 12, 
                                backgroundColor: constantReminder ? '#3b82f6' : '#333333',
                                justifyContent: 'center'
                            }}
                        >
                            <Animated.View style={[{ 
                                width: 20, 
                                height: 20, 
                                borderRadius: 10, 
                                backgroundColor: 'white',
                            }, animatedSwitchStyle]} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, marginTop: 16 }}>
                        <TouchableOpacity onPress={onClose} style={{ marginRight: 24 }}>
                            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '700' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function LimitReachedModal({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) {
    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
                onPress={onClose}
            />
            <View style={{ backgroundColor: '#2c2c2e', width: '70%', borderRadius: 16, padding: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Limit reached</Text>
                    <Text style={{ color: '#a1a1aa', fontSize: 15, marginBottom: 20 }}>Sorry, you can add up to 5 reminders</Text>
                    <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end' }}>
                        <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '700' }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function TimePickerPopup({ isVisible, onClose, onConfirm, initialTime }: { isVisible: boolean, onClose: () => void, onConfirm: (time: string) => void, initialTime: string }) {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const periods = ['AM', 'PM'];

    const getTimeParts = (time: string) => {
        if (time === 'None') return { hour: '08', minute: '00', period: 'AM' };
        const [t, p] = time.split(' ');
        const [h, m] = t.split(':');
        return { hour: h, minute: m, period: p };
    };

    const parts = getTimeParts(initialTime);
    const [selectedHour, setSelectedHour] = useState(parts.hour);
    const [selectedMinute, setSelectedMinute] = useState(parts.minute);
    const [selectedPeriod, setSelectedPeriod] = useState(parts.period);

    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={onClose}
            />
            <GestureHandlerRootView style={{ width: '75%' }}>
                <View style={{ backgroundColor: '#1c1c1e', width: '100%', borderRadius: 24, padding: 24 }}>
                    <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 24 }}>Time</Text>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 30 }}>
                        <PickerColumn data={hours} selectedValue={selectedHour} onValueChange={setSelectedHour} />
                        <Text style={{ color: 'white', fontSize: 26, fontWeight: '700', marginHorizontal: 12 }}>:</Text>
                        <PickerColumn data={minutes} selectedValue={selectedMinute} onValueChange={setSelectedMinute} />
                        <View style={{ width: 24 }} />
                        <PickerColumn data={periods} selectedValue={selectedPeriod} onValueChange={setSelectedPeriod} />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: '#71717a', fontSize: 17, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onConfirm(`${selectedHour}:${selectedMinute} ${selectedPeriod}`)}>
                            <Text style={{ color: '#3b82f6', fontSize: 17, fontWeight: '700' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </GestureHandlerRootView>
        </View>
        </Modal>
    );
}
const ITEM_HEIGHT = 48;

const PickerColumn = React.memo(({ data, selectedValue, onValueChange, width = 64 }: { data: string[], selectedValue: string, onValueChange: (val: string) => void, width?: number }) => {
    const scrollY = useSharedValue(0);
    const lastIndex = useSharedValue(-1);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
            const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
            if (index !== lastIndex.value) {
                lastIndex.value = index;
                runOnJS(Haptics.selectionAsync)();
            }
        },
    });

    const initialIndex = data.indexOf(selectedValue);
    const fullData = ['', ...data, ''];

    return (
        <View style={{ height: ITEM_HEIGHT * 3, width: width, overflow: 'hidden' }}>
            {/* Cylinder mask/overlay to hide sharp edges - deeper gradient */}
            <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: ITEM_HEIGHT * 0.8, 
                backgroundColor: '#1c1c1e', // Match modal background
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
                height: ITEM_HEIGHT * 0.8, 
                backgroundColor: '#1c1c1e',
                opacity: 0.8,
                zIndex: 10,
                borderTopWidth: 0.5,
                borderTopColor: 'rgba(255,255,255,0.05)'
            }} pointerEvents="none" />

            <AnimatedFlatList
                data={fullData}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                disableIntervalMomentum={true}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                decelerationRate="fast"
                nestedScrollEnabled={true}
                removeClippedSubviews={false}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
                onScrollEndDrag={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                    if (data[index]) onValueChange(data[index]);
                }}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
                    if (data[index]) onValueChange(data[index]);
                }}
                renderItem={({ item, index }: any) => (
                    <PickerItem item={item as string} index={index} scrollY={scrollY} ITEM_HEIGHT={ITEM_HEIGHT} />
                )}
            />
        </View>
    );
});
PickerColumn.displayName = 'PickerColumn';

const PickerItem = React.memo(({ item, index, scrollY, ITEM_HEIGHT }: { item: string, index: number, scrollY: any, ITEM_HEIGHT: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const range = [(index - 2) * ITEM_HEIGHT, (index - 1) * ITEM_HEIGHT, index * ITEM_HEIGHT];
        
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
        <Animated.View style={[{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
            <Text style={{ 
                color: 'white', 
                fontSize: item.length > 10 ? 18 : 24, // Smaller font for long strings
                fontWeight: '700'
            }}>
                {item}
            </Text>
        </Animated.View>
    );
});
PickerItem.displayName = 'PickerItem';

function RepeatModal({ isVisible, onClose, onSelect, selectedRepeat, selectedDate }: {
    isVisible: boolean,
    onClose: () => void,
    onSelect: (val: string) => void,
    selectedRepeat: string,
    selectedDate: Date
}) {
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfMonth = selectedDate.getDate();
    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'short' });
    const daySuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };

    const options = [
        { label: 'None', value: 'None' },
        { label: 'Daily', value: 'Daily' },
        { label: `Weekly (${dayName})`, value: 'Weekly' },
        { label: `Monthly (The ${dayOfMonth}${daySuffix(dayOfMonth)} day)`, value: 'Monthly' },
        { label: `Yearly (on ${monthName} ${dayOfMonth})`, value: 'Yearly' },
        { isSeparator: true },
        { label: 'Every Weekday (Mon - Fri)', value: 'Every Weekday' },
        { isSeparator: true },
        { label: 'Custom', value: 'Custom' },
    ];

    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={onClose}
            />
            <View style={{ backgroundColor: '#1c1c1e', width: '85%', borderRadius: 24, paddingVertical: 16 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12 }}>Repeat</Text>
                    
                    {options.map((opt, index) => {
                        if (opt.isSeparator) {
                            return <View key={`sep-${index}`} style={{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 }} />;
                        }
                        const isSelected = selectedRepeat === opt.value;
                        return (
                            <TouchableOpacity 
                                key={opt.value}
                                onPress={() => onSelect(opt.value!)}
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    paddingVertical: 12,
                                    paddingHorizontal: 24
                                }}
                            >
                                <Text style={{ color: isSelected ? '#3b82f6' : 'white', fontSize: 16 }}>{opt.label}</Text>
                                {isSelected ? (
                                    <HugeiconsIcon icon={Tick02Icon} size={20} color="#3b82f6" />
                                ) : null}
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity 
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end', marginTop: 8, paddingHorizontal: 24, paddingVertical: 8 }}
                    >
                        <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function RepeatTypeInfoModal({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) {
    return (
        <Modal transparent visible={isVisible} animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Pressable 
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={onClose}
            />
            <View style={{ backgroundColor: '#1c1c1e', width: '85%', borderRadius: 24, padding: 24 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>About Repeat Type</Text>
                    
                    <View style={{ gap: 16 }}>
                        <View>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>By due dates:</Text>
                            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>Repeat only according to the regular repetition rules you set up in advance</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>By completion date:</Text>
                            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>The next repeat will be generated only after the current repeat has been completed</Text>
                        </View>
                        <View>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>By specific dates:</Text>
                            <Text style={{ color: '#a1a1aa', fontSize: 14 }}>Choose as many dates as you need to do the task</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={onClose}
                        style={{ alignSelf: 'flex-end', marginTop: 24 }}
                    >
                        <Text style={{ color: '#3b82f6', fontSize: 16, fontWeight: '600' }}>Got It</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function CustomRepeatModal({ 
    isVisible, onClose, onConfirm, selectedDate, onShowInfo,
    repeatType, setRepeatType, repeatFreq, setRepeatFreq, repeatDays, setRepeatDays, specificDates, setSpecificDates,
    skipWeekends, setSkipWeekends
}: {
    isVisible: boolean,
    onClose: () => void,
    onConfirm: (repeat: string) => void,
    selectedDate: Date,
    onShowInfo: () => void,
    repeatType: any,
    setRepeatType: any,
    repeatFreq: any,
    setRepeatFreq: any,
    repeatDays: string[],
    setRepeatDays: any,
    specificDates: Date[],
    setSpecificDates: any,
    skipWeekends: boolean,
    setSkipWeekends: any
}) {
    const { width } = Dimensions.get('window');

    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownHeight = useSharedValue(0);
    const dropdownOpacity = useSharedValue(0);

    const dropdownStyle = useAnimatedStyle(() => ({
        height: dropdownHeight.value,
        opacity: dropdownOpacity.value,
        overflow: 'hidden'
    }));

    useEffect(() => {
        if (isDropdownVisible) {
            dropdownHeight.value = withTiming(150, { duration: 300 });
            dropdownOpacity.value = withTiming(1, { duration: 300 });
        } else {
            dropdownHeight.value = withTiming(0, { duration: 250 });
            dropdownOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [isDropdownVisible]);

    const getSummaryLabel = () => {
        if (repeatType === 'By Specific Dates') {
            return `${specificDates.length} selected`;
        }

        const value = parseInt(repeatFreq.value);
        const unit = repeatFreq.unit;
        const isPlural = value > 1;
        const unitLabel = isPlural ? `${unit}s` : unit;

        if (repeatType === 'By Completion Date') {
            let base = `${value} ${unitLabel.toLowerCase()} after completion`;
            if (skipWeekends && ['Day', 'Week', 'Month'].includes(unit)) {
                return `${base} except weekends`;
            }
            return base;
        }
        
        // By Due Dates
        let base = '';
        if (unit === 'Day' && value === 1) {
            base = 'Daily';
        } else {
            base = `Every ${value} ${unitLabel.toLowerCase()}`;
        }

        if (unit === 'Day' && skipWeekends) {
            return `${base} except weekends`;
        }

        if (['Week', 'Month', 'Year'].includes(unit)) {
            let daysStr = '';
            if (repeatDays.length === 7) {
                daysStr = 'on all days';
            } else if (repeatDays.length > 0) {
                daysStr = `on ${repeatDays.join(', ')}`;
            } else {
                daysStr = `on ${selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}`;
            }
            return `${base} ${daysStr}`;
        }
        
        return base;
    };

    const handleConfirm = () => {
        onConfirm(getSummaryLabel());
    };

    const toggleDay = (day: string) => {
        setRepeatDays((prev: string[]) => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const skipX = useSharedValue(skipWeekends ? 20 : 0);
    useEffect(() => {
        skipX.value = withTiming(skipWeekends ? 20 : 0, { duration: 200 });
    }, [skipWeekends]);

    const skipThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: skipX.value }]
    }));

    return (
        <Modal transparent visible={isVisible} animationType="slide">
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
                         <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                             <HugeiconsIcon icon={Cancel01Icon} size={24} color="white" />
                         </TouchableOpacity>
                         <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Custom</Text>
                         <TouchableOpacity onPress={handleConfirm} style={{ padding: 8 }}>
                             <HugeiconsIcon icon={Tick02Icon} size={24} color="white" />
                         </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                         {/* Repeat Type Dropdown Container */}
                         <View style={{ backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginTop: 8 }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                     <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Repeat Type</Text>
                                      <TouchableOpacity onPress={onShowInfo} style={{ marginLeft: 6 }}>
                                         <HugeiconsIcon icon={ChatQuestion01Icon} size={18} color="#71717a" />
                                      </TouchableOpacity>
                                 </View>
                                 <TouchableOpacity 
                                    onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                 >
                                     <Text style={{ color: '#a1a1aa', fontSize: 16, marginRight: 4 }}>{repeatType}</Text>
                                     <HugeiconsIcon icon={ArrowDown01Icon} size={18} color="#71717a" />
                                 </TouchableOpacity>
                             </View>

                             <Animated.View style={[dropdownStyle, { marginTop: 16, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }]}>
                                 {['By Due Dates', 'By Completion Date', 'By Specific Dates'].map((type) => (
                                     <TouchableOpacity 
                                        key={type}
                                        onPress={() => {
                                            setRepeatType(type);
                                            setIsDropdownVisible(false);
                                        }}
                                        style={{ paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                     >
                                         <Text style={{ color: repeatType === type ? '#3b82f6' : 'white', fontSize: 16 }}>{type}</Text>
                                         {repeatType === type && <HugeiconsIcon icon={Tick02Icon} size={18} color="#3b82f6" />}
                                     </TouchableOpacity>
                                 ))}
                             </Animated.View>
                         </View>

                         {repeatType !== 'By Specific Dates' && (
                             <>
                                <View style={{ backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginTop: 12 }}>
                                    <Text style={{ color: '#71717a', fontSize: 14, marginBottom: 12 }}>Frequency</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 160 }}>
                                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '500', marginRight: 20 }}>Every</Text>
                                        <PickerColumn 
                                            data={Array.from({ length: repeatFreq.unit === 'Day' ? 365 : 99 }, (_, i) => (i + 1).toString())}
                                            selectedValue={repeatFreq.value}
                                            onValueChange={(v: string) => setRepeatFreq((prev: any) => ({ ...prev, value: v }))}
                                            width={60}
                                        />
                                        <PickerColumn 
                                            data={repeatType === 'By Completion Date' ? ['Day', 'Week', 'Month'] : ['Day', 'Week', 'Month', 'Year']}
                                            selectedValue={repeatFreq.unit}
                                            onValueChange={(u: string) => setRepeatFreq((prev: any) => ({ ...prev, unit: u }))}
                                            width={100}
                                        />
                                    </View>
                                </View>

                                <Text style={{ color: '#71717a', fontSize: 14, marginTop: 12, marginLeft: 4 }}>
                                    {getSummaryLabel()}
                                </Text>
                             </>
                         )}

                         {repeatType === 'By Due Dates' && (
                             <View style={{ backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 40 }}>
                                 {repeatFreq.unit === 'Day' ? (
                                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                         <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Skip Weekends</Text>
                                         <TouchableOpacity 
                                             onPress={() => setSkipWeekends(!skipWeekends)}
                                             style={{ 
                                                 width: 44, 
                                                 height: 24, 
                                                 borderRadius: 12, 
                                                 backgroundColor: skipWeekends ? '#3b82f6' : '#333333',
                                                 justifyContent: 'center',
                                                 paddingHorizontal: 2
                                             }}
                                         >
                                             <Animated.View style={[{ 
                                                 width: 20, 
                                                 height: 20, 
                                                 borderRadius: 10, 
                                                 backgroundColor: 'white',
                                             }, skipThumbStyle]} />
                                         </TouchableOpacity>
                                     </View>
                                 ) : (
                                     <>
                                         <Text style={{ color: '#71717a', fontSize: 14, marginBottom: 12 }}>Week</Text>
                                         <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                 const isSel = repeatDays.includes(day);
                                                 return (
                                                     <TouchableOpacity 
                                                        key={day}
                                                        onPress={() => toggleDay(day)}
                                                        style={{ 
                                                            width: (width - 64 - 30) / 4, 
                                                            height: 40, 
                                                            borderRadius: 20, 
                                                            backgroundColor: isSel ? '#3b82f6' : '#2c2c2e',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                     >
                                                         <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>{day}</Text>
                                                     </TouchableOpacity>
                                                 );
                                             })}
                                         </View>
                                     </>
                                 )}
                             </View>
                         )}

                         {repeatType === 'By Completion Date' && (
                             <View style={{ backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 40 }}>
                                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                     <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>Skip Weekends</Text>
                                     <TouchableOpacity 
                                         onPress={() => setSkipWeekends(!skipWeekends)}
                                         style={{ 
                                             width: 44, 
                                             height: 24, 
                                             borderRadius: 12, 
                                             backgroundColor: skipWeekends ? '#3b82f6' : '#333333',
                                             justifyContent: 'center',
                                             paddingHorizontal: 2
                                         }}
                                     >
                                         <Animated.View style={[{ 
                                             width: 20, 
                                             height: 20, 
                                             borderRadius: 10, 
                                             backgroundColor: 'white',
                                         }, skipThumbStyle]} />
                                     </TouchableOpacity>
                                 </View>
                             </View>
                         )}

                         {repeatType === 'By Specific Dates' && (
                             <>
                                <View style={{ backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginTop: 12 }}>
                                    <CalendarContent 
                                       selectedDates={specificDates}
                                       onSelectDate={(date) => {
                                           setSpecificDates((prev: Date[]) => {
                                               const exists = prev.find(d => d.getTime() === date.getTime());
                                               return exists ? prev.filter(d => d.getTime() !== date.getTime()) : [...prev, date];
                                           });
                                       }}
                                    />
                                </View>
                                <Text style={{ color: '#71717a', fontSize: 14, marginTop: 12, marginLeft: 4 }}>
                                    {specificDates.length} selected
                                </Text>
                             </>
                         )}
                    </View>
                </SafeAreaView>
            </GestureHandlerRootView>
        </Modal>
    );
}

function CalendarContent({ selectedDates, onSelectDate }: {
    selectedDates: Date[],
    onSelectDate: (date: Date) => void
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleMonthChange = (dir: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + (dir === 'next' ? 1 : -1));
            return next;
        });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isPast = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < today;
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={() => handleMonthChange('prev')} style={{ padding: 4 }}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMonthChange('next')} style={{ padding: 4 }}>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <Text key={i} style={{ width: '14.28%', textAlign: 'center', color: '#71717a', fontSize: 11, marginBottom: 8, fontWeight: '600' }}>{d}</Text>
                ))}
                {days.map((date, i) => {
                    const isSel = date && selectedDates.find(d => d.getTime() === date.getTime());
                    const today = date ? isToday(date) : false;
                    const past = date ? isPast(date) : false;

                    let backgroundColor = 'transparent';
                    let textColor = 'white';
                    let borderWidth = 0;
                    let borderColor = 'transparent';

                    if (isSel) {
                        backgroundColor = past ? '#ef4444' : '#3b82f6';
                        textColor = 'white';
                    } else if (today) {
                        backgroundColor = 'rgba(59, 130, 246, 0.15)';
                        textColor = '#3b82f6';
                        borderWidth = 1;
                        borderColor = '#3b82f6';
                    }

                    return (
                        <View key={i} style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                            {date && (
                                <TouchableOpacity 
                                    onPress={() => onSelectDate(date)}
                                    style={{ 
                                        width: 36, 
                                        height: 36, 
                                        borderRadius: 8,
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        backgroundColor,
                                        borderWidth,
                                        borderColor
                                    }}
                                >
                                    <Text style={{ 
                                        color: isSel ? 'white' : today ? '#3b82f6' : 'white', 
                                        fontSize: 16, 
                                        fontWeight: isSel || today ? '600' : '500' 
                                    }}>
                                        {date.getDate()}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}



