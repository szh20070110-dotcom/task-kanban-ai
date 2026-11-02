export type ToastAction =
  | 'add'
  | 'move'
  | 'star'
  | 'unstar'
  | 'urgent'
  | 'urgent-off'
  | 'delete'
  | 'reset'

const MESSAGES: Record<ToastAction, string[]> = {
  add: [
    '新任务已就位，开始行动吧！🚀',
    '记下来，就是完成的开始 ✍️',
    '清单又多了一项，你可以的 💪',
  ],
  move: [
    '状态已更新，节奏刚刚好 🎯',
    '一步一步来，进度看得见 📈',
    '干得漂亮，继续保持 ⚡',
  ],
  star: [
    '已加星标，这件最重要 ⭐',
    '重点已锁定，优先处理 🔒',
    '星标任务，值得全力以赴 ✨',
  ],
  unstar: [
    '星标已取消，回归普通任务 🌱',
    '优先级调整完毕，轻松一点 🍃',
  ],
  urgent: [
    '已标记紧急，马上处理 🔥',
    '紧急任务已高亮，别让它等太久 ⏰',
    '火力全开，先解决它 🚨',
  ],
  'urgent-off': [
    '紧急标记已解除，松一口气 😌',
    '节奏放缓，按计划推进 🧘',
  ],
  delete: [
    '任务已移除，轻装上阵 🧹',
    '删掉不重要的，专注真正要紧的 🎯',
    '清爽了一点，继续前进 🌿',
  ],
  reset: [
    '看板已重置，新的开始 🌅',
    '一切归零，重新出发 🚪',
    '清空完成，轻装上路 🎒',
  ],
}

export function pickMessage(action: ToastAction): string {
  const list = MESSAGES[action] ?? MESSAGES.add
  return list[Math.floor(Math.random() * list.length)]
}