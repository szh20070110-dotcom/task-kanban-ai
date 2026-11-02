# 任务看板 Task Kanban

一个使用 **Vue 3 + Vite + localStorage** 实现的纯前端任务管理看板。支持三列拖拽流转、星标、紧急标记、分类、多主题、完成庆祝动画，以及按周统计的新增 / 完成节奏。

## 功能特性

- 📋 **三列看板**：待办 → 进行中 → 已完成，任意列之间可双向拖拽
- ⭐ **星标与紧急标记**：一键标记重点任务，紧急任务使用红色边框高亮
- 🏷️ **分类管理**：新增任务时可填写分类，自动建议已有分类
- 📊 **本周统计**：本周新增、本周完成、进行中、整体完成率、每日新增 / 完成柱状图与周环比
- 🎨 **多主题**：亮色 / 暗色 / 多彩，支持悬停预览与一键切换
- 💬 **趣味 Toast**：每次新增、流转、标记、删除都会随机展示鼓励文案，悬停可暂停
- 🎉 **完成庆祝**：任务拖入「已完成」列时触发 Canvas 彩带 / 星星 / 爱心粒子动画
- 💾 **自动保存**：所有操作自动写入 localStorage，刷新不丢失
- 📱 **响应式**：桌面端三列横排，移动端纵向堆叠
- 🌱 **示例数据**：首次打开内置 6 条示例任务，重置后不会自动恢复

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite 4 |
| 状态与持久化 | Vue 响应式 API + localStorage |
| 测试 | Vitest + jsdom + @vue/test-utils |
| 语言 | JavaScript / TypeScript |

## 快速开始

要求 Node.js 18 及以上。

```bash
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:8085>。

```bash
npm test          # 运行全部 Vitest 用例
npm run build     # 生产构建，产物输出到 dist/
npm run preview   # 预览构建产物
```

## 项目结构

```text
task-kanban-ai/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── README.md
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   └── main.css
│   ├── styles/
│   │   └── variables.css
│   ├── components/
│   │   ├── TaskCard.vue
│   │   ├── KanbanColumn.vue
│   │   ├── AddTaskModal.vue
│   │   ├── NavBar.vue
│   │   ├── ThemeSelector.vue
│   │   ├── EmptyState.vue
│   │   ├── FunToast.vue
│   │   ├── Celebration.vue
│   │   └── WeeklyStatsPanel.vue
│   ├── composables/
│   │   ├── useKanban.js
│   │   ├── useToast.ts
│   │   ├── useTheme.ts
│   │   └── useRipple.ts
│   ├── config/
│   │   ├── themes.ts
│   │   ├── toastMessages.ts
│   │   └── seedTasks.js
│   └── utils/
│       ├── storage.js
│       ├── timeFormat.ts
│       ├── cssVariables.ts
│       └── weeklyStats.js
└── tests/
    ├── storage.test.js
    ├── TaskCard.test.js
    ├── KanbanColumn.test.js
    ├── AddTaskModal.test.js
    ├── weeklyStats.test.js
    ├── seedTasks.test.js
    └── useKanban.test.js
```

## 每周统计（含连续打卡天数）

统计逻辑位于 `src/utils/weeklyStats.js`，全部为纯函数，不依赖 Vue、DOM 或当前时间（`now` 可注入，便于测试）。

### 统计口径

- 一周以 **周一 00:00** 开始，至 **下周一 00:00** 结束（周日至周日归属同一周）。
- **本周新增**：`createdAt` 落在本周区间内的任务数量。
- **本周完成**：`completedAt` 落在本周区间内的任务数量。
- **进行中**：当前 `columnId !== 'done'` 的任务数量。
- **整体完成率**：当前 `columnId === 'done'` 的任务数 ÷ 任务总数，四舍五入为整数百分比。
- **每日节奏**：周一至周日分别统计新增与完成数量；同一天新增并完成的任务会同时计入两根柱子。
- **周环比**：本周数据相对上周的变化百分比；上周为 0 时，本周大于 0 记为 `100`，两者都是 0 记为 `0`。

### 导出函数

```js
startOfWeek(input?: Date): Date | null
formatWeekLabel(weekStart: Date): string
getWeeklyStats(tasks: Task[], now?: Date): WeeklyStats
```

`getWeeklyStats` 返回的主要字段：

| 字段 | 说明 |
| --- | --- |
| `weekStart` / `weekEnd` | 本周起止时间戳（左闭右开） |
| `label` | 可读区间，如 `6 月 8 日 - 6 月 14 日` |
| `created` / `completed` | 本周新增 / 完成数量 |
| `active` / `done` / `total` | 进行中 / 已完成 / 全部任务数 |
| `completionRate` | 整体完成率（0-100） |
| `previous` | 上周新增 / 完成数量 |
| `change` | 新增 / 完成的周环比百分比 |
| `daily` | 7 天数组，含 `label`、`created`、`completed`、`total` |
| `busiestDay` | 本周动态最多的一天，无动态时为 `null` |
| `maxDaily` | 单日最大新增或完成数，供图表计算高度 |

统计面板组件为 `src/components/WeeklyStatsPanel.vue`，挂载在主看板标题与三列看板之间，可折叠收起。

## 数据模型

```ts
interface Task {
  id: string
  title: string
  description: string
  category: string
  columnId: 'todo' | 'doing' | 'done'
  starred: boolean
  urgent: boolean
  createdAt: number
  completedAt: number | null
}

interface Column {
  id: 'todo' | 'doing' | 'done'
  title: string
  color: string
}
```

- 新建任务时 `completedAt` 为 `null`；若直接创建到「已完成」列，则立即写入完成时间。
- 任务拖入「已完成」列时自动写入 `completedAt`；从「已完成」拖出时清空。
- localStorage 键为 `task-kanban-state`，存储 `{ version, tasks, savedAt }`。
- 读取数据时会过滤缺少 `id` / `title` 的非法任务，并对缺失字段做归一化；JSON 损坏时降级为默认数据。

## 示例任务

首次打开（localStorage 中没有数据）时会写入 6 条示例任务，覆盖三列、星标、紧急与多个分类：

| 任务 | 分类 | 列 |
| --- | --- | --- |
| 梳理本周工作目标 | 规划 | 待办 |
| 修复登录页在小屏下的布局问题 | 开发 | 待办 |
| 设计新版任务卡片 | 设计 | 进行中 |
| 整理本周站会纪要 | 协作 | 进行中 |
| 搭建项目基础脚手架 | 开发 | 已完成 |
| 明确看板验收标准 | 规划 | 已完成 |

点击导航栏「重置」并确认后会清空所有任务。重置结果会写入 localStorage，因此刷新不会重新生成示例数据；如需再次初始化，请在浏览器中清除该站点数据。

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl + N` / `Cmd + N` | 快速打开新增任务弹窗 |
| `Esc` | 关闭新增任务弹窗 / 主题菜单 |

## 主题

主题色板定义在 `src/config/themes.ts`，切换时通过 `applyTheme` 动态写入 CSS 自定义属性，无需刷新或重新加载样式表。主题选择保存在 `task-kanban-theme`。

## 测试

```bash
npm test
```

覆盖范围：

- `tests/storage.test.js`：读写、JSON 损坏降级、非法任务过滤、ID 唯一性
- `tests/TaskCard.test.js`：渲染、星标 / 紧急切换、删除、拖拽属性
- `tests/KanbanColumn.test.js`：列渲染、计数、空状态、拖放事件
- `tests/AddTaskModal.test.js`：必填校验、提交数据、取消、分类建议、默认列
- `tests/weeklyStats.test.js`：周边界、周统计口径、每日拆分、最活跃日、环比、非法输入
- `tests/seedTasks.test.js`：示例任务数量、三列分布、完成时间合法性
- `tests/useKanban.test.js`：示例数据初始化、完成时间写入与清除、直接创建到已完成列

## 后续可拓展

- 列内拖拽排序的键盘操作支持
- 按分类 / 星标 / 紧急筛选
- 关键词搜索
- 截止日期与过期提醒
- JSON 导入导出
- 多看板与 PWA 离线支持
