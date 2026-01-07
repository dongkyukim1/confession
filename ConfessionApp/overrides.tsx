/**
 * React Native 기본 컴포넌트 오버라이드
 * Text와 TextInput에 전역 폰트 적용
 */
import React from 'react';
import {Text as RNText, TextInput as RNTextInput} from 'react-native';

// 원본 컴포넌트 저장
const OriginalText = RNText;
const OriginalTextInput = RNTextInput;

// Text 오버라이드
const TextWithFont = (props: any) => {
  const {style, ...otherProps} = props;
  
  // 전역 폰트 적용을 위해 style을 확인
  if (global.appFontFamily) {
    return <OriginalText {...otherProps} style={[{fontFamily: global.appFontFamily}, style]} />;
  }
  
  return <OriginalText {...props} />;
};

// TextInput 오버라이드
const TextInputWithFont = (props: any) => {
  const {style, ...otherProps} = props;
  
  // 전역 폰트 적용
  if (global.appFontFamily) {
    return <OriginalTextInput {...otherProps} style={[{fontFamily: global.appFontFamily}, style]} />;
  }
  
  return <OriginalTextInput {...props} />;
};

// 프로퍼티 복사
Object.assign(TextWithFont, OriginalText);
Object.assign(TextInputWithFont, OriginalTextInput);

// 글로벌 변수 타입 선언
declare global {
  var appFontFamily: string | undefined;
}

// 모듈 교체
(RNText as any) = TextWithFont;
(RNTextInput as any) = TextInputWithFont;

export {};

