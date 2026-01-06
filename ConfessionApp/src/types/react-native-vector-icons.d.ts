/**
 * Type declarations for react-native-vector-icons
 */
declare module 'react-native-vector-icons/Ionicons' {
  import {Component} from 'react';
  import {TextStyle, ViewStyle} from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export default class Ionicons extends Component<IconProps> {}
}

