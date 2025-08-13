import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { createVariants, cn } from '../../lib/utils';
import { colors, typography, spacing } from '../../lib/tokens';

const textVariants = createVariants({
  base: {
    color: colors.foreground,
  },
  variants: {
    variant: {
      default: {
        fontSize: typography.base,
        lineHeight: typography.base * typography.lineHeight.normal,
      },
      h1: {
        fontSize: typography['4xl'],
        fontWeight: typography.bold,
        lineHeight: typography['4xl'] * typography.lineHeight.tight,
      },
      h2: {
        fontSize: typography['3xl'],
        fontWeight: typography.semibold,
        lineHeight: typography['3xl'] * typography.lineHeight.tight,
      },
      h3: {
        fontSize: typography['2xl'],
        fontWeight: typography.semibold,
        lineHeight: typography['2xl'] * typography.lineHeight.tight,
      },
      h4: {
        fontSize: typography.xl,
        fontWeight: typography.semibold,
        lineHeight: typography.xl * typography.lineHeight.tight,
      },
      p: {
        fontSize: typography.base,
        lineHeight: typography.base * typography.lineHeight.normal,
      },
      blockquote: {
        fontSize: typography.base,
        fontStyle: 'italic',
        borderLeftWidth: 2,
        borderLeftColor: colors.border,
        paddingLeft: spacing[6],
        color: colors.muted.foreground,
      },
      lead: {
        fontSize: typography.xl,
        color: colors.muted.foreground,
        lineHeight: typography.xl * typography.lineHeight.relaxed,
      },
      large: {
        fontSize: typography.lg,
        fontWeight: typography.semibold,
      },
      small: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        lineHeight: typography.sm * typography.lineHeight.normal,
      },
      muted: {
        fontSize: typography.sm,
        color: colors.muted.foreground,
      },
    },
    align: {
      left: { textAlign: 'left' as const },
      center: { textAlign: 'center' as const },
      right: { textAlign: 'right' as const },
    },
  },
  defaultVariants: {
    variant: 'default',
    align: 'left',
  },
});

interface TextProps extends RNTextProps {
  variant?: 'default' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'lead' | 'large' | 'small' | 'muted';
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

const Text = React.forwardRef<RNText, TextProps>(
  ({ style, variant, align, ...props }, ref) => {
    const textStyle = textVariants({ variant, align });
    
    return (
      <RNText
        ref={ref}
        style={cn(textStyle, style)}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text };
