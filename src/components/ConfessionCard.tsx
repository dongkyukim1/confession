/**
 * 고백 카드 공통 컴포넌트
 * 
 * 깔끔한 카드 형식으로 고백 내용을 표시합니다.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface ConfessionCardProps {
  content: string;
  timestamp: string;
  viewCount?: number;
  onPress?: () => void;
  showViewCount?: boolean;
}

const {width} = Dimensions.get('window');

export default function ConfessionCard({
  content,
  timestamp,
  viewCount,
  onPress,
  showViewCount = true,
}: ConfessionCardProps) {
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

  const CardContent = (
    <View style={styles.card}>
      <Text style={styles.content} numberOfLines={4}>
        {content}
      </Text>
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
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewIcon: {
    fontSize: 12,
  },
  viewCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
});

