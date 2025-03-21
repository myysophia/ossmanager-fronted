import { theme as baseTheme } from '@chakra-ui/theme';

const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    brand: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff', // 主色调
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
  },
  fonts: {
    ...baseTheme.fonts,
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif',
  },
};

export default theme; 