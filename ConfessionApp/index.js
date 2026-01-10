/**
 * @format
 */

import { AppRegistry } from 'react-native';
// import { setCustomText, setCustomTextInput } from 'react-native-global-props';
import App from './App';
import { name as appName } from './app.json';

// 전역 폰트 변수 초기화
global.__GLOBAL_FONT_FAMILY__ = 'Roboto';

// // 초기 전역 폰트 설정
// setCustomText({
//   style: {
//     fontFamily: 'Roboto',
//   }
// });

// setCustomTextInput({
//   style: {
//     fontFamily: 'Roboto',
//   }
// });

console.log('✅ 전역 폰트 초기화 완료');

AppRegistry.registerComponent(appName, () => App);
