import React, { useEffect, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { AnimatedView } from './AnimatedView';

interface FadeInListProps extends ViewProps {
  children: React.ReactNode[];
  stagger?: number;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'slideInRight' | 'slideInLeft' | 'scale';
  duration?: number;
}

export const FadeInList: React.FC<FadeInListProps> = ({
  children,
  stagger = 100,
  animation = 'fadeInUp',
  duration = 400,
  style,
  ...props
}) => {
  return (
    <View style={style} {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimatedView
          key={index}
          animation={animation}
          duration={duration}
          delay={index * stagger}
        >
          {child}
        </AnimatedView>
      ))}
    </View>
  );
};
