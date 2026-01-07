/**
 * 고백 카드 공통 컴포넌트
 * 
 * 미니멀하고 세련된 디자인의 일기 카드
 * 리치 컨텐츠 표시 지원 (이미지, 서식, 기분 배지)
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

interface ConfessionCardProps {
  content: string;
  timestamp: string;
  viewCount?: number;
  onPress?: () => void;
  showViewCount?: boolean;
  mood?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  index?: number;
}

const {width} = Dimensions.get('window');

export default function ConfessionCard({
  content,
  timestamp,
  viewCount,
  onPress,
  showViewCount = true,
  mood,
  images,
  tags,
  index = 0,
}: ConfessionCardProps) {
  const {colors} = useTheme();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  /**
   * 시간 포맷팅
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const styles = getStyles(colors);

  const CardContent = (
    <View style={styles.card}>
      {/* 일기 내용 */}
      <Text style={styles.content} numberOfLines={4}>
        {content}
      </Text>
      
      {/* 이미지 갤러리 */}
      {images && images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesGallery}
          contentContainerStyle={styles.imagesContent}>
          {images.map((uri, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSelectedImageIndex(idx);
                setImageModalVisible(true);
              }}
              activeOpacity={0.8}>
              <Image 
                source={{uri}} 
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 태그와 기분 아이콘 */}
      <View style={styles.tagsRow}>
        {/* 태그 */}
        {tags && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
            )}
          </View>
        )}
        
        {/* 기분 배지 */}
        {mood && (
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{mood}</Text>
          </View>
        )}
      </View>
      
      {/* 푸터 */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        {showViewCount && viewCount !== undefined && (
          <View style={styles.viewCountContainer}>
            <Text style={styles.viewIcon}>👁️</Text>
            <Text style={styles.viewCount}>{viewCount}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const Content = (
    <>
      {CardContent}
      
      {/* 이미지 확대 모달 */}
      {images && images.length > 0 && (
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}>
          <View style={styles.imageModalContainer}>
            <TouchableOpacity
              style={styles.imageModalOverlay}
              activeOpacity={1}
              onPress={() => setImageModalVisible(false)}>
              <View style={styles.imageModalContent}>
                <Image
                  source={{uri: images[selectedImageIndex]}}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                
                {/* 이미지 카운터 */}
                {images.length > 1 && (
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {selectedImageIndex + 1} / {images.length}
                    </Text>
                  </View>
                )}
                
                {/* 이미지 네비게이션 */}
                {images.length > 1 && (
                  <View style={styles.imageNavigation}>
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev > 0 ? prev - 1 : images.length - 1
                        );
                      }}
                      activeOpacity={0.7}>
                      <Ionicons name="chevron-back" size={32} color={colors.surface} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.navButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) =>
                          prev < images.length - 1 ? prev + 1 : 0
                        );
                      }}
                      activeOpacity={0.7}>
                      <Ionicons name="chevron-forward" size={32} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            {/* 닫기 버튼 */}
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalVisible(false)}
              activeOpacity={0.7}>
              <Ionicons name="close" size={28} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    ...typography.styles.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  imagesGallery: {
    marginBottom: spacing.md,
  },
  imagesContent: {
    gap: spacing.sm,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
    alignItems: 'center',
  },
  moodBadge: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
    marginLeft: spacing.sm,
  },
  moodEmoji: {
    fontSize: 20,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 11,
    color: colors.surface,
    fontWeight: typography.fontWeight.semibold,
  },
  moreTagsText: {
    ...typography.styles.caption,
    color: colors.textTertiary,
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timestamp: {
    ...typography.styles.small,
    color: colors.textTertiary,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewIcon: {
    fontSize: 12,
  },
  viewCount: {
    ...typography.styles.small,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.semibold,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.95,
    height: width * 0.95,
  },
  imageCounter: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  imageCounterText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: typography.fontWeight.semibold,
  },
  imageNavigation: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  navButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


