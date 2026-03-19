import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  HugeiconsIcon
} from '@hugeicons/react-native';
import { 
  PlayIcon,
  PauseIcon,
  ReloadIcon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';

interface PomodoroTimerProps {
  onClose?: () => void;
}

export function PomodoroTimer({ onClose }: PomodoroTimerProps) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      clearInterval(interval);
      alert('Pomodoro finished! Take a break.');
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  return (
    <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 items-center shadow-xl">
      {onClose && (
        <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 p-2">
          <Text className="text-slate-400 font-bold">CLOSE</Text>
        </TouchableOpacity>
      )}
      
      <Text className="text-slate-500 font-bold uppercase tracking-widest mb-4">Focus Time</Text>
      
      <Text className="text-6xl font-bold dark:text-white mb-8 font-mono">
        {formatTime(seconds)}
      </Text>
      
      <View className="flex-row items-center space-x-6">
        <TouchableOpacity 
          onPress={resetTimer}
          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center"
        >
          <Text className="text-slate-500 font-bold">RESET</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setIsActive(!isActive)}
          className={`px-10 py-5 rounded-2xl items-center justify-center shadow-lg ${isActive ? 'bg-slate-100 dark:bg-slate-800' : 'bg-blue-500 shadow-blue-500/30'}`}
        >
          <Text className={`text-xl font-bold ${isActive ? 'text-blue-500' : 'text-white'}`}>
            {isActive ? 'PAUSE' : 'START'}
          </Text>
        </TouchableOpacity>
        
        <View className="w-4" />
      </View>
    </View>
  );
}
