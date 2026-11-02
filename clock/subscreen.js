const MARGIN = 4
const BORDER = 1
const PADDING = 2
const CHROME = (MARGIN + BORDER + PADDING) * 2

export function setupSubScreen(goto) {
  const subEl = document.getElementById('sub-screen')
  const gridEl = document.getElementById('menu-grid')
  gridEl.classList.remove('active')
  subEl.innerHTML = ''
  subEl.classList.add('active')

  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    box-sizing: content-box;
    margin: ${MARGIN}px auto 0;
    border: ${BORDER}px solid #aaa;
    padding: ${PADDING}px;
    background: #ccc;
    flex-shrink: 0;
    line-height: 0;
  `

  const canvas = document.createElement('canvas')
  canvas.style.display = 'block'
  canvas.style.background = '#fff'

  wrapper.appendChild(canvas)
  subEl.appendChild(wrapper)
  subEl.addEventListener('click', () => goto())

  let lastSize = 0

  return {
    canvas,
    resize() {
      const vw = document.documentElement.clientWidth
      const vh = window.innerHeight
      const size = Math.min(vw, vh) - CHROME
      if (size === lastSize) return
      lastSize = size
      wrapper.style.width = size + 'px'
      canvas.width = Math.round(400 * devicePixelRatio)
      canvas.height = Math.round(400 * devicePixelRatio)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
    }
  }
}
