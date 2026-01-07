/**
 * @format
 */

import { AppRegistry, Text, TextInput } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// 전역 폰트 설정을 위한 Text/TextInput 기본 속성 설정
const defaultFontFamily = 'Roboto'; // Android 기본 폰트

// Text 기본 속성
if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.style = { fontFamily: defaultFontFamily };

// TextInput 기본 속성
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}
TextInput.defaultProps.style = { fontFamily: defaultFontFamily };

AppRegistry.registerComponent(appName, () => App);
