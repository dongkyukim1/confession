/**
 * CustomTextInput - 폰트가 적용된 커스텀 TextInput 컴포넌트
 */
import React from 'react';
import {TextInput as RNTextInput, TextInputProps} from 'react-native';
import {useFont} from '../contexts/FontContext';

export default function CustomTextInput(props: TextInputProps) {
  const {getFontFamily} = useFont();
  const {style, ...otherProps} = props;

  return (
    <RNTextInput
      {...otherProps}
      style={[{fontFamily: getFontFamily()}, style]}
    />
  );
}

