const LOGICAL = 400
const MAX_TILE = 200
const GAP = 12
const PAD = 24

export class Menu {
  constructor(goto, screens) {
    this.goto = goto
    this.screens = screens
    this.instances = []

    this.gridEl = document.getElementById('app')
    this.gridEl.innerHTML = ''
    this.gridEl.className = 'menu'

    this._vw = 0
    this.ready = this._build(goto, screens)
  }

  async _build(goto, screens) {
    await Promise.all(screens.map(async (name) => {
      const tile = document.createElement('div')
      tile.className = 'tile'
      const canvas = document.createElement('canvas')
      canvas.width = LOGICAL
      canvas.height = LOGICAL
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, LOGICAL, LOGICAL)
      tile.appendChild(canvas)
      tile.addEventListener('click', (e) => { e.stopPropagation(); goto(name) })
      this.gridEl.appendChild(tile)
      const mod = await import(`./${name}.js`)
      const ScreenClass = Object.values(mod)[0]
      this.instances.push({ instance: new ScreenClass(goto, screens, canvas), ctx })
    }))

    this.gridEl.addEventListener('click', () => {
      const name = screens[Math.floor(Math.random() * screens.length)]
      goto(name)
    })
  }

  _layout() {
    const vw = document.documentElement.clientWidth
    const cols = vw < 500 ? 3 : vw < 800 ? 4 : vw < 1000 ? 5 : 6
    const available = vw - PAD * 2 - GAP * (cols - 1)
    const tileSize = Math.min(MAX_TILE, Math.floor(available / cols))
    this.gridEl.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`
  }

  draw(now) {
    const vw = document.documentElement.clientWidth
    if (vw !== this._vw) {
      this._vw = vw
      this._layout()
    }
    this.instances.forEach(({ instance, ctx }) => instance.draw(now, ctx))
  }
}
