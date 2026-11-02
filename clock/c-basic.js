const CX = 200, CY = 200, R = 190

function hand(ctx, angle, length, width, color) {
  ctx.save()
  ctx.translate(CX, CY)
  ctx.rotate(angle)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, -length)
  ctx.stroke()
  ctx.restore()
}

export class CBasic {
  constructor(goto, screens) {}

  draw(now, ctx) {
    const s = now.getSeconds() + now.getMilliseconds() / 1000
    const m = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + m / 60
    const third = s % 1

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 400, 400)

    ctx.strokeStyle = '#111'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(CX, CY, R, 0, Math.PI * 2)
    ctx.stroke()

    hand(ctx, (h / 12) * Math.PI * 2, 110, 5, '#444')
    hand(ctx, (m / 60) * Math.PI * 2, 180, 3, '#444')
    hand(ctx, (s / 60) * Math.PI * 2, 180, 1.5, 'red')
    hand(ctx, third * Math.PI * 2, 180, 1.5, 'blue')
  }
}
