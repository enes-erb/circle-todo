import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  rightIcon?: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  variant?: 'default' | 'filled' | 'outlined';
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
  ...props 
}: TextFieldProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return { backgroundColor: theme.colors.backgroundSecondary, borderWidth: 0 };
      case 'outlined':
        return { backgroundColor: 'transparent', borderWidth: 2 };
      default:
        return { backgroundColor: theme.colors.surface, borderWidth: 1 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 };
      case 'lg':
        return { paddingHorizontal: 20, paddingVertical: 16, fontSize: 18 };
      default:
        return { paddingHorizontal: 20, paddingVertical: 12, fontSize: 16 };
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
    return theme.colors.textSecondary;
  };

  const getIconPosition = () => {
    switch (size) {
      case 'sm':
        return { left: 12, right: 12 };
      case 'lg':
        return { left: 20, right: 20 };
      default:
        return { left: 16, right: 16 };
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
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      borderRadius: 12,
      color: theme.colors.textPrimary,
      fontWeight: 'normal',
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
      fontSize: 12,
      color: theme.colors.error,
      marginTop: 4,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
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
        <TextInput
          style={[
            styles.input,
            getVariantStyle(),
            getSizeStyle(),
            { borderColor: getBorderColor() },
            getInputPadding(),
            style
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
              strokeWidth={1.75} 
            />
          </View>
        )}
        
        {RightIcon && (
          <View style={[styles.rightIcon, { right: getIconPosition().right }]}>
            <RightIcon 
              size={size === 'sm' ? 16 : size === 'lg' ? 22 : 20} 
              color={getIconColor()} 
              strokeWidth={1.75} 
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