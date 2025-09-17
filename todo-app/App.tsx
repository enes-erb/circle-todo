import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, useColorScheme, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { localizationService } from './src/services/localization';
import { notificationService } from './src/services/notifications';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { NavigationHeightProvider } from './src/contexts/NavigationHeightContext';
import { FloatingTabBar } from './src/components/navigation/FloatingTabBar';

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
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Performance optimizations
        lazy: false,
      }}
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
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Start initialization immediately but show splash for minimum time
        const initPromise = Promise.all([
          localizationService.initialize(),
          notificationService.requestPermissions()
        ]);
        
        const minSplashTime = new Promise(resolve => setTimeout(resolve, 1200)); // Reduced from 1500ms
        
        await Promise.all([minSplashTime, initPromise]);
        
        // Small delay for smooth transition
        setTimeout(() => setIsAppReady(true), 100);
      } catch (error) {
        console.error('App initialization failed:', error);
        setTimeout(() => setIsAppReady(true), 100);
      }
    }
    
    initialize();
  }, []);

  if (!isAppReady) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: isDark ? '#111827' : '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Image 
          source={isDark 
            ? require('./assets/icons/splash-icon-dark.png')
            : require('./assets/icons/splash-icon-light.png')
          }
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
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
        <NavigationHeightProvider>
          <AppContent />
        </NavigationHeightProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}