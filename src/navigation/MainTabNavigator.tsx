import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ServicesScreen } from '../screens/services/ServicesScreen';
import { NearMeScreen } from '../screens/nearby/NearMeScreen';
import { SavedScreen } from '../screens/saved/SavedScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Offers: { active: 'pricetags', inactive: 'pricetags-outline' },
  Services: { active: 'briefcase', inactive: 'briefcase-outline' },
  NearMe: { active: 'map', inactive: 'map-outline' },
  Saved: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? ICONS[route.name].active : ICONS[route.name].inactive} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Offers" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="NearMe" component={NearMeScreen} options={{ tabBarLabel: 'Near Me' }} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
