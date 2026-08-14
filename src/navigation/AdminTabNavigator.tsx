import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { AdminDashboardScreen } from '../screens/admin/dashboard/AdminDashboardScreen';
import { AdminOffersScreen } from '../screens/admin/offers/AdminOffersScreen';
import { AdminCreateScreen } from '../screens/admin/create/AdminCreateScreen';
import { AdminAnalyticsScreen } from '../screens/admin/analytics/AdminAnalyticsScreen';
import { AdminProfileScreen } from '../screens/admin/profile/AdminProfileScreen';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const ICONS: Record<keyof AdminTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Offers: { active: 'pricetags', inactive: 'pricetags-outline' },
  Create: { active: 'add-circle', inactive: 'add-circle-outline' },
  Analytics: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  AdminProfile: { active: 'person', inactive: 'person-outline' },
};

const LABELS: Record<keyof AdminTabParamList, string> = {
  Dashboard: 'Dashboard',
  Offers: 'Offers',
  Create: 'Create',
  Analytics: 'Analytics',
  AdminProfile: 'Profile',
};

export function AdminTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabel: LABELS[route.name as keyof AdminTabParamList],
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? ICONS[route.name as keyof AdminTabParamList].active : ICONS[route.name as keyof AdminTabParamList].inactive}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Offers" component={AdminOffersScreen} />
      <Tab.Screen name="Create" component={AdminCreateScreen} />
      <Tab.Screen name="Analytics" component={AdminAnalyticsScreen} />
      <Tab.Screen name="AdminProfile" component={AdminProfileScreen} />
    </Tab.Navigator>
  );
}
