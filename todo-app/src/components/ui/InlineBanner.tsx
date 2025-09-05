import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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
    switch (variant) {
      case 'success':
        return styles.successVariant;
      case 'danger':
        return styles.dangerVariant;
      case 'warning':
        return styles.warningVariant;
      case 'info':
        return styles.infoVariant;
      default:
        return styles.infoVariant;
    }
  };

  const getTitleTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successTitle;
      case 'danger':
        return styles.dangerTitle;
      case 'warning':
        return styles.warningTitle;
      case 'info':
        return styles.infoTitle;
      default:
        return styles.infoTitle;
    }
  };

  const getMessageTextStyle = () => {
    switch (variant) {
      case 'success':
        return styles.successMessage;
      case 'danger':
        return styles.dangerMessage;
      case 'warning':
        return styles.warningMessage;
      case 'info':
        return styles.infoMessage;
      default:
        return styles.infoMessage;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return '#16A34A';
      case 'danger':
        return '#DC2626';
      case 'warning':
        return '#D97706';
      case 'info':
        return '#2563EB';
      default:
        return '#2563EB';
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

  return (
    <View style={[styles.banner, getVariantStyle()]}>
      <View style={styles.bannerContent}>
        {/* Icon */}
        {showIcon && (
          <View style={styles.iconContainer}>
            <IconComponent 
              size={18} 
              color={getIconColor()} 
              strokeWidth={1.75}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.titleText, getTitleTextStyle()]}>
            {title}
          </Text>
          
          {message && (
            <Text style={[styles.messageText, getMessageTextStyle()]}>
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
              <Text style={[styles.actionText, getTitleTextStyle()]}>
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
              color={getIconColor()} 
              strokeWidth={1.75}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 14,
    marginTop: 4,
  },
  actionButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  dismissButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
  },
  // Variant styles
  successVariant: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  dangerVariant: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  warningVariant: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
  },
  infoVariant: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  // Title text colors
  successTitle: {
    color: '#166534',
  },
  dangerTitle: {
    color: '#DC2626',
  },
  warningTitle: {
    color: '#D97706',
  },
  infoTitle: {
    color: '#2563EB',
  },
  // Message text colors
  successMessage: {
    color: '#15803D',
  },
  dangerMessage: {
    color: '#DC2626',
  },
  warningMessage: {
    color: '#D97706',
  },
  infoMessage: {
    color: '#2563EB',
  },
});