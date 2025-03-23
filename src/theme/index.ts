import { extendTheme, ThemeConfig } from '@chakra-ui/react';

// 基础色彩系统
const colors = {
  // 主色调 - 优雅深蓝
  primary: {
    50: '#e9f0fb',
    100: '#c6d6f1',
    200: '#a3bce7',
    300: '#7fa1dd',
    400: '#5c86d3',
    500: '#3b6bcb', // 主色调
    600: '#3054a4',
    700: '#263d7d',
    800: '#1c2956',
    900: '#121830',
  },
  // 辅助色 - 清爽绿色
  secondary: {
    50: '#e7f7ee',
    100: '#c2ebd3',
    200: '#9adeb7',
    300: '#70d09b',
    400: '#46c37f',
    500: '#38a469', // 主色调
    600: '#2c8354',
    700: '#21623f',
    800: '#16422a',
    900: '#0a2115',
  },
  // 辅助色 - 温暖橙色
  accent: {
    50: '#fff4e4',
    100: '#ffe2ba',
    200: '#ffd08f',
    300: '#ffbd64',
    400: '#ffab39',
    500: '#ff9800', // 主色调
    600: '#cc7a00',
    700: '#995c00',
    800: '#663d00',
    900: '#331f00',
  },
  // 中性色 - 优雅灰
  gray: {
    50: '#f7f9fb',
    100: '#e3e8ed',
    200: '#d0d7df',
    300: '#bdc5d1',
    400: '#a9b4c3',
    500: '#8a97a9', // 中性色
    600: '#6c7a8c',
    700: '#4f5d6e',
    800: '#323f51',
    900: '#192133',
  },
  // 状态色
  success: '#38a469',
  error: '#e53e3e',
  warning: '#dd6b20',
  info: '#3b6bcb',
};

// 深色模式配置
const semanticTokens = {
  colors: {
    "bg-canvas": {
      default: 'gray.50',
      _dark: 'gray.900',
    },
    "bg-surface": {
      default: 'white',
      _dark: 'gray.800',
    },
    "bg-subtle": {
      default: 'gray.100',
      _dark: 'gray.700',
    },
    "bg-muted": {
      default: 'gray.200',
      _dark: 'gray.600',
    },
    "default-border": {
      default: 'gray.200',
      _dark: 'gray.700',
    },
    "fg-default": {
      default: 'gray.800',
      _dark: 'gray.50',
    },
    "fg-muted": {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    "fg-subtle": {
      default: 'gray.500',
      _dark: 'gray.300',
    },
    "fg-accent": {
      default: 'primary.500',
      _dark: 'primary.300',
    },
    "border-subtle": {
      default: 'gray.200',
      _dark: 'gray.600',
    },
  },
};

// 组件主题
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: { colorScheme: string }) => {
        const { colorScheme } = props;
        if (colorScheme === 'gray') {
          return {
            bg: 'bg-subtle',
            color: 'fg-default',
            _hover: {
              bg: 'bg-muted',
            },
            _active: {
              bg: 'bg-muted',
            },
          };
        }
        return {
          bg: `${colorScheme}.500`,
          color: 'white',
          _hover: {
            bg: `${colorScheme}.600`,
          },
          _active: {
            bg: `${colorScheme}.700`,
          },
        };
      },
      outline: (props: { colorScheme: string }) => {
        const { colorScheme } = props;
        return {
          borderColor: colorScheme === 'gray' ? 'border-subtle' : `${colorScheme}.500`,
          color: colorScheme === 'gray' ? 'fg-default' : `${colorScheme}.500`,
          _hover: {
            bg: colorScheme === 'gray' ? 'bg-subtle' : `${colorScheme}.50`,
          },
          _dark: {
            color: colorScheme === 'gray' ? 'fg-default' : `${colorScheme}.300`,
            _hover: {
              bg: colorScheme === 'gray' ? 'bg-subtle' : `${colorScheme}.800`,
            },
          },
        };
      },
      ghost: (props: { colorScheme: string }) => {
        const { colorScheme } = props;
        return {
          color: colorScheme === 'gray' ? 'fg-default' : `${colorScheme}.500`,
          _hover: {
            bg: colorScheme === 'gray' ? 'bg-subtle' : `${colorScheme}.50`,
          },
          _dark: {
            color: colorScheme === 'gray' ? 'fg-default' : `${colorScheme}.300`,
            _hover: {
              bg: colorScheme === 'gray' ? 'bg-subtle' : `${colorScheme}.800`,
            },
          },
        };
      },
    },
    defaultProps: {
      colorScheme: 'primary',
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'semibold',
      color: 'fg-default',
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'border-subtle',
          _hover: {
            borderColor: 'gray.400',
          },
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
          _dark: {
            _focus: {
              borderColor: 'primary.300',
              boxShadow: '0 0 0 1px var(--chakra-colors-primary-300)',
            },
          },
        },
      },
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'border-subtle',
          backgroundColor: 'bg-subtle',
          color: 'fg-muted',
          fontWeight: 'semibold',
        },
        td: {
          borderColor: 'border-subtle',
        },
        tr: {
          _hover: {
            backgroundColor: 'bg-subtle',
          },
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'bg-surface',
        boxShadow: 'md',
        borderRadius: 'lg',
      },
    },
  },
};

// 全局样式
const styles = {
  global: {
    body: {
      bg: 'bg-canvas',
      color: 'fg-default',
    },
  },
};

// 字体设置
const fonts = {
  heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};

// 其他配置
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
  disableTransitionOnChange: false,
};

// 扩展主题
const theme = extendTheme({
  colors,
  components,
  styles,
  fonts,
  config,
  semanticTokens,
});

export default theme; 