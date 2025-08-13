import React from 'react';
import { View, ViewProps } from 'react-native';
import { Text } from './Text';
import { createVariants, cn } from '../../lib/utils';
import { colors, borderRadius, spacing, typography } from '../../lib/tokens';

const badgeVariants = createVariants({
  base: {
    alignItems: 'center' as const,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    flexDirection: 'row' as const,
  },
  variants: {
    variant: {
      default: {
        backgroundColor: colors.primary.DEFAULT,
      },
      secondary: {
        backgroundColor: colors.secondary.DEFAULT,
      },
      destructive: {
        backgroundColor: colors.destructive.DEFAULT,
      },
      outline: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const badgeTextVariants = createVariants({
  base: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    textAlign: 'center' as const,
  },
  variants: {
    variant: {
      default: {
        color: colors.primary.foreground,
      },
      secondary: {
        color: colors.secondary.foreground,
      },
      destructive: {
        color: colors.destructive.foreground,
      },
      outline: {
        color: colors.foreground,
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ style, variant, children, ...props }, ref) => {
    const badgeStyle = badgeVariants({ variant });
    const textStyle = badgeTextVariants({ variant });

    return (
      <View
        ref={ref}
        style={cn(badgeStyle, style)}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </View>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
