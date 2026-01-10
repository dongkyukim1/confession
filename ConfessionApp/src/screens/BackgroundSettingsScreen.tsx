/**
 * BackgroundSettingsScreen - 배경 커스터마이징 설정 화면
 * 
 * 사용자가 앱 배경을 선택하고 데코레이션을 조절할 수 있는 화면
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useBackground} from '../contexts/BackgroundContext';
import {useTheme} from '../contexts/ThemeContext';
import {BackgroundPreset, BACKGROUND_CATEGORIES} from '../theme/backgrounds';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2;

export default function BackgroundSettingsScreen() {
  const navigation = useNavigation();
  const {
    currentSettings,
    currentPreset,
    allPresets,
    setBackgroundPreset,
    updateOpacity,
    updateBlur,
    updateOverlay,
    resetToDefault,
  } = useBackground();
  const {colors} = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const [localOpacity, setLocalOpacity] = useState(currentSettings.opacity);
  const [localBlur, setLocalBlur] = useState(currentSettings.blur);

  const neutral50 = typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA';
  const neutral100 = typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5';
  const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5';
  const neutral400 = typeof colors.neutral === 'object' ? colors.neutral[400] : '#9CA3AF';
  const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';
  const neutral600 = typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252';
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';

  const styles = getStyles(colors, neutral50, neutral100, neutral200, neutral400, neutral500, neutral600, neutral700);

  // 카테고리별 프리셋 필터링
  const filteredPresets = allPresets.filter(
    preset => preset.category === selectedCategory,
  );

  // 배경 선택 핸들러
  const handleSelectPreset = async (presetId: string) => {
    await setBackgroundPreset(presetId);
  };

  // 투명도 변경 핸들러
  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value);
  };

  const handleOpacityComplete = async (value: number) => {
    await updateOpacity(value);
  };

  // 블러 변경 핸들러
  const handleBlurChange = (value: number) => {
    setLocalBlur(value);
  };

  const handleBlurComplete = async (value: number) => {
    await updateBlur(value);
  };

  // 초기화 핸들러
  const handleReset = async () => {
    await resetToDefault();
    setLocalOpacity(1);
    setLocalBlur(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={neutral700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>배경 커스터마이징</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 미리보기 섹션 */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>미리보기</Text>
          <View style={styles.previewContainer}>
            {currentPreset.type === 'image' && currentPreset.imageSource ? (
              <ImageBackground
                source={currentPreset.imageSource}
                style={styles.previewImage}
                resizeMode="cover"
                blurRadius={localBlur}>
                {localOpacity < 1 && (
                  <View
                    style={[
                      styles.previewOpacity,
                      {opacity: 1 - localOpacity},
                    ]}
                  />
                )}
              </ImageBackground>
            ) : (
              <View style={[styles.previewImage, {backgroundColor: neutral50}]} />
            )}
            <View style={styles.previewLabel}>
              <Text style={styles.previewLabelText}>{currentPreset.displayName}</Text>
            </View>
          </View>
        </View>

        {/* 카테고리 탭 */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabs}>
            {BACKGROUND_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}>
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  color={
                    selectedCategory === category.id
                      ? colors.primary
                      : neutral500
                  }
                />
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === category.id &&
                      styles.categoryTabTextActive,
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 배경 프리셋 그리드 */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>배경 선택</Text>
          <View style={styles.presetsGrid}>
            {filteredPresets.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={currentPreset.id === preset.id}
                onPress={() => handleSelectPreset(preset.id)}
                styles={styles}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* 데코레이션 조절 */}
        {currentPreset.type !== 'default' && (
          <View style={styles.decorationSection}>
            <Text style={styles.sectionTitle}>데코레이션</Text>

            {/* 투명도 슬라이더 */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelContainer}>
                  <Ionicons name="water-outline" size={20} color={neutral500} />
                  <Text style={styles.sliderLabel}>투명도</Text>
                </View>
                <Text style={styles.sliderValue}>
                  {Math.round(localOpacity * 100)}%
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                {[0, 0.25, 0.5, 0.75, 1].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.valueButton,
                      localOpacity === value && styles.valueButtonActive,
                    ]}
                    onPress={() => {
                      handleOpacityChange(value);
                      handleOpacityComplete(value);
                    }}>
                    <Text
                      style={[
                        styles.valueButtonText,
                        localOpacity === value && styles.valueButtonTextActive,
                      ]}>
                      {Math.round(value * 100)}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 블러 버튼 */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <View style={styles.sliderLabelContainer}>
                  <Ionicons name="aperture-outline" size={20} color={neutral500} />
                  <Text style={styles.sliderLabel}>블러</Text>
                </View>
                <Text style={styles.sliderValue}>{Math.round(localBlur)}</Text>
              </View>
              <View style={styles.buttonGroup}>
                {[0, 5, 10, 15, 20].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.valueButton,
                      localBlur === value && styles.valueButtonActive,
                    ]}
                    onPress={() => {
                      handleBlurChange(value);
                      handleBlurComplete(value);
                    }}>
                    <Text
                      style={[
                        styles.valueButtonText,
                        localBlur === value && styles.valueButtonTextActive,
                      ]}>
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * 프리셋 카드 컴포넌트
 */
function PresetCard({
  preset,
  isSelected,
  onPress,
  styles,
  colors,
}: {
  preset: BackgroundPreset;
  isSelected: boolean;
  onPress: () => void;
  styles: any;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[styles.presetCard, isSelected && styles.presetCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}>
      {preset.type === 'image' && preset.imageSource ? (
        <ImageBackground
          source={preset.imageSource}
          style={styles.presetCardImage}
          resizeMode="cover">
          {isSelected && (
            <View style={styles.presetCardCheck}>
              <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            </View>
          )}
        </ImageBackground>
      ) : (
        <View
          style={[
            styles.presetCardImage,
            {backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA'},
          ]}>
          {isSelected && (
            <View style={styles.presetCardCheck}>
              <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
            </View>
          )}
        </View>
      )}
      <View style={styles.presetCardInfo}>
        <Text style={styles.presetCardName} numberOfLines={1}>
          {preset.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * 스타일
 */
const getStyles = (
  colors: any,
  neutral50: string,
  neutral100: string,
  neutral200: string,
  neutral400: string,
  neutral500: string,
  neutral600: string,
  neutral700: string,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: neutral50,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8,
      paddingBottom: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: neutral200,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: neutral700,
    },
    resetButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    previewSection: {
      paddingHorizontal: 24,
      paddingTop: 24,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: neutral700,
      marginBottom: 16,
    },
    previewContainer: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    previewOpacity: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#FFFFFF',
    },
    previewLabel: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    previewLabelText: {
      fontSize: 14,
      fontWeight: '600',
      color: neutral700,
      textAlign: 'center',
    },
    categorySection: {
      marginBottom: 24,
    },
    categoryTabs: {
      paddingHorizontal: 24,
      gap: 12,
    },
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: neutral100,
    },
    categoryTabActive: {
      backgroundColor: typeof colors.primaryScale === 'object' ? colors.primaryScale[100] : '#EEF2FF',
    },
    categoryTabText: {
      fontSize: 14,
      fontWeight: '500',
      color: neutral500,
    },
    categoryTabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    presetsSection: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    presetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    presetCard: {
      width: CARD_WIDTH,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      overflow: 'hidden',
    },
    presetCardSelected: {
      borderWidth: 3,
      borderColor: colors.primary,
    },
    presetCardImage: {
      width: '100%',
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    presetCardCheck: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: 4,
    },
    presetCardInfo: {
      padding: 12,
    },
    presetCardName: {
      fontSize: 14,
      fontWeight: '600',
      color: neutral700,
      textAlign: 'center',
    },
    decorationSection: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    sliderContainer: {
      marginBottom: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sliderLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sliderLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: neutral700,
    },
    sliderValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    valueButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: neutral100,
      alignItems: 'center',
    },
    valueButtonActive: {
      backgroundColor: colors.primary,
    },
    valueButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: neutral600,
    },
    valueButtonTextActive: {
      color: '#FFFFFF',
    },
    bottomSpacing: {
      height: 20,
    },
  });
