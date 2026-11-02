import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import TaskCard from '../src/components/TaskCard.vue'

enableAutoUnmount(afterEach)

function createTask(overrides = {}) {
  return {
    id: 'task-1',
    title: '设计任务卡片',
    description: '完成卡片的视觉与交互细节',
    category: '设计',
    columnId: 'todo',
    starred: false,
    urgent: false,
    createdAt: Date.now() - 5 * 60 * 1000,
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('渲染标题、描述和分类标签', () => {
    const wrapper = mount(TaskCard, { props: { task: createTask() } })

    expect(wrapper.find('.card-title').text()).toBe('设计任务卡片')
    expect(wrapper.find('.card-desc').text()).toBe('完成卡片的视觉与交互细节')
    expect(wrapper.find('.category-tag').text()).toBe('设计')
    expect(wrapper.find('.card-time').text()).toContain('分钟前')
  })

  it('未填分类时展示未分类占位', () => {
    const wrapper = mount(TaskCard, { props: { task: createTask({ category: '' }) } })
    expect(wrapper.find('.category-tag').text()).toBe('未分类')
  })

  it('点击星标按钮触发 toggle 事件', async () => {
    const wrapper = mount(TaskCard, { props: { task: createTask() } })

    await wrapper.find('[data-test="star"]').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
    expect(wrapper.emitted('toggle')[0]).toEqual(['task-1', 'starred'])
  })

  it('点击紧急按钮触发 toggle 事件', async () => {
    const wrapper = mount(TaskCard, { props: { task: createTask() } })

    await wrapper.find('[data-test="urgent"]').trigger('click')

    expect(wrapper.emitted('toggle')[0]).toEqual(['task-1', 'urgent'])
  })

  it('点击删除按钮触发 remove 事件', async () => {
    const wrapper = mount(TaskCard, { props: { task: createTask() } })

    await wrapper.find('[data-test="delete"]').trigger('click')

    expect(wrapper.emitted('remove')[0]).toEqual(['task-1'])
  })

  it('星标与紧急状态反映为对应样式类', () => {
    const starred = mount(TaskCard, { props: { task: createTask({ starred: true }) } })
    expect(starred.find('.task-card').classes()).toContain('is-starred')
    expect(starred.find('.status').text()).toBe('重点')

    const urgent = mount(TaskCard, { props: { task: createTask({ urgent: true }) } })
    expect(urgent.find('.task-card').classes()).toContain('is-urgent')
    expect(urgent.find('.status').text()).toBe('紧急')
  })

  it('卡片设置 draggable 属性并在拖拽开始时抛出事件', async () => {
    const wrapper = mount(TaskCard, { props: { task: createTask() } })
    const card = wrapper.find('.task-card')

    expect(card.attributes('draggable')).toBe('true')

    await card.trigger('dragstart')

    expect(wrapper.emitted('drag-start')[0]).toEqual(['task-1'])
  })
})