const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  purple: '\x1b[38;5;99m',
  magenta: '\x1b[35m',
  brightGreen: '\x1b[92m',
  orange: '\x1b[38;5;208m',
} as const;

export type ColorKey = keyof typeof colors;

const colorize = (text: string, color: ColorKey): string => {
  const colorCode = colors[color] || colors.reset;
  return `${colorCode}${text}${colors.reset}`;
};

export default colorize;
