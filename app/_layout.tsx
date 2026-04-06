import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import Sidebar from '@/components/Sidebar';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Drawer
          drawerContent={() => <Sidebar />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
          }}
        >
          <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
        </Drawer>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
