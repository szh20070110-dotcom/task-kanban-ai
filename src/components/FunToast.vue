<script setup>
import { useToast } from '../composables/useToast'

const { toasts, remove, pause, resume } = useToast()

const icons = {
  success: '✅',
  error: '⚠️',
  warning: '🔔',
  info: '💡',
}
</script>

<template>
  <div class="toast-container" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast" tag="div" class="toast-list">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="status"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
      >
        <span class="toast-icon" aria-hidden="true">{{ icons[toast.type] }}</span>
        <p class="toast-message">{{ toast.message }}</p>
        <button
          type="button"
          class="toast-close"
          aria-label="关闭提示"
          @click="remove(toast.id)"
        >
          ✕
        </button>
        <span
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
          aria-hidden="true"
        ></span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  width: min(340px, calc(100vw - 32px));
  padding: 12px 14px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  overflow: hidden;
}

.toast--success {
  border-left-color: var(--color-success);
}

.toast--error {
  border-left-color: var(--color-danger);
}

.toast--warning {
  border-left-color: var(--color-warning);
}

.toast--info {
  border-left-color: var(--color-primary);
}

.toast-icon {
  font-size: 15px;
  line-height: 1.5;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text);
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-size: 10px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.toast-close:hover {
  color: var(--color-text);
  background: var(--color-surface-muted);
}

.toast-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  background: currentColor;
  color: var(--color-primary);
  opacity: 0.35;
  transform-origin: left center;
  animation-name: toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.toast--success .toast-progress {
  color: var(--color-success);
}

.toast--error .toast-progress {
  color: var(--color-danger);
}

.toast--warning .toast-progress {
  color: var(--color-warning);
}

.toast:hover .toast-progress {
  animation-play-state: paused;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active {
  transition: opacity var(--transition-base), transform var(--transition-slow);
}

.toast-leave-active {
  position: absolute;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.toast-move {
  transition: transform var(--transition-base);
}

@media (max-width: 620px) {
  .toast-container {
    right: var(--space-3);
    left: var(--space-3);
    bottom: var(--space-3);
  }

  .toast-list {
    align-items: stretch;
  }

  .toast {
    width: 100%;
  }
}
</style>