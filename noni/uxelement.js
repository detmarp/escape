export default class UxElement {
  constructor(container) {
    this.container = container;
  }

  testFill(parent, params = {}) {
    parent ||= this.container;
    let radius = params.radius || 0;

    let div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    let hue = Math.random() * 360;
    let dark = (hue >= 210 || hue <= 35);
    div.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    div.style.border = '1px solid grey';
    if (radius) {
      div.style.borderRadius = `${radius}px`;
    }
    div.style.color = dark ? 'white' : 'black';
    div.style.display = 'flex';
    div.style.alignItems = 'flex-start';
    div.style.justifyContent = 'flex-start';
    div.style.padding = '8px';
    div.style.boxSizing = 'border-box';
    div.style.whiteSpace = 'pre-wrap';
    div.update = function() {
      this.textContent = [
        `${this.offsetWidth} x ${this.offsetHeight}`,
        'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
        `${parent.aspect?.toFixed(3) ?? parent.aspect}`,
        `${parent.aspect *600}`,
      ].join('\n');
    };
    parent.appendChild(div);
    div.update();
    return div;
  }

  box(parent, params = {}) {
    parent ||= this.container;
    let x = params.x || 0;
    let y = params.y || 0;
    let width = params.width || 100;
    let height = params.height || 100;
    let radius = params.radius || 0;
    let div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.backgroundColor = 'transparent';
    div.style.border = '1px solid grey';
    if (radius) {
      div.style.borderRadius = `${radius}px`;
    }
    parent.appendChild(div);
    return div;
  }
}
