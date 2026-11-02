import { computed, ref } from 'vue'
import { DEFAULT_THEME_ID, getTheme, themes } from '../config/themes'
import { applyTheme } from '../utils/cssVariables'

const THEME_KEY = 'task-kanban-theme'

function loadSavedTheme(): string {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && themes.some((theme) => theme.id === saved)) return saved
  } catch (error) {
    console.warn('[theme] 读取主题失败', error)
  }
  return DEFAULT_THEME_ID
}

const currentTheme = ref(loadSavedTheme())
const previewThemeId = ref<string | null>(null)

applyTheme(currentTheme.value)

function setTheme(themeId: string): void {
  if (!themes.some((theme) => theme.id === themeId)) return
  currentTheme.value = themeId
  previewThemeId.value = null
  applyTheme(themeId)
  try {
    localStorage.setItem(THEME_KEY, themeId)
  } catch (error) {
    console.warn('[theme] 保存主题失败', error)
  }
}

function previewTheme(themeId: string): void {
  if (!themes.some((theme) => theme.id === themeId)) return
  previewThemeId.value = themeId
  applyTheme(themeId)
}

function cancelPreview(): void {
  if (previewThemeId.value === null) return
  previewThemeId.value = null
  applyTheme(currentTheme.value)
}

function cycleTheme(): void {
  const index = themes.findIndex((theme) => theme.id === currentTheme.value)
  setTheme(themes[(index + 1) % themes.length].id)
}

export function useTheme() {
  const activeTheme = computed(() => getTheme(currentTheme.value))
  return {
    theme: currentTheme,
    activeTheme,
    previewThemeId,
    themes,
    setTheme,
    previewTheme,
    cancelPreview,
    cycleTheme,
  }
}