/**
 * BackgroundRenderer - 배경 렌더링 컴포넌트
 * 
 * Context에서 현재 배경 설정을 가져와서 화면 전체에 배경을 렌더링
 */
import React from 'react';
import {View, ImageBackground, StyleSheet, Dimensions} from 'react-native';
import {BlurView} from 'expo-blur';
import {useBackground} from '../contexts/BackgroundContext';
import {useTheme} from '../contexts/ThemeContext';

const {width, height} = Dimensions.get('window');

export const BackgroundRenderer = React.memo(() => {
  const {currentSettings, currentPreset} = useBackground();
  const {colors} = useTheme();

  // 기본 배경 (순백)
  if (currentPreset.type === 'default') {
    const bgColor =
      typeof colors.neutral === 'object' ? colors.neutral[50] : colors.background;
    return <View style={[styles.background, {backgroundColor: bgColor}]} />;
  }

  // 이미지 배경
  if (currentPreset.type === 'image' && currentPreset.imageSource) {
    return (
      <View style={styles.background}>
        <ImageBackground
          source={currentPreset.imageSource}
          style={styles.imageBackground}
          resizeMode="cover"
          blurRadius={currentSettings.blur}>
          {/* 투명도 레이어 */}
          {currentSettings.opacity < 1 && (
            <View
              style={[
                styles.opacityLayer,
                {
                  backgroundColor: '#FFFFFF',
                  opacity: 1 - currentSettings.opacity,
                },
              ]}
            />
          )}

          {/* 오버레이 레이어 (틴트) */}
          {currentSettings.overlayColor && currentSettings.overlayOpacity > 0 && (
            <View
              style={[
                styles.overlayLayer,
                {
                  backgroundColor: currentSettings.overlayColor,
                  opacity: currentSettings.overlayOpacity,
                },
              ]}
            />
          )}
        </ImageBackground>
      </View>
    );
  }

  // Fallback: 기본 배경
  const bgColor =
    typeof colors.neutral === 'object' ? colors.neutral[50] : colors.background;
  return <View style={[styles.background, {backgroundColor: bgColor}]} />;
});

BackgroundRenderer.displayName = 'BackgroundRenderer';

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    zIndex: -1,
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  opacityLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
