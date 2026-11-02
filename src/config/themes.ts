export interface ThemeDefinition {
  id: string
  name: string
  icon: string
  description: string
  colors: Record<string, string>
}

export const DEFAULT_THEME_ID = 'light'

export const themes: ThemeDefinition[] = [
  {
    id: 'light',
    name: '亮色',
    icon: '☀️',
    description: '清爽明亮，适合白天专注',
    colors: {
      '--color-bg': '#f4f6fb',
      '--color-surface': '#ffffff',
      '--color-surface-hover': '#f8fafc',
      '--color-surface-muted': '#eef2f7',
      '--color-border': '#e3e8ef',
      '--color-border-strong': '#cfd8e3',
      '--color-text': '#1f2937',
      '--color-text-secondary': '#4b5563',
      '--color-text-muted': '#9aa4b2',
      '--color-primary': '#6366f1',
      '--color-primary-hover': '#4f46e5',
      '--color-primary-soft': '#eef2ff',
      '--color-primary-contrast': '#ffffff',
      '--color-success': '#10b981',
      '--color-success-soft': '#ecfdf5',
      '--color-warning': '#f59e0b',
      '--color-warning-soft': '#fffbeb',
      '--color-danger': '#ef4444',
      '--color-danger-soft': '#fef2f2',
      '--color-star': '#f59e0b',
      '--color-shadow': 'rgba(15, 23, 42, 0.08)',
      '--color-overlay': 'rgba(15, 23, 42, 0.45)',
      '--gradient-hero': 'linear-gradient(135deg, #eef2ff, #f8fafc)',
      '--gradient-column': 'linear-gradient(180deg, rgba(99, 102, 241, 0.06), transparent)',
    },
  },
  {
    id: 'dark',
    name: '暗色',
    icon: '🌙',
    description: '柔和暗色，夜间不刺眼',
    colors: {
      '--color-bg': '#0b1220',
      '--color-surface': '#151e2e',
      '--color-surface-hover': '#1b2537',
      '--color-surface-muted': '#1f2a3d',
      '--color-border': '#263449',
      '--color-border-strong': '#35455c',
      '--color-text': '#e7edf7',
      '--color-text-secondary': '#a7b4c9',
      '--color-text-muted': '#6f7f95',
      '--color-primary': '#818cf8',
      '--color-primary-hover': '#a5b4fc',
      '--color-primary-soft': '#1e2a4a',
      '--color-primary-contrast': '#0b1220',
      '--color-success': '#34d399',
      '--color-success-soft': '#0f2f26',
      '--color-warning': '#fbbf24',
      '--color-warning-soft': '#3a2c0d',
      '--color-danger': '#f87171',
      '--color-danger-soft': '#3a1717',
      '--color-star': '#fbbf24',
      '--color-shadow': 'rgba(0, 0, 0, 0.5)',
      '--color-overlay': 'rgba(2, 6, 23, 0.7)',
      '--gradient-hero': 'linear-gradient(135deg, #111c30, #0b1220)',
      '--gradient-column': 'linear-gradient(180deg, rgba(129, 140, 248, 0.08), transparent)',
    },
  },
  {
    id: 'colorful',
    name: '多彩',
    icon: '🌈',
    description: '活泼渐变，灵感不断',
    colors: {
      '--color-bg': 'linear-gradient(135deg, #fef3ff 0%, #eef6ff 50%, #f0fdf9 100%)',
      '--color-surface': '#ffffff',
      '--color-surface-hover': '#fdfaff',
      '--color-surface-muted': '#f7f0ff',
      '--color-border': '#f0e3ff',
      '--color-border-strong': '#e2cdf7',
      '--color-text': '#35204d',
      '--color-text-secondary': '#6b5486',
      '--color-text-muted': '#a892bd',
      '--color-primary': '#d946ef',
      '--color-primary-hover': '#c026d3',
      '--color-primary-soft': '#fbe8ff',
      '--color-primary-contrast': '#ffffff',
      '--color-success': '#14b8a6',
      '--color-success-soft': '#e6fffb',
      '--color-warning': '#f97316',
      '--color-warning-soft': '#fff3e8',
      '--color-danger': '#f43f5e',
      '--color-danger-soft': '#ffe9ee',
      '--color-star': '#f59e0b',
      '--color-shadow': 'rgba(168, 85, 247, 0.14)',
      '--color-overlay': 'rgba(58, 22, 84, 0.45)',
      '--gradient-hero': 'linear-gradient(135deg, #fbe8ff, #e6f7ff 50%, #e6fffb)',
      '--gradient-column': 'linear-gradient(180deg, rgba(217, 70, 239, 0.08), transparent)',
    },
  },
]

export function getTheme(themeId: string): ThemeDefinition {
  return themes.find((theme) => theme.id === themeId) ?? themes[0]
}