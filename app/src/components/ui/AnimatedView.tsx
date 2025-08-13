import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps, Easing } from 'react-native';
import { createAnimatedValue, runAnimation } from '../../lib/animations';

interface AnimatedViewProps extends ViewProps {
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInRight' | 'slideInLeft' | 'scale';
  duration?: number;
  delay?: number;
  children?: React.ReactNode;
  onAnimationComplete?: () => void;
}

const getAnimationConfig = (animation: string, duration: number) => {
  switch (animation) {
    case 'fadeIn':
      return {
        opacity: { from: 0, to: 1, duration, easing: Easing.out(Easing.quad) },
      };
    case 'fadeInUp':
      return {
        opacity: { from: 0, to: 1, duration, easing: Easing.out(Easing.quad) },
        translateY: { from: 20, to: 0, duration, easing: Easing.out(Easing.back(1.2)) },
      };
    case 'fadeInDown':
      return {
        opacity: { from: 0, to: 1, duration, easing: Easing.out(Easing.quad) },
        translateY: { from: -20, to: 0, duration, easing: Easing.out(Easing.back(1.2)) },
      };
    case 'slideInRight':
      return {
        translateX: { from: 100, to: 0, duration, easing: Easing.out(Easing.quad) },
      };
    case 'slideInLeft':
      return {
        translateX: { from: -100, to: 0, duration, easing: Easing.out(Easing.quad) },
      };
    case 'scale':
      return {
        scale: { from: 0.9, to: 1, duration, easing: Easing.out(Easing.back(1.2)) },
      };
    default:
      return {
        opacity: { from: 0, to: 1, duration, easing: Easing.out(Easing.quad) },
      };
  }
};

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  children,
  style,
  onAnimationComplete,
  ...props
}) => {
  const animatedValues = useRef({
    opacity: createAnimatedValue(1),
    translateY: createAnimatedValue(0),
    translateX: createAnimatedValue(0),
    scale: createAnimatedValue(1),
  }).current;

  useEffect(() => {
    const config = getAnimationConfig(animation, duration);
    const animations: Animated.CompositeAnimation[] = [];

    // Setup initial values and create animations
    Object.entries(config).forEach(([property, animConfig]) => {
      const { from, to, duration: animDuration, easing } = animConfig;
      
      if (property === 'opacity') {
        animatedValues.opacity.setValue(from);
        animations.push(
          runAnimation(animatedValues.opacity, {
            toValue: to,
            duration: animDuration,
            easing,
          })
        );
      } else if (property === 'translateY') {
        animatedValues.translateY.setValue(from);
        animations.push(
          runAnimation(animatedValues.translateY, {
            toValue: to,
            duration: animDuration,
            easing,
          })
        );
      } else if (property === 'translateX') {
        animatedValues.translateX.setValue(from);
        animations.push(
          runAnimation(animatedValues.translateX, {
            toValue: to,
            duration: animDuration,
            easing,
          })
        );
      } else if (property === 'scale') {
        animatedValues.scale.setValue(from);
        animations.push(
          runAnimation(animatedValues.scale, {
            toValue: to,
            duration: animDuration,
            easing,
          })
        );
      }
    });

    // Run animations with delay
    const animationSequence = Animated.parallel(animations);
    
    if (delay > 0) {
      Animated.sequence([
        Animated.delay(delay),
        animationSequence,
      ]).start(onAnimationComplete);
    } else {
      animationSequence.start(onAnimationComplete);
    }
  }, [animation, duration, delay]);

  const animatedStyle = {
    opacity: animatedValues.opacity,
    transform: [
      { translateY: animatedValues.translateY },
      { translateX: animatedValues.translateX },
      { scale: animatedValues.scale },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
