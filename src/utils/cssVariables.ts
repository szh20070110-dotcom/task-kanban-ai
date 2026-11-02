import { getTheme } from '../config/themes'

export function applyTheme(themeId: string): void {
  if (typeof document === 'undefined') return
  const theme = getTheme(themeId)
  const root = document.documentElement

  Object.entries(theme.colors).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  root.dataset.theme = theme.id
  root.style.colorScheme = theme.id === 'dark' ? 'dark' : 'light'

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme.colors['--color-primary'] ?? '#6366f1')
  }
}

export function getCssVariable(name: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}