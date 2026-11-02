<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const { activeTheme, previewThemeId, themes, setTheme, previewTheme, cancelPreview } = useTheme()

const displayTheme = computed(
  () => themes.find((item) => item.id === previewThemeId.value) ?? activeTheme.value,
)

const open = ref(false)
const root = ref(null)

function toggle() {
  open.value = !open.value
  if (!open.value) cancelPreview()
}

function choose(themeId) {
  setTheme(themeId)
  open.value = false
}

function closeMenu() {
  if (!open.value) return
  open.value = false
  cancelPreview()
}

function onClickOutside(event) {
  if (root.value && !root.value.contains(event.target)) closeMenu()
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="theme-selector">
    <button
      type="button"
      class="theme-trigger"
      :aria-expanded="open"
      aria-haspopup="listbox"
      title="切换主题"
      data-test="theme-trigger"
      @click.stop="toggle"
    >
      <span class="trigger-icon" aria-hidden="true">{{ displayTheme.icon }}</span>
      <span class="trigger-label">{{ displayTheme.name }}</span>
      <span class="trigger-chevron" :class="{ 'is-open': open }" aria-hidden="true">⌄</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="theme-menu" role="listbox" aria-label="选择主题" @mouseleave="cancelPreview">
        <p class="menu-title">选择主题</p>
        <button
          v-for="item in themes"
          :key="item.id"
          type="button"
          class="theme-option"
          :class="{ 'is-active': previewThemeId === item.id }"
          role="option"
          :aria-selected="previewThemeId === item.id"
          @mouseenter="previewTheme(item.id)"
          @focus="previewTheme(item.id)"
          @click.stop="choose(item.id)"
        >
          <span class="option-preview" :style="{ background: item.colors['--gradient-hero'] }">
            <span
              class="preview-dot preview-dot--primary"
              :style="{ backgroundColor: item.colors['--color-primary'] }"
            ></span>
            <span
              class="preview-dot preview-dot--accent"
              :style="{ backgroundColor: item.colors['--color-warning'] }"
            ></span>
            <span
              class="preview-dot preview-dot--success"
              :style="{ backgroundColor: item.colors['--color-success'] }"
            ></span>
          </span>
          <span class="option-text">
            <span class="option-name">
              <span aria-hidden="true">{{ item.icon }}</span>
              {{ item.name }}
            </span>
            <span class="option-desc">{{ item.description }}</span>
          </span>
          <span v-if="previewThemeId === item.id" class="option-check" aria-hidden="true">✓</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.theme-selector {
  position: relative;
}

.theme-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface-muted);
  border: 1px solid transparent;
  transition: background-color var(--transition-fast), border-color var(--transition-fast),
    color var(--transition-fast);
}

.theme-trigger:hover,
.theme-trigger[aria-expanded='true'] {
  color: var(--color-text);
  border-color: var(--color-border-strong);
}

.trigger-icon {
  font-size: 14px;
  line-height: 1;
}

.trigger-chevron {
  font-size: 12px;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.trigger-chevron.is-open {
  transform: rotate(180deg);
}

.theme-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  padding: var(--space-2);
  z-index: var(--z-dropdown);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transform-origin: top right;
}

.menu-title {
  padding: 4px 10px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  text-align: left;
  border: 1px solid transparent;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.theme-option:hover,
.theme-option.is-active {
  background: var(--color-surface-muted);
}

.theme-option.is-active {
  border-color: var(--color-border-strong);
}

.option-preview {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow: hidden;
}

.preview-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  margin: 0 1px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.option-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.option-desc {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-check {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-primary);
}

@media (max-width: 620px) {
  .trigger-label {
    display: none;
  }

  .theme-trigger {
    width: 38px;
    padding: 0;
    justify-content: center;
  }

  .trigger-chevron {
    display: none;
  }
}
</style>