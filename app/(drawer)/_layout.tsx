import { Drawer } from 'expo-router/drawer';
import Sidebar from '@/components/Sidebar';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <Sidebar />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
    </Drawer>
  );
}
