<script setup>
defineProps({
  icon: {
    type: String,
    default: '🗂️',
  },
  title: {
    type: String,
    default: '这里空空的',
  },
  hint: {
    type: String,
    default: '',
  },
  actionText: {
    type: String,
    default: '',
  },
  actionIcon: {
    type: String,
    default: '＋',
  },
})

const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon" aria-hidden="true">{{ icon }}</div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
    <button
      v-if="actionText"
      type="button"
      class="btn btn-ghost empty-action"
      data-test="empty-action"
      @click="emit('action')"
    >
      <span aria-hidden="true">{{ actionIcon }}</span>
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-4);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
  animation: fade-in var(--transition-base) both;
}

.empty-icon {
  font-size: 34px;
  line-height: 1;
  animation: float-y 3.2s ease-in-out infinite;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.empty-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  max-width: 200px;
}

.empty-action {
  margin-top: var(--space-2);
  padding: 7px 14px;
  font-size: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .empty-icon {
    animation: none;
  }
}
</style>