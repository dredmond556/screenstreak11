import { Tabs } from 'expo-router';
import { Smartphone, ChartBar as BarChart3, Settings, Lightbulb, BookOpen } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ size, color }) => (
            <Smartphone size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alternatives"
        options={{
          title: 'Alternatives',
          tabBarIcon: ({ size, color }) => (
            <Lightbulb size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="suggestions"
        options={{
          title: "Senay's Suggestions",
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}