'use client';

import { Button, ButtonProps, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';

interface ColorModeToggleProps extends Omit<ButtonProps, 'aria-label'> {}

export const ColorModeToggle = (props: ColorModeToggleProps) => {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FiMoon, FiSun);
  const text = useColorModeValue('深色模式', '浅色模式');
  
  return (
    <Button
      size="sm"
      variant="ghost"
      aria-label={`切换到${text}`}
      leftIcon={<SwitchIcon />}
      onClick={toggleColorMode}
      {...props}
    >
      {props.children || text}
    </Button>
  );
}; 