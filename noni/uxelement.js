export default class UxElement {
  constructor(container) {
    this.container = container;
  }

  testFill(parent = this.container) {
    let div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '100%';
    let hue = Math.random() * 360;
    let dark = (hue >= 200 || hue <= 30);
    div.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
    div.style.border = '1px solid grey';
    div.style.color = dark ? 'white' : 'black';
    div.style.display = 'flex';
    div.style.alignItems = 'flex-start';
    div.style.justifyContent = 'flex-start';
    div.style.padding = '8px';
    div.style.boxSizing = 'border-box';
    div.update = function() {
      this.textContent = `${this.offsetWidth} x ${this.offsetHeight}`;
    };
    parent.appendChild(div);
    div.update();
    return div;
  }
}
