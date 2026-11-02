import { setupSubScreen } from './subscreen.js'

export class Two {
  constructor(goto, screens, canvas = null) {
    if (canvas) {
      this.canvas = canvas
      this.resize = null
    } else {
      const sub = setupSubScreen(goto)
      this.canvas = sub.canvas
      this.resize = () => sub.resize()
      sub.resize()
    }
    this.ctx = this.canvas.getContext('2d')
    const h = Math.floor(Math.random() * 360)
    this.color = `hsl(${h}, 100%, 95%)`
    this.frame = 0
  }

  draw(now, ctx = this.ctx) {
    if (this.resize) this.resize()
    ctx.fillStyle = this.frame % 2 === 0 ? this.color : '#000'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.frame++
  }
}
