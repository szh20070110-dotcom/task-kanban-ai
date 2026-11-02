<script setup>
import { computed } from 'vue'
import { formatDateTime, formatRelativeTime } from '../utils/timeFormat'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['toggle', 'remove', 'drag-start', 'drag-end'])

const createdLabel = computed(() => formatRelativeTime(props.task.createdAt))
const fullDate = computed(() => formatDateTime(props.task.createdAt))

function toggle(field) {
  emit('toggle', props.task.id, field)
}

function remove() {
  emit('remove', props.task.id)
}

function onDragStart(event) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.id)
  }
  emit('drag-start', props.task.id)
}
</script>

<template>
  <article
    class="task-card"
    :class="{
      'is-starred': task.starred,
      'is-urgent': task.urgent,
      'is-done': task.columnId === 'done',
    }"
    draggable="true"
    :data-task-id="task.id"
    @dragstart="onDragStart"
    @dragend="emit('drag-end')"
  >
    <div class="card-top">
      <span v-if="task.category" class="category-tag">{{ task.category }}</span>
      <span v-else class="category-tag category-tag--empty">未分类</span>

      <div class="card-actions">
        <button
          type="button"
          class="icon-btn card-action"
          :class="{ 'is-active-star': task.starred }"
          :aria-pressed="task.starred"
          :title="task.starred ? '取消星标' : '标记为重要'"
          data-test="star"
          @click.stop="toggle('starred')"
        >
          ★
        </button>
        <button
          type="button"
          class="icon-btn card-action"
          :class="{ 'is-active-urgent': task.urgent }"
          :aria-pressed="task.urgent"
          :title="task.urgent ? '取消紧急' : '标记为紧急'"
          data-test="urgent"
          @click.stop="toggle('urgent')"
        >
          🔥
        </button>
        <button
          type="button"
          class="icon-btn card-action card-action--danger"
          title="删除任务"
          aria-label="删除任务"
          data-test="delete"
          @click.stop="remove"
        >
          ✕
        </button>
      </div>
    </div>

    <h3 class="card-title">{{ task.title }}</h3>
    <p v-if="task.description" class="card-desc">{{ task.description }}</p>

    <footer class="card-footer">
      <time class="card-time" :datetime="new Date(task.createdAt).toISOString()" :title="fullDate">
        🕒 {{ createdLabel }}
      </time>
      <span v-if="task.urgent" class="status status--urgent">紧急</span>
      <span v-else-if="task.starred" class="status status--starred">重点</span>
    </footer>
  </article>
</template>

<style scoped>
.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition: transform var(--transition-fast), box-shadow var(--transition-base),
    border-color var(--transition-fast), background-color var(--transition-base);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.is-starred {
  background: linear-gradient(180deg, var(--color-warning-soft), var(--color-surface) 60%);
  border-color: color-mix(in srgb, var(--color-star) 35%, var(--color-border));
}

.task-card.is-starred::after {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-4);
  right: var(--space-4);
  height: 2px;
  border-radius: var(--radius-full);
  background: var(--color-star);
  opacity: 0.7;
}

.task-card.is-urgent {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger-soft), var(--shadow-sm);
}

.task-card.is-urgent::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  background: var(--color-danger);
}

.task-card.is-done .card-title {
  color: var(--color-text-secondary);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: 30px;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  max-width: 60%;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-primary-hover);
  background: var(--color-primary-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-tag--empty {
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  font-weight: 500;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transform: translateX(4px);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.task-card:hover .card-actions,
.task-card:focus-within .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.card-action {
  width: 26px;
  height: 26px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.card-action.is-active-star {
  color: var(--color-star);
  background: var(--color-warning-soft);
}

.card-action.is-active-urgent {
  background: var(--color-danger-soft);
}

.card-action--danger {
  font-size: 12px;
}

.card-action--danger:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--color-text);
  word-break: break-word;
}

.card-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.card-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.status {
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.status--urgent {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.status--starred {
  color: var(--color-star);
  background: var(--color-warning-soft);
}

@media (hover: none) {
  .card-actions {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .task-card:hover {
    transform: none;
  }
}
</style>