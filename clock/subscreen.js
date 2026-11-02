const MARGIN = 4
const BORDER = 1
const PADDING = 2
const CHROME = (MARGIN + BORDER + PADDING) * 2

export function setupSubScreen(goto) {
  const subEl = document.getElementById('app')
  subEl.innerHTML = ''
  subEl.className = 'screen'

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

  canvas.width = 400
  canvas.height = 400

  let lastSize = 0
  function resize() {
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const size = Math.min(vw, vh) - CHROME
    if (size === lastSize) return
    lastSize = size
    wrapper.style.width = size + 'px'
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
  }
  resize()

  return { canvas, resize }
}
