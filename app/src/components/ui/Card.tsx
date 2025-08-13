import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';
import { colors, borderRadius, spacing, shadows } from '../../lib/tokens';

interface CardProps extends ViewProps {
  children?: React.ReactNode;
}

const Card = React.forwardRef<View, CardProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={cn(
          {
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.sm,
          },
          style
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);

const CardHeader = React.forwardRef<View, CardProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={cn(
          {
            paddingHorizontal: spacing[6],
            paddingVertical: spacing[6],
            flexDirection: 'column',
            gap: spacing[2],
          },
          style
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);

const CardContent = React.forwardRef<View, CardProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={cn(
          {
            paddingHorizontal: spacing[6],
            paddingTop: 0,
            paddingBottom: spacing[6],
          },
          style
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);

const CardFooter = React.forwardRef<View, CardProps>(
  ({ style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={cn(
          {
            paddingHorizontal: spacing[6],
            paddingTop: 0,
            paddingBottom: spacing[6],
            flexDirection: 'row',
            alignItems: 'center',
          },
          style
        )}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
