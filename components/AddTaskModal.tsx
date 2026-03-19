import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  Calendar02Icon,
  Flag01Icon,
  LabelIcon,
  InboxIcon,
  MoreHorizontalIcon,
  Mic02Icon,
  SentIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import { useTaskStore, Priority } from '@/store/useTaskStore';

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
  const addTask = useTaskStore((state) => state.addTask);
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
    if (isVisible) {
      // Randomize placeholder on each open
      const randomText = placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
      setCurrentPlaceholder(randomText);
      
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleSave = () => {
    if (!title.trim()) return;
    
    addTask({
      id: Math.random().toString(36).substring(7),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      priority,
      due_date: 'Today',
      created_at: new Date().toISOString(),
    });
    
    setTitle('');
    setDescription('');
    setPriority('none');
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <AnimatedBlurView 
          intensity={25}
          tint="dark"
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <Animated.View 
                entering={SlideInDown.springify().damping(20).stiffness(150)}
                exiting={SlideOutDown.springify().damping(20).stiffness(150)}
                style={{ 
                  backgroundColor: '#1a1a1a', 
                  borderTopLeftRadius: 15, 
                  borderTopRightRadius: 15, 
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  paddingBottom: Platform.OS === 'ios' ? 40 : 20
                }}
              >
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, marginRight: 12 }}>
                      <HugeiconsIcon icon={Calendar02Icon} size={18} color="#3b82f6" />
                      <Text style={{ color: '#3b82f6', marginLeft: 6, fontWeight: '600', fontSize: 13 }}>Today</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={{ marginRight: 16 }}>
                      <HugeiconsIcon icon={Flag01Icon} size={20} color="#71717a" />
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
              </KeyboardAvoidingView>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </AnimatedBlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
