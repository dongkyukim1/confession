/**
 * CustomText - 폰트가 적용된 커스텀 Text 컴포넌트
 */
import React from 'react';
import {Text as RNText, TextProps, StyleSheet} from 'react-native';
import {useFont} from '../contexts/FontContext';

export default function CustomText(props: TextProps) {
  const {getFontFamily} = useFont();
  const {style, ...otherProps} = props;

  return (
    <RNText
      {...otherProps}
      style={[{fontFamily: getFontFamily()}, style]}
    />
  );
}

