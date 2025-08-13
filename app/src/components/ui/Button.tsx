import React, { useRef } from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps, Animated } from 'react-native';
import { createVariants, cn } from '../../lib/utils';
import { colors, borderRadius, spacing, typography, shadows } from '../../lib/tokens';
import { createAnimatedValue, springAnimation } from '../../lib/animations';

const buttonVariants = createVariants({
  base: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row' as const,
  },
  variants: {
    variant: {
      default: {
        backgroundColor: colors.primary.DEFAULT,
        ...shadows.sm,
      },
      destructive: {
        backgroundColor: colors.destructive.DEFAULT,
        ...shadows.sm,
      },
      outline: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        ...shadows.sm,
      },
      secondary: {
        backgroundColor: colors.secondary.DEFAULT,
        ...shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      link: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
    },
    size: {
      default: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        minHeight: 44, // iOS recommended touch target
      },
      sm: {
        paddingHorizontal: spacing[3],
        paddingVertical: spacing[2],
        minHeight: 36,
      },
      lg: {
        paddingHorizontal: spacing[6],
        paddingVertical: spacing[4],
        minHeight: 52,
      },
      icon: {
        width: 44,
        height: 44,
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = createVariants({
  base: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    textAlign: 'center' as const,
  },
  variants: {
    variant: {
      default: {
        color: colors.primary.foreground,
      },
      destructive: {
        color: colors.destructive.foreground,
      },
      outline: {
        color: colors.foreground,
      },
      secondary: {
        color: colors.secondary.foreground,
      },
      ghost: {
        color: colors.foreground,
      },
      link: {
        color: colors.blue,
        textDecorationLine: 'underline',
      },
    },
    size: {
      default: {
        fontSize: typography.sm,
      },
      sm: {
        fontSize: typography.xs,
      },
      lg: {
        fontSize: typography.base,
      },
      icon: {
        fontSize: typography.lg,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children?: React.ReactNode;
  style?: any;
  textStyle?: any;
}

export const Button = React.forwardRef<any, ButtonProps>(
  ({ variant, size, loading, children, style, textStyle, disabled, ...props }, ref) => {
    const buttonStyle = buttonVariants({ variant, size });
    const textStyleVariant = buttonTextVariants({ variant, size });
    const scaleAnim = useRef(createAnimatedValue(1)).current;

    const isDisabled = disabled || loading;
    const finalButtonStyle = cn(
      buttonStyle,
      isDisabled && { opacity: 0.6 },
      style
    );

    const handlePressIn = () => {
      springAnimation(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 10,
      }).start();
    };

    const handlePressOut = () => {
      springAnimation(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          ref={ref}
          style={finalButtonStyle}
          disabled={isDisabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...props}
        >
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={textStyleVariant.color} 
              style={{ marginRight: spacing[2] }}
            />
          )}
          {typeof children === 'string' ? (
            <Text style={cn(textStyleVariant, textStyle)}>
              {children}
            </Text>
          ) : (
            children
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';
