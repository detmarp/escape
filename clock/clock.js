import { Menu } from './menu.js'

const SCREENS = [
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  'one',
  'two',
  ]

export class Clock {
  constructor() {
    this.current = null
    this.goto = this.goto.bind(this)
  }

  run() {
    const param = new URLSearchParams(location.search).get('clock')
    if (param && SCREENS.includes(param)) {
      this.goto(param)
    } else {
      this.goto()
    }

    const tick = () => {
      if (this.current) {
        this.current.draw(new Date())
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  async goto(name = 'menu') {
    if (name === 'menu') {
      this.current = new Menu(this.goto, SCREENS)
      const target = location.pathname
      if (location.href !== location.origin + target) {
        history.replaceState(null, '', target)
      }
    } else {
      const mod = await import(`./${name}.js`)
      const ScreenClass = Object.values(mod)[0]
      this.current = new ScreenClass(this.goto, SCREENS)
      const target = `?clock=${name}`
      if (location.search !== target) {
        history.replaceState(null, '', target)
      }
    }
  }
}
