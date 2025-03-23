'use client';

import { Box, BoxProps, forwardRef } from '@chakra-ui/react';

export interface CustomCardProps extends BoxProps {
  variant?: 'elevated' | 'outline' | 'filled' | 'unstyled';
  isHoverable?: boolean;
}

export const CustomCard = forwardRef<CustomCardProps, 'div'>((props, ref) => {
  const { 
    variant = 'elevated',
    isHoverable = false,
    children, 
    ...rest 
  } = props;

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          bg: 'white',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'lg',
          transition: 'box-shadow 0.2s, transform 0.2s',
          ...(isHoverable && {
            _hover: {
              boxShadow: 'var(--shadow-lg)',
              transform: 'translateY(-2px)',
            }
          })
        };
      case 'outline':
        return {
          bg: 'white',
          border: '1px solid',
          borderColor: 'gray.200',
          borderRadius: 'lg',
          transition: 'border-color 0.2s, transform 0.2s',
          ...(isHoverable && {
            _hover: {
              borderColor: 'primary.300',
              transform: 'translateY(-2px)',
            }
          })
        };
      case 'filled':
        return {
          bg: 'gray.50',
          borderRadius: 'lg',
          transition: 'background 0.2s, transform 0.2s',
          ...(isHoverable && {
            _hover: {
              bg: 'primary.50',
              transform: 'translateY(-2px)',
            }
          })
        };
      default:
        return {};
    }
  };

  return (
    <Box
      ref={ref}
      p={4}
      {...getVariantStyles()}
      {...rest}
    >
      {children}
    </Box>
  );
});

CustomCard.displayName = 'CustomCard'; 