import React from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { Priority } from '@/store/useTaskStore';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Flag01Icon } from '@hugeicons/core-free-icons';

interface PriorityPopupProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPriority: Priority;
  onSelect: (p: Priority) => void;
}

export function PriorityPopup({
  isVisible,
  onClose,
  selectedPriority,
  onSelect,
}: PriorityPopupProps) {
  const options: { label: string; value: Priority; color: string }[] = [
    { label: 'High Priority', value: 'high', color: '#ef4444' },
    { label: 'Medium Priority', value: 'medium', color: '#f59e0b' },
    { label: 'Low Priority', value: 'low', color: '#3b82f6' },
    { label: 'No Priority', value: 'none', color: '#a1a1aa' },
  ];

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => onSelect(opt.value)}
                  style={[
                    styles.option,
                    selectedPriority === opt.value && styles.selectedOption,
                  ]}
                >
                  <HugeiconsIcon icon={Flag01Icon} size={22} color={opt.color} />
                  <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#262626',
    borderRadius: 24,
    padding: 8,
    width: 220,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    color: 'white',
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
