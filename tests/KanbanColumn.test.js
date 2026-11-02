import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import KanbanColumn from '../src/components/KanbanColumn.vue'
import TaskCard from '../src/components/TaskCard.vue'

enableAutoUnmount(afterEach)

const column = { id: 'doing', title: '进行中', color: '#f59e0b' }

function createTask(id, overrides = {}) {
  return {
    id,
    title: `任务 ${id}`,
    description: '',
    category: '',
    columnId: 'doing',
    starred: false,
    urgent: false,
    createdAt: Date.now(),
    ...overrides,
  }
}

describe('KanbanColumn', () => {
  it('渲染列标题与任务数量', () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: [createTask('a'), createTask('b')] },
    })

    expect(wrapper.find('.column-title').text()).toBe('进行中')
    expect(wrapper.find('.column-count').text()).toBe('2')
    expect(wrapper.findAllComponents(TaskCard)).toHaveLength(2)
  })

  it('空列展示引导并触发新增事件', async () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: [] },
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)

    await wrapper.find('[data-test="empty-action"]').trigger('click')

    expect(wrapper.emitted('add-task')[0]).toEqual(['doing'])
  })

  it('拖放时向父组件抛出 move 事件', async () => {
    const wrapper = mount(KanbanColumn, {
      props: {
        column,
        taskList: [createTask('a'), createTask('b')],
        draggingId: 'task-9',
      },
    })

    const section = wrapper.find('.kanban-column')
    await section.trigger('dragover', { clientY: 100 })
    await section.trigger('drop', { clientY: 100 })

    expect(wrapper.emitted('move')).toHaveLength(1)
    expect(wrapper.emitted('move')[0][0]).toBe('task-9')
    expect(wrapper.emitted('move')[0][1]).toBe('doing')
    expect(typeof wrapper.emitted('move')[0][2]).toBe('number')
  })

  it('未处于拖拽状态时不响应拖放', async () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: [createTask('a')], draggingId: null },
    })

    await wrapper.find('.kanban-column').trigger('drop', { clientY: 10 })

    expect(wrapper.emitted('move')).toBeUndefined()
  })

  it('转发卡片的标记与删除事件', async () => {
    const wrapper = mount(KanbanColumn, {
      props: { column, taskList: [createTask('a')] },
    })

    const card = wrapper.findComponent(TaskCard)
    card.vm.$emit('toggle', 'a', 'starred')
    card.vm.$emit('remove', 'a')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('toggle')[0]).toEqual(['a', 'starred'])
    expect(wrapper.emitted('remove')[0]).toEqual(['a'])
  })
})