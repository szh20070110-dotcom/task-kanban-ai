<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  existingCategories: {
    type: Array,
    default: () => [],
  },
  initialColumnId: {
    type: String,
    default: 'todo',
  },
})

const emit = defineEmits(['submit', 'close'])

const title = ref('')
const description = ref('')
const category = ref('')
const columnId = ref(
  props.columns.some((column) => column.id === props.initialColumnId)
    ? props.initialColumnId
    : props.columns[0]?.id ?? 'todo',
)
const error = ref('')
const titleInput = ref(null)

const titleLength = computed(() => title.value.length)
const descriptionLength = computed(() => description.value.length)

function fillCategory(value) {
  category.value = value
}

function handleSubmit() {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) {
    error.value = '请先填写任务标题'
    nextTick(() => titleInput.value?.focus())
    return
  }

  error.value = ''
  emit('submit', {
    title: trimmedTitle,
    description: description.value.trim(),
    category: category.value.trim(),
    columnId: columnId.value,
  })
}

function handleClose() {
  emit('close')
}

function onKeydown(event) {
  if (event.key === 'Escape') handleClose()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
  nextTick(() => titleInput.value?.focus())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div class="modal-backdrop" @click.self="handleClose">
        <form
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-title"
          data-test="task-form"
          @submit.prevent="handleSubmit"
        >
          <header class="modal-header">
            <div class="modal-heading">
              <span class="modal-icon" aria-hidden="true">📝</span>
              <div>
                <h2 id="add-task-title" class="modal-title">新增任务</h2>
                <p class="modal-subtitle">记录一件要做的事，从第一步开始</p>
              </div>
            </div>
            <button
              type="button"
              class="icon-btn modal-close"
              aria-label="关闭弹窗"
              @click="handleClose"
            >
              ✕
            </button>
          </header>

          <div class="modal-body">
            <div class="field">
              <input
                id="task-title"
                ref="titleInput"
                v-model="title"
                class="field-input"
                type="text"
                maxlength="60"
                placeholder=" "
                autocomplete="off"
                data-test="title-input"
                @input="error = ''"
              />
              <label class="field-label" for="task-title">任务标题 *</label>
              <span class="field-counter" :class="{ 'is-near-limit': titleLength > 50 }">
                {{ titleLength }}/60
              </span>
            </div>
            <p v-if="error" class="field-error" role="alert" data-test="error">{{ error }}</p>

            <div class="field field--textarea">
              <textarea
                id="task-description"
                v-model="description"
                class="field-input field-textarea"
                maxlength="200"
                placeholder=" "
                rows="3"
                data-test="desc-input"
              ></textarea>
              <label class="field-label" for="task-description">任务描述（可选）</label>
              <span class="field-counter">{{ descriptionLength }}/200</span>
            </div>

            <div class="field field--category">
              <input
                id="task-category"
                v-model="category"
                class="field-input"
                type="text"
                maxlength="20"
                placeholder=" "
                autocomplete="off"
                list="category-suggestions"
                data-test="category-input"
              />
              <label class="field-label" for="task-category">分类（可选）</label>
              <datalist id="category-suggestions">
                <option v-for="item in existingCategories" :key="item" :value="item"></option>
              </datalist>
            </div>

            <div v-if="existingCategories.length" class="category-suggestions">
              <span class="suggestions-label">已有分类</span>
              <button
                v-for="item in existingCategories"
                :key="`chip-${item}`"
                type="button"
                class="category-chip"
                :class="{ 'is-active': category === item }"
                @click="fillCategory(item)"
              >
                {{ item }}
              </button>
            </div>

            <fieldset class="column-picker">
              <legend class="picker-legend">放入哪一列</legend>
              <div class="column-options">
                <label
                  v-for="column in columns"
                  :key="column.id"
                  class="column-option"
                  :class="{ 'is-active': columnId === column.id }"
                >
                  <input v-model="columnId" class="sr-only" type="radio" :value="column.id" />
                  <span class="option-dot" :style="{ backgroundColor: column.color }"></span>
                  <span>{{ column.title }}</span>
                </label>
              </div>
            </fieldset>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn btn-ghost" data-test="cancel" @click="handleClose">
              取消
            </button>
            <button type="submit" class="btn btn-primary" data-test="submit">
              <span aria-hidden="true">＋</span>
              创建任务
            </button>
          </footer>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--color-overlay);
  backdrop-filter: blur(6px);
  animation: fade-in var(--transition-fast) both;
}

.modal-panel {
  width: min(520px, 100%);
  max-height: min(86vh, 760px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--gradient-hero);
}

.modal-heading {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  font-size: 20px;
  background: var(--color-primary-soft);
  flex-shrink: 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.modal-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.modal-close {
  flex-shrink: 0;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  overflow-y: auto;
}

.field {
  position: relative;
}

.field--textarea .field-label {
  top: 14px;
  transform: none;
}

.field-input {
  display: block;
  width: 100%;
  padding: 20px 14px 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
  background: var(--color-surface-muted);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background-color var(--transition-fast),
    box-shadow var(--transition-fast);
  resize: none;
}

.field-input:hover {
  background: var(--color-surface-hover);
}

.field-input:focus {
  outline: none;
  background: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.field-textarea {
  min-height: 92px;
  padding-top: 24px;
}

.field-label {
  position: absolute;
  top: 50%;
  left: 14px;
  padding: 0 4px;
  font-size: 14px;
  color: var(--color-text-muted);
  transform: translateY(-50%);
  pointer-events: none;
  transition: top var(--transition-fast), font-size var(--transition-fast),
    color var(--transition-fast), background-color var(--transition-fast);
}

.field-input:focus + .field-label,
.field-input:not(:placeholder-shown) + .field-label {
  top: 10px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  background: transparent;
}

.field--textarea .field-input:focus + .field-label,
.field--textarea .field-input:not(:placeholder-shown) + .field-label {
  top: 6px;
}

.field-counter {
  position: absolute;
  right: 12px;
  bottom: 6px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
  pointer-events: none;
}

.field-counter.is-near-limit {
  color: var(--color-warning);
}

.field-error {
  margin-top: -6px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--color-danger);
  background: var(--color-danger-soft);
  border-radius: var(--radius-sm);
  animation: slide-up var(--transition-fast) both;
}

.category-suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: -6px;
}

.suggestions-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.category-chip {
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-surface-muted);
  border: 1px solid transparent;
  transition: color var(--transition-fast), background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.category-chip:hover {
  color: var(--color-primary-hover);
  border-color: var(--color-border-strong);
}

.category-chip.is-active {
  color: var(--color-primary-hover);
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.column-picker {
  margin: 0;
  padding: 0;
  border: none;
}

.picker-legend {
  margin-bottom: var(--space-2);
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.column-options {
  display: flex;
  gap: var(--space-2);
}

.column-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 9px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface-muted);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color var(--transition-fast), background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.column-option:hover {
  border-color: var(--color-border-strong);
}

.column-option.is-active {
  color: var(--color-primary-hover);
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.option-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-hover);
}

@media (max-width: 520px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal-panel {
    width: 100%;
    max-height: 92vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }

  .column-options {
    flex-direction: column;
  }
}
</style>