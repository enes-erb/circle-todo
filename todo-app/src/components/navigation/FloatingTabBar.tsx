import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckSquare, Calendar, Users, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigationHeight } from '../../contexts/NavigationHeightContext';
import { createFrostedSurface } from '../../utils/frostedGlass';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface FloatingTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabIcons = {
  Home: CheckSquare,
  Calendar: Calendar,
  Groups: Users,
  Settings: Settings,
};

const tabLabels = {
  Home: 'Tasks',
  Calendar: 'Calendar',
  Groups: 'Groups',
  Settings: 'Settings',
};

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { setHeight } = useNavigationHeight();

  const handleContainerLayout = React.useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  }, [setHeight]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: insets.bottom + 8,
      left: 16,
      right: 16,
      ...createFrostedSurface(isDark),
      borderRadius: 22,
      paddingVertical: 10,
      paddingHorizontal: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 20,
      elevation: 12,
      zIndex: 1000,
    },
    tabsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: 8,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 22,
      marginHorizontal: 2,
    },
    activeTab: {
      backgroundColor: theme.colors.accent,
      shadowColor: theme.colors.accent,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 3,
      textAlign: 'center',
    },
    activeTabLabel: {
      color: '#FFFFFF',
    },
    inactiveTabLabel: {
      color: theme.colors.textMuted,
    },
  });

  return (
    <View style={styles.container} onLayout={handleContainerLayout}>      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = tabLabels[route.name as keyof typeof tabLabels] || route.name;
          const IconComponent = tabIcons[route.name as keyof typeof tabIcons];
          
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Haptic feedback
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tab, isFocused && styles.activeTab]}
              activeOpacity={0.8}
            >
              <View style={styles.tabContent}>
                <IconComponent
                  size={20}
                  color={isFocused ? '#FFFFFF' : theme.colors.textMuted}
                  strokeWidth={isFocused ? 2.5 : 1.5}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}