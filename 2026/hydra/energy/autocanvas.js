export default class AutoCanvas {
  static setFullscreenCanvas(parentElement = document.body) {
    let canvas = parentElement.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      parentElement.appendChild(canvas);
    }
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    canvas.style.border = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.resize = () => {
      // to be called manually by the owner
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    return canvas;
  }

  constructor(params = {}) {
  }

  resize() {
  }
}
