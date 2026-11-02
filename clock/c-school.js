function noise(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function hand(ctx, cx, cy, angle, length, width, color) {
  ctx.save()
  ctx.translate(cx, cy)
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

export class CSchool {
  constructor(goto, screens) {
    this.centerx = 200
    this.centery = 200
    this.radius = 180
    this.lightAngle = Math.PI * 2 * (1.5 / 12)
    this.lightX = Math.sin(this.lightAngle)
    this.lightY = Math.cos(this.lightAngle)
    this.bezelWidth = 6
    this.hourLen = this.radius * 0.57
    this.minuteLen = this.radius * 0.89
    this.secondLen = this.radius * 0.89
    this.speckles = 4000
    this.tones = []
    for (let v = 100; v < 160; v++) {
      this.tones.push(`rgb(${v},${v},${v})`)
    }
  }

  _getTime(now) {
    this.s = now.getSeconds() + now.getMilliseconds() / 1000
    this.m = now.getMinutes() + this.s / 60
    this.h = (now.getHours() % 12) + this.m / 60
  }

  _bg(ctx) {
    ctx.fillStyle = '#999'
    ctx.fillRect(0, 0, 400, 400)
    const tones = this.tones
    for (let i = 0; i < this.speckles; i++) {
      const x = noise(i) * 400
      const y = noise(i + 0.713) * 400
      ctx.fillStyle = tones[Math.floor(noise(i + 0.317) * tones.length)]
      ctx.fillRect(x, y, 1, 1)
    }
  }

  _bezelShadow(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.8)'
    ctx.filter = `blur(30px)`
    ctx.beginPath()
    ctx.arc(this.centerx - 20, this.centery + 20, this.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.filter = 'none'
  }

  _disk(ctx) {
    const shiner = this.radius * 0.6;
    const grad = ctx.createRadialGradient(this.centerx + this.lightX * shiner, this.centery - this.lightY * shiner, 0, this.centerx, this.centery, this.radius)
    grad.addColorStop(0, '#fff')
    grad.addColorStop(0.4, '#eee')
    grad.addColorStop(1, '#ccc')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(this.centerx, this.centery, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  _diskShadow(ctx) {
    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = this.bezelWidth
    ctx.beginPath()
    const shadowOffsetMagnitude = 5
    const shadowOffsetX = -this.lightX * shadowOffsetMagnitude
    const shadowOffsetY = this.lightY * shadowOffsetMagnitude
    ctx.arc(this.centerx + shadowOffsetX, this.centery + shadowOffsetY, this.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  _drawNumbers(ctx) {
    ctx.save()
    ctx.translate(this.centerx, this.centery)
    ctx.fillStyle = '#222'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const yOffset = 5

    const numberRadius = this.radius * 0.72

    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 // Adjust for 12 o'clock at the top
      const x = numberRadius * Math.cos(angle)
      const y = numberRadius * Math.sin(angle) + yOffset
      ctx.fillText(i.toString(), x, y)
    }
    ctx.restore()
  }

  _bezel(ctx) {
    ctx.strokeStyle = '#222'
    ctx.lineWidth = this.bezelWidth
    ctx.beginPath()
    ctx.arc(this.centerx, this.centery, this.radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  _handsShadow(ctx) {
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.filter = `blur(2px)`

    const shadowOffsetMagnitude = 4
    const shadowOffsetX = -this.lightX * shadowOffsetMagnitude
    const shadowOffsetY = this.lightY * shadowOffsetMagnitude

    // Draw shadows for each hand with the calculated offset
    hand(ctx, this.centerx + shadowOffsetX, this.centery + shadowOffsetY, (this.h / 12) * Math.PI * 2, this.hourLen, 5, 'rgba(0,0,0,0.4)')
    hand(ctx, this.centerx + shadowOffsetX, this.centery + shadowOffsetY, (this.m / 60) * Math.PI * 2, this.minuteLen, 3, 'rgba(0,0,0,0.4)')
    hand(ctx, this.centerx + shadowOffsetX, this.centery + shadowOffsetY, (this.s / 60) * Math.PI * 2, this.secondLen, 1.5, 'rgba(0,0,0,0.4)')

    ctx.restore()
    ctx.filter = 'none'
  }

  _hands(ctx) {
    hand(ctx, this.centerx, this.centery, (this.h / 12) * Math.PI * 2, this.hourLen, 5, '#444')
    hand(ctx, this.centerx, this.centery, (this.m / 60) * Math.PI * 2, this.minuteLen, 3, '#444')
    hand(ctx, this.centerx, this.centery, (this.s / 60) * Math.PI * 2, this.secondLen, 1.5, 'red')
  }

  _drawTicks(ctx) {
    ctx.save()
    ctx.translate(this.centerx, this.centery)
    ctx.fillStyle = '#222'
    const tickLength = 10
    const hourTickLength = 15
    const tickWidth = 1.5
    const hourTickWidth = 3
    const outerRadius = this.radius - this.bezelWidth - 5

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2
      ctx.rotate(angle)
      ctx.beginPath()
      if (i % 5 === 0) {
        ctx.rect(-hourTickWidth / 2, -outerRadius, hourTickWidth, hourTickLength)
      } else {
        ctx.rect(-tickWidth / 2, -outerRadius, tickWidth, tickLength)
      }
      ctx.fill()
      ctx.rotate(-angle) // Rotate back for the next tick
    }
    ctx.restore()
  }

  _drawShine(ctx) {
    ctx.save()
    ctx.filter = `blur(1px)`
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()

    const shineRadius = this.radius - 40
    const shineAngleStart = this.lightAngle -1.5 -0.3
    const shineAngleEnd = this.lightAngle + -1.5 + 0.3

    ctx.arc(this.centerx, this.centery, shineRadius, shineAngleStart, shineAngleEnd)
    ctx.stroke()
    ctx.restore()
  }

  draw(now, ctx) {
    this._getTime(now)
    this._bg(ctx)
    this._bezelShadow(ctx)
    this._disk(ctx)
    this._diskShadow(ctx)
    this._handsShadow(ctx)
    this._hands(ctx)
    this._drawTicks(ctx)
    this._drawNumbers(ctx)
    this._bezel(ctx)
    this._drawShine(ctx)
  }
}
