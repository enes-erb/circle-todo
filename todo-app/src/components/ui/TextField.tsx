import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
// Removed - using theme.* properties directly

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  rightIcon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  variant?: 'default' | 'filled' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export function TextField({ 
  label, 
  error, 
  helper, 
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  variant = 'default',
  size = 'md',
  onFocus,
  onBlur,
  style,
  autoFocus = false,
  ...props 
}: TextFieldProps) {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onBlur?.(e);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderWidth: 1,
          borderColor: 'transparent',
        };
      case 'glass':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.md,
        };
      default:
        return { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : theme.colors.surface,
          borderWidth: 1,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { 
          paddingHorizontal: theme.spacing.md, 
          paddingVertical: theme.spacing.sm, 
          fontSize: theme.typography.sizes.sm 
        };
      case 'lg':
        return { 
          paddingHorizontal: theme.spacing.lg, 
          paddingVertical: theme.spacing.md, 
          fontSize: theme.typography.sizes.lg 
        };
      default:
        return { 
          paddingHorizontal: theme.spacing.lg, 
          paddingVertical: theme.spacing.sm + 4, 
          fontSize: theme.typography.sizes.md 
        };
    }
  };

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.accent;
    return theme.colors.border;
  };

  const getIconColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.accent;
    return theme.colors.textMuted;
  };

  const getIconPosition = () => {
    switch (size) {
      case 'sm':
        return { left: theme.spacing.md, right: theme.spacing.md };
      case 'lg':
        return { left: theme.spacing.lg, right: theme.spacing.lg };
      default:
        return { left: theme.spacing.md, right: theme.spacing.md };
    }
  };

  const getInputPadding = () => {
    const iconPos = getIconPosition();
    const leftPadding = LeftIcon ? iconPos.left + 32 : undefined;
    const rightPadding = RightIcon ? iconPos.right + 32 : undefined;
    return { paddingLeft: leftPadding, paddingRight: rightPadding };
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      borderRadius: theme.borderRadius.md,
      color: theme.colors.textPrimary,
      fontWeight: '400',
      ...getSizeStyle(),
      ...getVariantStyle(),
    },
    focusedInput: {
      borderColor: theme.colors.accent,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.colors.surface,
    },
    errorInput: {
      borderColor: theme.colors.error,
      backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    },
    leftIcon: {
      position: 'absolute',
      top: '50%',
      transform: [{ translateY: -10 }],
    },
    rightIcon: {
      position: 'absolute',
      top: '50%',
      transform: [{ translateY: -10 }],
    },
    errorText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.xs,
    },
    focusRing: {
      position: 'absolute',
      top: -1,
      left: -1,
      right: -1,
      bottom: -1,
      borderRadius: theme.borderRadius.md + 1,
      borderWidth: 1,
      borderColor: theme.colors.accent,
    },
  });

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        <Animated.View
          style={[
            styles.focusRing,
            {
              opacity: focusAnim,
              transform: [{
                scale: focusAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                }),
              }],
            },
          ]}
        />
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            { borderColor: getBorderColor() },
            getInputPadding(),
            isFocused && styles.focusedInput,
            error && styles.errorInput,
            style
          ]}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          accessibilityLabel={label}
          accessibilityHint={helper}
          accessibilityState={{ 
            disabled: props.editable === false
          }}
          {...props}
        />
        
        {LeftIcon && (
          <View style={[styles.leftIcon, { left: getIconPosition().left }]}>
            <LeftIcon 
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 20} 
              color={getIconColor()} 
              strokeWidth={1.5} 
            />
          </View>
        )}
        
        {RightIcon && (
          <View style={[styles.rightIcon, { right: getIconPosition().right }]}>
            <RightIcon 
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 20} 
              color={getIconColor()} 
              strokeWidth={1.5} 
            />
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      {helper && !error && (
        <Text style={styles.helperText}>
          {helper}
        </Text>
      )}
    </View>
  );
}