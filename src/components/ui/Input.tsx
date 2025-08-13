import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';
import { colors, borderRadius, spacing, typography } from '../../lib/tokens';

interface InputProps extends TextInputProps {
  error?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ style, error, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        style={cn(
          {
            borderWidth: 1,
            borderColor: error ? colors.destructive.DEFAULT : colors.input,
            backgroundColor: colors.background,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[3],
            fontSize: typography.sm,
            color: colors.foreground,
            minHeight: 44, // iOS recommended touch target
          },
          // Focus styles would be handled via onFocus/onBlur if needed
          style
        )}
        placeholderTextColor={colors.muted.foreground}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
