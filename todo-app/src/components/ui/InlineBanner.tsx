import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
// Removed - using theme.* properties directly

interface InlineBannerProps {
  title: string;
  message?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function InlineBanner({
  title,
  message,
  variant = 'info',
  showIcon = true,
  dismissible = false,
  onDismiss,
  action,
}: InlineBannerProps) {
  const { theme, isDark } = useTheme();
  
  const handleDismiss = () => {
    if (onDismiss) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDismiss();
    }
  };

  const handleAction = () => {
    if (action?.onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      action.onPress();
    }
  };

  const getVariantStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    };

    switch (variant) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : theme.colors.successBg + '20',
          borderColor: theme.colors.success + '30',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.errorBg + '20',
          borderColor: theme.colors.error + '30',
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : theme.colors.warningBg + '20',
          borderColor: theme.colors.warning + '30',
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : theme.colors.infoBg + '20',
          borderColor: theme.colors.info + '30',
        };
      default:
        return baseStyle;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success;
      case 'danger':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.info;
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return CheckCircle2;
      case 'danger':
        return AlertCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const IconComponent = getIcon();
  const iconColor = getIconColor();

  const styles = StyleSheet.create({
    bannerContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      marginRight: theme.spacing.md,
      marginTop: 2,
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
    contentContainer: {
      flex: 1,
    },
    titleText: {
      fontSize: theme.typography.sizes.md,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    messageText: {
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs / 2,
      lineHeight: 20,
    },
    actionButton: {
      marginTop: theme.spacing.sm,
      alignSelf: 'flex-start',
      paddingVertical: theme.spacing.xs / 2,
    },
    actionText: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: '600',
      color: iconColor,
      textDecorationLine: 'underline',
    },
    dismissButton: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
  });

  return (
    <View style={getVariantStyle()}>
      <View style={styles.bannerContent}>
        {/* Icon */}
        {showIcon && (
          <View style={styles.iconContainer}>
            <IconComponent 
              size={18} 
              color={iconColor} 
              strokeWidth={2}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>
            {title}
          </Text>
          
          {message && (
            <Text style={styles.messageText}>
              {message}
            </Text>
          )}

          {/* Action Button */}
          {action && (
            <TouchableOpacity
              onPress={handleAction}
              style={styles.actionButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text style={styles.actionText}>
                {action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dismiss Button */}
        {dismissible && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          >
            <X 
              size={16} 
              color={theme.colors.textMuted} 
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}