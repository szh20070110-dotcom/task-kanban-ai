<script setup>
import { computed, ref } from 'vue'
import TaskCard from './TaskCard.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  taskList: {
    type: Array,
    default: () => [],
  },
  draggingId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['move', 'toggle', 'remove', 'add-task', 'drag-start', 'drag-end'])

const listEl = ref(null)
const isOver = ref(false)
const dropIndex = ref(-1)
const isEmpty = computed(() => props.taskList.length === 0)

const emptyCopy = computed(() => {
  if (props.column.id === 'done') {
    return { icon: '🎯', title: '还没有完成的任务', hint: '完成任务后拖到这里，庆祝一下' }
  }
  if (props.column.id === 'doing') {
    return { icon: '🚧', title: '暂时没有进行中的任务', hint: '把待办任务拖过来开始推进' }
  }
  return { icon: '🌱', title: '待办列表是空的', hint: '点击下方按钮，记录第一件要做的事' }
})

function computeDropIndex(event) {
  const el = listEl.value
  if (!el) return 0

  const cards = Array.from(el.querySelectorAll('[data-task-id]'))
  for (let index = 0; index < cards.length; index += 1) {
    const rect = cards[index].getBoundingClientRect()
    if (event.clientY < rect.top + rect.height / 2) return index
  }
  return cards.length
}

function onDragOver(event) {
  if (!props.draggingId) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isOver.value = true
  dropIndex.value = computeDropIndex(event)
}

function onDragLeave(event) {
  if (!props.draggingId) return
  const container = event.currentTarget
  if (container && event.relatedTarget && container.contains(event.relatedTarget)) return
  isOver.value = false
  dropIndex.value = -1
}

function onDrop(event) {
  event.preventDefault()
  if (!props.draggingId) return

  const targetIndex = dropIndex.value >= 0 ? dropIndex.value : computeDropIndex(event)
  isOver.value = false
  dropIndex.value = -1
  emit('move', props.draggingId, props.column.id, targetIndex)
}

function onDragEnd() {
  isOver.value = false
  dropIndex.value = -1
  emit('drag-end')
}
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'is-over': isOver, 'is-empty': isEmpty }"
    :data-column-id="column.id"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="column-header">
      <div class="column-heading">
        <span class="column-dot" :style="{ backgroundColor: column.color }" aria-hidden="true"></span>
        <h2 class="column-title">{{ column.title }}</h2>
        <span class="column-count" :title="`${taskList.length} 个任务`">{{ taskList.length }}</span>
      </div>
      <button
        type="button"
        class="column-add"
        :aria-label="`在${column.title}列新增任务`"
        :title="`在${column.title}列新增任务`"
        data-test="column-add"
        @click="emit('add-task', column.id)"
      >
        ＋
      </button>
    </header>

    <div ref="listEl" class="column-body" data-test="drop-zone">
      <TransitionGroup name="list" tag="div" class="card-list">
        <div v-for="(task, index) in taskList" :key="task.id" class="card-slot">
          <div v-if="isOver && dropIndex === index" class="drop-line" aria-hidden="true"></div>
          <TaskCard
            :task="task"
            @toggle="(id, field) => emit('toggle', id, field)"
            @remove="(id) => emit('remove', id)"
            @drag-start="(id) => emit('drag-start', id)"
            @drag-end="onDragEnd"
          />
        </div>
      </TransitionGroup>

      <div v-if="isOver && dropIndex >= taskList.length" class="drop-line" aria-hidden="true"></div>

      <EmptyState
        v-if="isEmpty"
        :icon="emptyCopy.icon"
        :title="emptyCopy.title"
        :hint="emptyCopy.hint"
        action-text="新增任务"
        action-icon="＋"
        @action="emit('add-task', column.id)"
      />
    </div>

    <footer class="column-footer">
      <span class="column-hint">
        {{ isEmpty ? '拖拽卡片到此处' : `共 ${taskList.length} 项 · 支持拖拽流转` }}
      </span>
    </footer>
  </section>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-base),
    transform var(--transition-fast);
}

.kanban-column::before {
  content: '';
  display: block;
  height: 4px;
  background: var(--gradient-column);
}

.kanban-column.is-over {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft), var(--shadow-md);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--gradient-column);
}

.column-heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.column-dot {
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px var(--color-surface-muted);
}

.column-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: var(--color-text);
  white-space: nowrap;
}

.column-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-surface-muted);
}

.column-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  transition: color var(--transition-fast), background-color var(--transition-fast),
    transform var(--transition-fast);
}

.column-add:hover {
  color: var(--color-primary-contrast);
  background: var(--color-primary);
  transform: rotate(90deg);
}

.column-body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--space-3);
  min-height: 180px;
  flex: 1;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  position: relative;
}

.card-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.drop-line {
  height: 3px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  animation: fade-in var(--transition-fast) both;
}

.column-footer {
  padding: 0 var(--space-4) var(--space-4);
}

.column-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}

.kanban-column.is-empty .column-body {
  justify-content: center;
}

@media (max-width: 900px) {
  .kanban-column {
    min-height: auto;
  }
}
</style>