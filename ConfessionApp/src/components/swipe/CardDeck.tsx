/**
 * 카드 덱 컴포넌트
 *
 * 여러 카드를 스택으로 관리하고 무한 스크롤 지원
 */

import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Confession} from '../../types';
import {SwipeResult} from '../../utils/gestureConfig';
import {animations} from '../../theme/animations';
import SwipeableCard from './SwipeableCard';

interface CardDeckProps {
  confessions: Confession[];
  onSwipe: (confession: Confession, result: SwipeResult) => void;
  onCardTap?: (confession: Confession) => void;
  onNeedMore?: () => void;
  renderCard: (confession: Confession) => React.ReactNode;
  minCardsThreshold?: number;
  maxVisibleCards?: number;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  confessions,
  onSwipe,
  onCardTap,
  onNeedMore,
  renderCard,
  minCardsThreshold = 3,
  maxVisibleCards = 3,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<Confession[]>([]);

  /**
   * 카드 덱 초기화
   */
  useEffect(() => {
    if (confessions.length > 0) {
      setCards(confessions);
    }
  }, [confessions]);

  /**
   * 카드 부족 감지
   */
  useEffect(() => {
    const remainingCards = cards.length - currentIndex;
    if (remainingCards <= minCardsThreshold && onNeedMore) {
      onNeedMore();
    }
  }, [currentIndex, cards.length, minCardsThreshold, onNeedMore]);

  /**
   * 스와이프 핸들러
   */
  const handleSwipe = useCallback(
    (confession: Confession, result: SwipeResult) => {
      // 콜백 호출
      onSwipe(confession, result);

      // 다음 카드로 이동
      setCurrentIndex(prev => prev + 1);
    },
    [onSwipe]
  );

  /**
   * 카드 탭 핸들러
   */
  const handleCardTap = useCallback(
    (confession: Confession) => {
      if (onCardTap) {
        onCardTap(confession);
      }
    },
    [onCardTap]
  );

  /**
   * 보이는 카드 계산
   */
  const visibleCards = cards.slice(currentIndex, currentIndex + maxVisibleCards);

  /**
   * 카드 스타일 계산
   */
  const getCardStyle = (index: number) => {
    const stackIndex = index - currentIndex;

    return {
      transform: [
        {scale: animations.card.stackScale[stackIndex] || 0.85},
        {translateY: animations.card.stackOffsetY[stackIndex] || -15},
      ],
      opacity: animations.card.stackOpacity[stackIndex] || 0.3,
    };
  };

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleCards.map((confession, idx) => {
        const absoluteIndex = currentIndex + idx;
        const isTopCard = idx === 0;

        return (
          <Animated.View
            key={confession.id}
            style={[styles.cardWrapper, !isTopCard && getCardStyle(absoluteIndex)]}
            pointerEvents={isTopCard ? 'auto' : 'none'}
          >
            <SwipeableCard
              confession={confession}
              onSwipe={(result) => handleSwipe(confession, result)}
              onTap={() => handleCardTap(confession)}
              isTopCard={isTopCard}
              index={idx}
              renderCard={renderCard}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default CardDeck;
