import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewProps, DimensionValue } from 'react-native';
import { colors, borderRadius, spacing } from '../../lib/tokens';
import { createAnimatedValue, loopAnimation, runAnimation } from '../../lib/animations';

interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: skeletonBorderRadius = borderRadius.md,
  animated = true,
  style,
  ...props
}) => {
  const shimmerAnim = useRef(createAnimatedValue(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = runAnimation(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      });

      loopAnimation(shimmerAnimation).start();
    }
  }, [animated]);

  const shimmerStyle = animated ? {
    backgroundColor: shimmerAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [colors.gray[200], colors.gray[100], colors.gray[200]],
    }),
  } : {
    backgroundColor: colors.gray[200],
  };

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: skeletonBorderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: DimensionValue;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 20,
  lastLineWidth = '60%',
}) => {
  return (
    <View style={{ gap: spacing[2] }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  avatarSize?: number;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  avatarSize = 40,
  lines = 3,
}) => {
  return (
    <View style={{ padding: spacing[4] }}>
      <View style={{ flexDirection: 'row', marginBottom: spacing[3] }}>
        {showAvatar && (
          <Skeleton
            width={avatarSize}
            height={avatarSize}
            borderRadius={avatarSize / 2}
            style={{ marginRight: spacing[3] }}
          />
        )}
        <View style={{ flex: 1 }}>
          <Skeleton height={16} width="40%" style={{ marginBottom: spacing[2] }} />
          <Skeleton height={12} width="25%" />
        </View>
      </View>
      <SkeletonText lines={lines} />
    </View>
  );
};
