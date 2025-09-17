import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationHeight } from '../contexts/NavigationHeightContext';

export const useContentPadding = () => {
  const { bottom } = useSafeAreaInsets();
  const { height: navHeight } = useNavigationHeight();
  
  // Navigation height + safe area bottom + extra spacing
  const contentPadding = navHeight + bottom + 16;
  
  return { contentPadding, navHeight, safeAreaBottom: bottom };
};