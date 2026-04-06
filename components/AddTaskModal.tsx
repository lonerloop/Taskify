import { Priority, useTaskStore } from '@/store/useTaskStore';
import {
  Calendar02Icon,
  Flag01Icon,
  InboxIcon,
  LabelIcon,
  Mic02Icon,
  MoreHorizontalIcon,
  SentIcon
} from '@hugeicons/core-free-icons';
import {
  HugeiconsIcon
} from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { DateTimePickerModal } from './DateTimePickerModal';
import { PriorityPopup } from './PriorityPopup';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface AddTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AddTaskModal({ isVisible, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('none');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('What would you like to do?');
  const [dueDate, setDueDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('None');
  const [selectedRepeat, setSelectedRepeat] = useState('None');
  const [selectedReminders, setSelectedReminders] = useState<any[]>([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isPriorityPopupVisible, setIsPriorityPopupVisible] = useState(false);
  const { addTask, selectedListId } = useTaskStore();
  const inputRef = useRef<TextInput>(null);

  const placeholderTexts = [
    'What would you like to do?',
    'What is on your mind?',
    'Plan your next big thing...',
    'Got a new task?',
    'Write it down, get it done.',
    'Focus on the next step...',
    'Capture your thoughts...',
    'What is the priority for today?',
    'Stay organized, stay productive.',
    'Ready for the next challenge?'
  ];

  useEffect(() => {
    if (isVisible && !isDatePickerVisible) {
      // Randomize placeholder if opening for the first time or returning
      if (title === '') {
        const randomText = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
        setCurrentPlaceholder(randomText);
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Increased delay to account for date picker slide-out
      return () => clearTimeout(timer);
    }
  }, [isVisible, isDatePickerVisible]);

  const handleSave = () => {
    if (!title.trim()) return;

    addTask({
      id: Math.random().toString(36).substring(7),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      due_date: dueDate,
      time: selectedTime,
      repeat: selectedRepeat,
      reminders: selectedReminders,
      list_id: selectedListId,
      created_at: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setPriority('none');
    setDueDate('Today');
    setSelectedTime('None');
    setSelectedRepeat('None');
    setSelectedReminders([]);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          pointerEvents="box-none"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              entering={SlideInDown.duration(220)}
              exiting={SlideOutDown.duration(180)}
              style={{
                backgroundColor: '#1a1a1a',
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: Platform.OS === 'ios' ? 40 : 20
              }}
            >
              <TextInput
                ref={inputRef}
                placeholder={currentPlaceholder}
                placeholderTextColor="#52525b"
                style={{ fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 4, paddingVertical: 0 }}
                value={title}
                onChangeText={setTitle}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              <TextInput
                placeholder="Description"
                placeholderTextColor="#52525b"
                style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 12, paddingVertical: 0 }}
                value={description}
                onChangeText={setDescription}
                multiline
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => setIsDatePickerVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, marginRight: 12 }}
                  >
                    <HugeiconsIcon icon={Calendar02Icon} size={18} color="#3b82f6" />
                    <Text style={{ color: '#3b82f6', marginLeft: 6, fontWeight: '600', fontSize: 13 }}>{dueDate}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setIsPriorityPopupVisible(true)}
                    style={{ marginRight: 16 }}
                  >
                    <HugeiconsIcon 
                      icon={Flag01Icon} 
                      size={20} 
                      color={priority === 'none' ? '#71717a' : (
                        priority === 'high' ? '#ef4444' : 
                        priority === 'medium' ? '#f59e0b' : '#3b82f6'
                      )} 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginRight: 16 }}>
                    <HugeiconsIcon icon={LabelIcon} size={20} color="#71717a" />
                  </TouchableOpacity>

                  <TouchableOpacity style={{ marginRight: 16 }}>
                    <HugeiconsIcon icon={InboxIcon} size={20} color="#71717a" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={20} color="#71717a" />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {title.trim().length > 0 ? (
                    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
                      <TouchableOpacity
                        onPress={handleSave}
                        style={{
                          backgroundColor: '#3b82f6',
                          paddingHorizontal: 16,
                          paddingVertical: 6,
                          borderRadius: 15,
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      >
                        <HugeiconsIcon icon={SentIcon} size={18} color="#ffffff" />
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
                      <TouchableOpacity>
                        <HugeiconsIcon icon={Mic02Icon} size={20} color="#71717a" />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
          onSave={(data) => {
            if (data.date instanceof Date) {
              const today = new Date();
              const tomorrow = new Date();
              tomorrow.setDate(today.getDate() + 1);

              const isToday = data.date.getDate() === today.getDate() &&
                            data.date.getMonth() === today.getMonth() &&
                            data.date.getFullYear() === today.getFullYear();
              
              const isTomorrow = data.date.getDate() === tomorrow.getDate() &&
                               data.date.getMonth() === tomorrow.getMonth() &&
                               data.date.getFullYear() === tomorrow.getFullYear();

              if (isToday) setDueDate('Today');
              else if (isTomorrow) setDueDate('Tomorrow');
              else setDueDate(data.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
            } else {
              setDueDate(data.date);
            }

            if (data.time) setSelectedTime(data.time);
            if (data.repeat) setSelectedRepeat(data.repeat);
            if (data.reminders) setSelectedReminders(data.reminders);
            
            setIsDatePickerVisible(false);
          }}
          initialDate={dueDate}
        />

        <PriorityPopup
          isVisible={isPriorityPopupVisible}
          onClose={() => setIsPriorityPopupVisible(false)}
          selectedPriority={priority}
          onSelect={(p) => {
            setPriority(p);
            setIsPriorityPopupVisible(false);
          }}
        />
      </View>
    </Modal>
  );
}


