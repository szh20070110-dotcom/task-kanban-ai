import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import AddTaskModal from '../src/components/AddTaskModal.vue'

enableAutoUnmount(afterEach)

const columns = [
  { id: 'todo', title: '待办', color: '#94a3b8' },
  { id: 'doing', title: '进行中', color: '#f59e0b' },
  { id: 'done', title: '已完成', color: '#10b981' },
]

function createWrapper(overrides = {}) {
  return mount(AddTaskModal, {
    props: {
      columns,
      existingCategories: ['开发', '设计'],
      initialColumnId: 'todo',
      ...overrides,
    },
    global: {
      stubs: { teleport: true },
    },
  })
}

describe('AddTaskModal', () => {
  it('渲染表单、列选项与已有分类', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.modal-title').text()).toBe('新增任务')
    expect(wrapper.find('[data-test="title-input"]').exists()).toBe(true)
    expect(wrapper.findAll('.column-option')).toHaveLength(3)
    expect(wrapper.findAll('datalist option')).toHaveLength(2)
    expect(wrapper.findAll('.category-chip')).toHaveLength(2)
  })

  it('标题为空时阻止提交并展示错误提示', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-test="task-form"]').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    expect(wrapper.find('[data-test="error"]').text()).toContain('请先填写任务标题')
  })

  it('提交时输出去除首尾空格后的完整数据', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-test="title-input"]').setValue('  写周报  ')
    await wrapper.find('[data-test="desc-input"]').setValue('  汇总本周进展  ')
    await wrapper.find('[data-test="category-input"]').setValue('  汇报  ')
    await wrapper.find('input[value="doing"]').setValue(true)
    await wrapper.find('[data-test="task-form"]').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      title: '写周报',
      description: '汇总本周进展',
      category: '汇报',
      columnId: 'doing',
    })
  })

  it('点击取消按钮触发 close 事件', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-test="cancel"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('点击已有分类芯片自动填入分类输入框', async () => {
    const wrapper = createWrapper()

    const chips = wrapper.findAll('.category-chip')
    await chips[1].trigger('click')

    expect(wrapper.find('[data-test="category-input"]').element.value).toBe('设计')
  })

  it('initialColumnId 决定默认选中的列', () => {
    const wrapper = createWrapper({ initialColumnId: 'doing' })

    const doingRadio = wrapper.find('input[value="doing"]')
    expect(doingRadio.element.checked).toBe(true)
  })
})