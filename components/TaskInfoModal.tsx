import { Priority, useTaskStore } from '@/store/useTaskStore';
import {
  AlarmClockIcon,
  ArrowDown01Icon,
  AttachmentIcon,
  Calendar03Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  Flag01Icon,
  MoreHorizontalIcon,
  PinIcon,
  Share01Icon,
  Tag01Icon,
  Task02Icon
} from '@hugeicons/core-free-icons';
import {
  HugeiconsIcon
} from '@hugeicons/react-native';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { PriorityPopup } from './PriorityPopup';

interface TaskInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  taskId: string | null;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const priorityColors: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
  none: '#a1a1aa',
};

export function TaskInfoModal({ isVisible, onClose, taskId }: TaskInfoModalProps) {
  const { tasks, lists, toggleTask, updateTask, deleteTask } = useTaskStore();
  const [isPriorityPopupVisible, setIsPriorityPopupVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  if (!task) return null;

  const list = lists.find((l) => l.id === task.list_id) || { name: 'Inbox' };

  const hasMetadata =
    (task.time && task.time !== 'None') ||
    (task.reminders && task.reminders.length > 0) ||
    (task.repeat && task.repeat !== 'None');

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={StyleSheet.absoluteFill}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.backdrop} />
          </Animated.View>
        </TouchableWithoutFeedback>

        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(250)}
          style={[styles.modalContent, { height: isExpanded ? 480 : 380 }]}
        >
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    deleteTask(task.id);
                    onClose();
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} size={24} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <HugeiconsIcon icon={PinIcon} size={24} color="#a1a1aa" />
                  <Text style={styles.actionText}>Pin</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <HugeiconsIcon icon={Share01Icon} size={24} color="#a1a1aa" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <HugeiconsIcon icon={Calendar03Icon} size={24} color="#a1a1aa" />
                  <Text style={styles.actionText}>Postpone</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
            </View>
          )}
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.listSelector}>
              <Text style={styles.listName}>{list.name}</Text>
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} color="#71717a" />
            </TouchableOpacity>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsPriorityPopupVisible(true)}
              >
                <HugeiconsIcon
                  icon={Flag01Icon}
                  size={24}
                  color={priorityColors[task.priority]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsExpanded(!isExpanded)}
              >
                <HugeiconsIcon icon={MoreHorizontalIcon} size={24} color={isExpanded ? '#3b82f6' : '#a1a1aa'} />
              </TouchableOpacity>
            </View>
          </View>
          {/* Content */}
          <View style={styles.mainContent}>
            <View style={styles.mainRow}>
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.checkbox,
                  {
                    borderColor: task.completed ? 'transparent' : priorityColors[task.priority],
                    borderWidth: task.completed ? 0 : 2,
                  },
                ]}
              >
                {task.completed && (
                  <HugeiconsIcon icon={CheckmarkSquare02Icon} size={20} color="#52525b" />
                )}
              </TouchableOpacity>

              <View style={styles.titleInfo}>
                <Text style={[styles.title, { color: task.completed ? '#52525b' : 'white' }]}>
                  {task.title}
                </Text>

                {hasMetadata && (
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateText}>
                      {task.due_date}{task.time !== 'None' ? `, ${task.time}` : ''}
                    </Text>
                    <HugeiconsIcon icon={AlarmClockIcon} size={14} color="#3b82f6" />
                  </View>
                )}
              </View>
            </View>
          </View>



          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.bottomIconButton}>
                <HugeiconsIcon icon={Tag01Icon} size={24} color="#71717a" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomIconButton}>
                <HugeiconsIcon icon={Task02Icon} size={24} color="#71717a" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomIconButton}>
                <HugeiconsIcon icon={AttachmentIcon} size={24} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>

          <PriorityPopup
            isVisible={isPriorityPopupVisible}
            onClose={() => setIsPriorityPopupVisible(false)}
            selectedPriority={task.priority}
            onSelect={(p) => {
              updateTask(task.id, { priority: p });
              setIsPriorityPopupVisible(false);
            }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: 380,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  listSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  mainContent: {
    paddingHorizontal: 20,
    flex: 1,
    marginBottom: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 24,
  },
  bottomIconButton: {
    padding: 4,
  },
  expandedContent: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
    width: 65,
  },
  actionText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: '100%',
    marginTop: 8,
  },
});
