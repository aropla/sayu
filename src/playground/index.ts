import { Sayu } from '@/main'

const sayu = Sayu({
  el: '#radial-menu',
  items: [
    {
      title: '[1]创建 Task',
      content: 'Create Task',
    },
    {
      title: '[2]上一个网页',
      content: 'Last Page',
    },
    {
      title: '[3]个人资料',
      content: 'Account',
    },
    {
      title: '[4]设置',
      content: 'Setting',
    },
    {
      title: '[5]下一个网页',
      content: 'Next Page',
    },
    {
      title: '[6]Plana',
      content: 'Plana',
    }
  ],
  r: 600,
  R: 900,
  useCustomCursor: true,
  triggerOffset: 100,

  onSelect(menu) {
    console.error(menu)
  }
})

sayu.mount()

// sayu.show()
// sayu.hide()

console.log('[sayu instance]', sayu)
