import Markers from './markers.js';
import UxElement from './uxelement.js';
import Swatches from './swatches.js';

export default class Meeples {
  constructor(parent) {
    this.parent = parent;
    this.uxe = new UxElement(this.parent);
    this.list = [];
  }

  add(params = {}) {
    let swatches = new Swatches();
    let swatch = swatches.getSwatch(params.name);
    let element = this.uxe.box(this.parent, {
      rect: [...params.rect],
      border: '#999999',
      borderWidth: 14,
      background: swatch.color,
      type: swatch.type,
      name: swatch.name,
      radius: 8,
    });

    this.list.push(element);

    return element;
  }

  updateRect(meeple, rect) {
    meeple.style.left = `calc(var(--scale) * ${rect[0]}px)`;
    meeple.style.top = `calc(var(--scale) * ${rect[1]}px)`;
  }

  getRandom(rect) {
    const [x, y, w, h] = rect;
    const randX = Math.floor(x + Math.random() * w);
    const randY = Math.floor(y + Math.random() * h);
    return [randX, randY];
  }
}