export class Clock {
  constructor(el) {
    this.el = el
  }

  start() {
    const tick = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')
      const ff = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')
      this.el.textContent = `${hh}:${mm}:${ss}.${ff}`
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }
}
