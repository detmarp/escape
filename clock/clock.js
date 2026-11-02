import { Menu } from './menu.js'
import { setupSubScreen } from './subscreen.js'

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
    this.tick = this.tick.bind(this)
    this.running = false
  }

  run() {
    const param = new URLSearchParams(location.search).get('clock')
    this.goto(param && SCREENS.includes(param) ? param : 'menu')
  }

  _setUrl(url) {
    const current = location.search || location.pathname
    const target = url.startsWith('?') ? url : location.pathname
    if (current !== target) history.replaceState(null, '', url)
  }

  tick() {
    if (!this.running) return
    if (this.resize) this.resize()
    if (this.current) this.current.draw(new Date())
    requestAnimationFrame(this.tick)
  }

  async goto(name = 'menu') {
    this.running = false
    this.current = null
    this.resize = null

    if (name === 'menu') {
      const menu = new Menu(this.goto, SCREENS)
      await menu.ready
      this.current = menu
      this._setUrl(location.pathname)
    } else {
      const { canvas, resize } = setupSubScreen(this.goto)
      const mod = await import(`./${name}.js`)
      const ScreenClass = Object.values(mod)[0]
      this.current = new ScreenClass(this.goto, SCREENS, canvas)
      this.resize = resize
      this._setUrl(`?clock=${name}`)
    }

    this.running = true
    this.tick()
  }
}
