import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Destination } from '../types';

export type RootStackParamList = {
  Map: undefined;
  Destination: undefined;
  Navigate: { destination: Destination };
  Settings: undefined;
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
