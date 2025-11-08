import UxElement from './uxelement.js';

export default class Background {
  constructor(parent) {
    this.parent = parent;
    this.uxe = new UxElement(this.parent);
    this.img = new Image();
    this.img.src = './data/bg1.png';
    this.update();
  }

  update() {
    this.parent.innerHTML = '';
    this.outer = this.uxe.box(undefined, {
      fill: true,
      background: '#f08080',
    });
    const tileSize = 80;
    const cols = Math.ceil(this.parent.clientWidth / tileSize);
    const rows = Math.ceil(this.parent.clientHeight / tileSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = document.createElement('div');
        tile.style.position = 'absolute';
        tile.style.left = `${col * tileSize}px`;
        tile.style.top = `${row * tileSize}px`;
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.backgroundImage = `url(${this.img.src})`;
        tile.style.backgroundSize = 'cover';
        this.outer.appendChild(tile);
      }
    }
  }
}