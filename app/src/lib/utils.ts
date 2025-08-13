import { colors, spacing, borderRadius, typography, shadows } from './tokens';

// Utility function to create variant styles (like cva)
type VariantConfig<T extends Record<string, any>> = {
  base?: any;
  variants?: T;
  defaultVariants?: Partial<{
    [K in keyof T]: keyof T[K];
  }>;
};

export function createVariants<T extends Record<string, any>>(
  config: VariantConfig<T>
) {
  return (props: Partial<{ [K in keyof T]: keyof T[K] }> = {}) => {
    const mergedProps = { ...config.defaultVariants, ...props };
    let styles = config.base || {};

    for (const [variantKey, variantValue] of Object.entries(mergedProps)) {
      if (config.variants?.[variantKey]?.[variantValue as string]) {
        styles = {
          ...styles,
          ...config.variants[variantKey][variantValue as string],
        };
      }
    }

    return styles;
  };
}

// Common style utilities
export const cn = (...styles: any[]) => {
  return Object.assign({}, ...styles.filter(Boolean));
};

// Design system utilities
export const getColor = (color: string) => {
  const colorPath = color.split('.');
  let result: any = colors;
  
  for (const path of colorPath) {
    result = result[path];
    if (result === undefined) return color;
  }
  
  return result;
};

export const getSpacing = (space: keyof typeof spacing) => spacing[space];
export const getBorderRadius = (radius: keyof typeof borderRadius) => borderRadius[radius];
export const getShadow = (shadow: keyof typeof shadows) => shadows[shadow];
