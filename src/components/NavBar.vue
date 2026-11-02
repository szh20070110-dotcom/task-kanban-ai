<script setup>
import { computed } from 'vue'
import ThemeSelector from './ThemeSelector.vue'
import { useRipple } from '../composables/useRipple'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add-task', 'reset'])
const { ripple } = useRipple()

const stats = computed(() => {
  const total = props.tasks.length
  const done = props.tasks.filter((task) => task.columnId === 'done').length
  return {
    total,
    doing: props.tasks.filter((task) => task.columnId === 'doing').length,
    done,
    urgent: props.tasks.filter((task) => task.urgent).length,
    completion: total === 0 ? 0 : Math.round((done / total) * 100),
  }
})
</script>

<template>
  <header class="navbar">
    <div class="nav-inner">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">📋</div>
        <div class="brand-text">
          <h1 class="brand-title">任务看板</h1>
          <p class="brand-subtitle">把想法变成行动</p>
        </div>
      </div>

      <div v-if="stats.total > 0" class="nav-stats" aria-label="任务统计">
        <span class="stat">
          <strong>{{ stats.total }}</strong>
          <span>全部</span>
        </span>
        <span class="stat stat--doing">
          <strong>{{ stats.doing }}</strong>
          <span>进行中</span>
        </span>
        <span class="stat stat--done">
          <strong>{{ stats.done }}</strong>
          <span>已完成</span>
        </span>
        <span v-if="stats.urgent > 0" class="stat stat--urgent">
          <strong>{{ stats.urgent }}</strong>
          <span>紧急</span>
        </span>
      </div>

      <div class="nav-actions">
        <ThemeSelector />
        <button type="button" class="btn btn-ghost reset-btn" title="清空所有任务" @click="emit('reset')">
          <span aria-hidden="true">↺</span>
          重置
        </button>
        <button type="button" class="btn btn-primary add-btn" @click="ripple($event); emit('add-task')">
          <span aria-hidden="true">＋</span>
          新增任务
        </button>
      </div>
    </div>

    <div v-if="stats.total > 0" class="progress-track" aria-hidden="true">
      <div class="progress-bar" :style="{ width: `${stats.completion}%` }"></div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: color-mix(in srgb, var(--color-surface) 86%, transparent);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(14px);
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  min-height: var(--header-height);
  padding: var(--space-3) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-5);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  font-size: 21px;
  border-radius: var(--radius-md);
  background: var(--gradient-hero);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.brand-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--color-text);
  line-height: 1.3;
}

.brand-subtitle {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
}

.nav-stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-2);
  flex-wrap: wrap;
}

.stat {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
}

.stat strong {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.stat--doing strong {
  color: var(--color-warning);
}

.stat--done strong {
  color: var(--color-success);
}

.stat--urgent {
  background: var(--color-danger-soft);
}

.stat--urgent strong {
  color: var(--color-danger);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}

.reset-btn {
  padding: 9px 14px;
  font-size: 13px;
}

.add-btn {
  padding: 10px 18px;
}

.progress-track {
  height: 3px;
  background: var(--color-surface-muted);
}

.progress-bar {
  height: 100%;
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  transition: width var(--transition-slow);
}

@media (max-width: 900px) {
  .nav-inner {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .nav-stats {
    order: 3;
    width: 100%;
    margin-left: 0;
    padding-top: var(--space-1);
  }

  .brand-subtitle {
    display: none;
  }
}

@media (max-width: 620px) {
  .reset-btn {
    display: none;
  }

  .stat span {
    display: none;
  }

  .stat {
    padding: 4px 8px;
  }
}
</style>