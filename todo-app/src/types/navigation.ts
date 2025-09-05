import type { BottomTabScreenProps as RNBottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
  AddTodo: { groupId?: string } | undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Groups: undefined;
  Settings: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, Screen>;

export type BottomTabScreenProps<Screen extends keyof BottomTabParamList> = 
  CompositeScreenProps<
    RNBottomTabScreenProps<BottomTabParamList, Screen>,
    StackScreenProps<RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}