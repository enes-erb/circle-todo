import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({ 
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.accent,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
        };
      default:
        return {
          backgroundColor: theme.colors.accent,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: theme.colors.textInverse };
      case 'secondary':
        return { color: theme.colors.textPrimary };
      case 'ghost':
        return { color: theme.colors.accent };
      case 'danger':
        return { color: theme.colors.textInverse };
      default:
        return { color: theme.colors.textInverse };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallSize;
      case 'md':
        return styles.mediumSize;
      case 'lg':
        return styles.largeSize;
      default:
        return styles.mediumSize;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.smallText;
      case 'md':
        return styles.mediumText;
      case 'lg':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 20;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.textInverse;
      case 'secondary':
        return theme.colors.textPrimary;
      case 'ghost':
        return theme.colors.accent;
      case 'danger':
        return theme.colors.textInverse;
      default:
        return theme.colors.textInverse;
    }
  };

  const isDisabled = disabled || loading;

  const styles = StyleSheet.create({
    button: {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontWeight: '500',
    },
    iconContainer: {},
    iconLeft: {
      marginRight: 8,
    },
    iconRight: {
      marginLeft: 8,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    // Size styles
    smallSize: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    mediumSize: {
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    largeSize: {
      paddingHorizontal: 24,
      paddingVertical: 14,
    },
    // Text size styles
    smallText: {
      fontSize: 14,
    },
    mediumText: {
      fontSize: 16,
    },
    largeText: {
      fontSize: 18,
    },
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        { minHeight: size === 'lg' ? 48 : size === 'sm' ? 36 : 42 }
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
        />
      ) : (
        <View style={styles.buttonContent}>
          {Icon && iconPosition === 'left' && (
            <View style={[styles.iconContainer, title && styles.iconLeft]}>
              <Icon 
                size={getIconSize()} 
                color={getIconColor()} 
                strokeWidth={1.75} 
              />
            </View>
          )}
          
          {title && (
            <Text style={[getTextStyle(), getTextSizeStyle(), styles.buttonText]}>
              {title}
            </Text>
          )}
          
          {Icon && iconPosition === 'right' && (
            <View style={[styles.iconContainer, title && styles.iconRight]}>
              <Icon 
                size={getIconSize()} 
                color={getIconColor()} 
                strokeWidth={1.75} 
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}