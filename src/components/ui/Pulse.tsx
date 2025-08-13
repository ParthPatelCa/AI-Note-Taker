import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';
import { createAnimatedValue, loopAnimation, runAnimation } from '../../lib/animations';

interface PulseProps extends ViewProps {
  children?: React.ReactNode;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  duration = 1000,
  minOpacity = 0.5,
  maxOpacity = 1,
  style,
  ...props
}) => {
  const pulseAnim = useRef(createAnimatedValue(minOpacity)).current;

  useEffect(() => {
    const pulseAnimation = runAnimation(pulseAnim, {
      toValue: maxOpacity,
      duration,
    });

    loopAnimation(pulseAnimation).start();
  }, [duration, minOpacity, maxOpacity]);

  return (
    <Animated.View
      style={[
        { opacity: pulseAnim },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};
