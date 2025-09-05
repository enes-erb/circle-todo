import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckSquare, Calendar, Users, Settings } from 'lucide-react-native';
import { localizationService } from './src/services/localization';
import { notificationService } from './src/services/notifications';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddTodoScreen from './src/screens/AddTodoScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


function TabNavigator() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Home':
              IconComponent = CheckSquare;
              break;
            case 'Calendar':
              IconComponent = Calendar;
              break;
            case 'Groups':
              IconComponent = Users;
              break;
            case 'Settings':
              IconComponent = Settings;
              break;
            default:
              IconComponent = CheckSquare;
          }

          return <IconComponent size={size} color={color} strokeWidth={focused ? 2 : 1.5} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        // Enable smooth transitions between tabs
        animationEnabled: true,
        // Add spring animation
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
        options={{ title: 'Groups' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDark, theme } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        await localizationService.initialize();
        await notificationService.requestPermissions();
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsInitialized(true);
      }
    }
    
    initialize();
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // Use native iOS-style transitions
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animationTypeForReplace: 'push',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="AddTodo"
          component={AddTodoScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}