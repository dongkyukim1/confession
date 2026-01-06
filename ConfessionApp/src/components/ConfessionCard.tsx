/**
 * 고백 카드 공통 컴포넌트
 * 
 * 미니멀하고 세련된 디자인의 일기 카드
 * 리치 컨텐츠 표시 지원 (이미지, 서식, 기분 배지)
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
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
            <Image key={idx} source={{uri}} style={styles.galleryImage} />
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

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
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
});


