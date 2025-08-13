import { Animated, Easing } from 'react-native';

// Animation presets inspired by popular libraries
export const animationPresets = {
  // Entrance animations
  fadeIn: (duration = 300) => ({
    opacity: {
      from: 0,
      to: 1,
      duration,
      easing: Easing.out(Easing.quad),
    },
  }),
  
  fadeInUp: (duration = 400) => ({
    opacity: {
      from: 0,
      to: 1,
      duration,
      easing: Easing.out(Easing.quad),
    },
    transform: {
      translateY: {
        from: 20,
        to: 0,
        duration,
        easing: Easing.out(Easing.back(1.2)),
      },
    },
  }),
  
  fadeInDown: (duration = 400) => ({
    opacity: {
      from: 0,
      to: 1,
      duration,
      easing: Easing.out(Easing.quad),
    },
    transform: {
      translateY: {
        from: -20,
        to: 0,
        duration,
        easing: Easing.out(Easing.back(1.2)),
      },
    },
  }),
  
  slideInRight: (duration = 300) => ({
    transform: {
      translateX: {
        from: 100,
        to: 0,
        duration,
        easing: Easing.out(Easing.quad),
      },
    },
  }),
  
  slideInLeft: (duration = 300) => ({
    transform: {
      translateX: {
        from: -100,
        to: 0,
        duration,
        easing: Easing.out(Easing.quad),
      },
    },
  }),
  
  scale: (duration = 200) => ({
    transform: {
      scale: {
        from: 0.9,
        to: 1,
        duration,
        easing: Easing.out(Easing.back(1.2)),
      },
    },
  }),
  
  // Exit animations
  fadeOut: (duration = 200) => ({
    opacity: {
      from: 1,
      to: 0,
      duration,
      easing: Easing.in(Easing.quad),
    },
  }),
  
  // Loading animations
  pulse: {
    transform: {
      scale: {
        from: 1,
        to: 1.05,
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        loop: true,
        reverse: true,
      },
    },
  },
  
  bounce: {
    transform: {
      translateY: {
        from: 0,
        to: -5,
        duration: 600,
        easing: Easing.inOut(Easing.sin),
        loop: true,
        reverse: true,
      },
    },
  },
  
  // Press animations
  pressScale: (duration = 100) => ({
    transform: {
      scale: {
        from: 1,
        to: 0.95,
        duration,
        easing: Easing.out(Easing.quad),
      },
    },
  }),
};

// Utility function to create animated values
export const createAnimatedValue = (initialValue = 0) => new Animated.Value(initialValue);

// Utility function to run animations
export const runAnimation = (
  animatedValue: Animated.Value,
  config: {
    toValue: number;
    duration?: number;
    easing?: (value: number) => number;
    delay?: number;
    useNativeDriver?: boolean;
  }
) => {
  return Animated.timing(animatedValue, {
    useNativeDriver: true,
    ...config,
  });
};

// Staggered animations for lists
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  stagger = 100
) => {
  return Animated.stagger(stagger, animations);
};

// Sequence animations
export const sequenceAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations);
};

// Parallel animations
export const parallelAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

// Spring animation utility
export const springAnimation = (
  animatedValue: Animated.Value,
  config: {
    toValue: number;
    tension?: number;
    friction?: number;
    useNativeDriver?: boolean;
  }
) => {
  return Animated.spring(animatedValue, {
    useNativeDriver: true,
    tension: 100,
    friction: 8,
    ...config,
  });
};

// Loop animation utility
export const loopAnimation = (
  animation: Animated.CompositeAnimation,
  iterations = -1
) => {
  return Animated.loop(animation, { iterations });
};
