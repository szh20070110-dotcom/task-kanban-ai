<script setup>
import { computed, ref } from 'vue'
import { getWeeklyStats } from '../utils/weeklyStats'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
})

const collapsed = ref(false)
const stats = computed(() => getWeeklyStats(props.tasks))

const hasActivity = computed(() => stats.value.created > 0 || stats.value.completed > 0)

function barHeight(value) {
  return `${Math.round((value / stats.value.maxDaily) * 100)}%`
}

function changeLabel(value) {
  if (value === 0) return '持平'
  return `${value > 0 ? '↑' : '↓'} ${Math.abs(value)}%`
}

function changeClass(value) {
  if (value === 0) return 'is-neutral'
  return value > 0 ? 'is-up' : 'is-down'
}

function isToday(timestamp) {
  return new Date(timestamp).toDateString() === new Date().toDateString()
}
</script>

<template>
  <section class="weekly-stats" aria-labelledby="weekly-stats-title">
    <header class="stats-head">
      <div class="stats-title-group">
        <span class="stats-icon" aria-hidden="true">📊</span>
        <div>
          <h3 id="weekly-stats-title" class="stats-title">本周统计</h3>
          <p class="stats-range">{{ stats.label }} · 周一至周日</p>
        </div>
      </div>

      <div class="stats-head-actions">
        <span class="stats-streak" data-test="stats-streak" title="连续打卡：从今天或昨天往回数，连续有完成任务的天数">
          🔥 连续 {{ stats.streakDays }} 天
        </span>
        <span class="stats-badge">WEEKLY</span>
        <button
          type="button"
          class="stats-toggle"
          :aria-expanded="!collapsed"
          :title="collapsed ? '展开统计' : '收起统计'"
          data-test="stats-toggle"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '展开 ▾' : '收起 ▴' }}
        </button>
      </div>
    </header>

    <div v-show="!collapsed" class="stats-body">
      <div class="metric-grid">
        <article class="metric">
          <span class="metric-label">本周新增</span>
          <div class="metric-value-row">
            <strong class="metric-value">{{ stats.created }}</strong>
            <span class="metric-unit">项</span>
          </div>
          <span class="metric-change" :class="changeClass(stats.change.created)">
            {{ changeLabel(stats.change.created) }} 较上周
          </span>
        </article>

        <article class="metric">
          <span class="metric-label">本周完成</span>
          <div class="metric-value-row">
            <strong class="metric-value metric-value--done">{{ stats.completed }}</strong>
            <span class="metric-unit">项</span>
          </div>
          <span class="metric-change" :class="changeClass(stats.change.completed)">
            {{ changeLabel(stats.change.completed) }} 较上周
          </span>
        </article>

        <article class="metric">
          <span class="metric-label">进行中</span>
          <div class="metric-value-row">
            <strong class="metric-value metric-value--active">{{ stats.active }}</strong>
            <span class="metric-unit">项</span>
          </div>
          <span class="metric-change is-neutral">共 {{ stats.total }} 项任务</span>
        </article>

        <article class="metric">
          <span class="metric-label">整体完成率</span>
          <div class="metric-value-row">
            <strong class="metric-value metric-value--rate">{{ stats.completionRate }}%</strong>
          </div>
          <div class="rate-track" aria-hidden="true">
            <span class="rate-fill" :style="{ width: `${stats.completionRate}%` }"></span>
          </div>
        </article>
      </div>

      <div class="chart-card">
        <div class="chart-head">
          <span class="chart-title">每日节奏</span>
          <div class="chart-legend">
            <span class="legend-item"><i class="legend-dot legend-dot--created"></i>新增</span>
            <span class="legend-item"><i class="legend-dot legend-dot--completed"></i>完成</span>
          </div>
        </div>

        <div class="chart" role="img" :aria-label="`本周新增 ${stats.created} 项，完成 ${stats.completed} 项`">
          <div v-for="day in stats.daily" :key="day.date" class="chart-day" :class="{ 'is-today': isToday(day.date) }">
            <div class="bar-group">
              <span
                class="bar bar--created"
                :style="{ height: barHeight(day.created) }"
                :title="`${day.label} 新增 ${day.created} 项`"
              ></span>
              <span
                class="bar bar--completed"
                :style="{ height: barHeight(day.completed) }"
                :title="`${day.label} 完成 ${day.completed} 项`"
              ></span>
            </div>
            <span class="day-label">{{ day.label.replace('周', '') }}</span>
          </div>
        </div>

        <p class="chart-foot" data-test="stats-foot">
          <template v-if="hasActivity">
            最活跃：{{ stats.busiestDay.label }}（{{ stats.busiestDay.total }} 次动态）
          </template>
          <template v-else>本周还没有新增或完成记录，动起来吧 🌱</template>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.weekly-stats {
  margin-bottom: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.stats-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  background: var(--gradient-hero);
}

.stats-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.stats-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  font-size: 16px;
  background: var(--color-primary-soft);
  flex-shrink: 0;
}

.stats-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}

.stats-range {
  font-size: 11px;
  color: var(--color-text-muted);
}

.stats-head-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.stats-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--color-primary-hover);
  background: var(--color-primary-soft);
}

.stats-streak {
  padding: 2px 9px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  color: #d9584f;
  background: rgba(217, 88, 79, 0.14);
  white-space: nowrap;
}

.stats-toggle {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.stats-toggle:hover {
  color: var(--color-primary-hover);
  border-color: var(--color-primary);
}

.stats-body {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-4);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.metric:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border);
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.metric-value-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
}

.metric-value--done,
.metric-value--rate {
  color: var(--color-success);
}

.metric-value--active {
  color: var(--color-warning);
}

.metric-unit {
  font-size: 10px;
  color: var(--color-text-muted);
}

.metric-change {
  font-size: 10px;
  font-weight: 600;
}

.metric-change.is-up {
  color: var(--color-success);
}

.metric-change.is-down {
  color: var(--color-danger);
}

.metric-change.is-neutral {
  color: var(--color-text-muted);
  font-weight: 500;
}

.rate-track {
  height: 4px;
  margin-top: 4px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  overflow: hidden;
}

.rate-fill {
  display: block;
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-success);
  transition: width var(--transition-slow);
}

.chart-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border-radius: var(--radius-md);
  min-width: 0;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.chart-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-text-muted);
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}

.legend-dot--created {
  background: var(--color-primary);
}

.legend-dot--completed {
  background: var(--color-success);
}

.chart {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--space-2);
  height: 96px;
  margin-top: var(--space-3);
}

.chart-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}

.bar-group {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  width: 100%;
  height: 100%;
  padding-top: 2px;
  border-bottom: 1px solid var(--color-border);
}

.bar {
  display: block;
  width: 8px;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
  transition: height var(--transition-slow);
}

.bar--created {
  background: var(--color-primary);
  opacity: 0.85;
}

.bar--completed {
  background: var(--color-success);
  opacity: 0.85;
}

.chart-day.is-today .day-label {
  color: var(--color-primary-hover);
  font-weight: 800;
}

.chart-day.is-today .bar {
  opacity: 1;
}

.day-label {
  font-size: 10px;
  color: var(--color-text-muted);
}

.chart-foot {
  margin-top: var(--space-2);
  font-size: 10px;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .stats-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .chart {
    height: 84px;
  }
}

@media (max-width: 520px) {
  .stats-head {
    align-items: flex-start;
  }

  .stats-badge {
    display: none;
  }

  .metric-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .chart {
    gap: var(--space-1);
  }

  .bar {
    width: 6px;
  }
}
</style>