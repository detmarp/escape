export class One {
  constructor(goto, screens, canvas) {
    this.ctx = canvas.getContext('2d')
    const h = Math.floor(Math.random() * 360)
    this.color = `hsl(${h}, 100%, 50%)`
    this.frame = 0
  }

  draw(now, ctx = this.ctx) {
    ctx.fillStyle = this.frame % 2 === 0 ? this.color : '#fff'
    ctx.fillRect(0, 0, 400, 400)
    ctx.fillStyle = 'blue'
    ctx.font = '100px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(this.frame, 10, 110)
    this.frame++
  }
}
