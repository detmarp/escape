export function setupSubScreen(goto) {
  const subEl = document.getElementById('sub-screen')
  const gridEl = document.getElementById('menu-grid')
  gridEl.classList.remove('active')
  subEl.innerHTML = ''
  subEl.classList.add('active')

  const size = Math.min(window.innerWidth, window.innerHeight)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(400 * devicePixelRatio)
  canvas.height = Math.round(400 * devicePixelRatio)
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'
  subEl.appendChild(canvas)
  subEl.addEventListener('click', () => goto())
  return canvas
}
