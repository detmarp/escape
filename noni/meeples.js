import UxElement from './uxelement.js';
import Swatches from './swatches.js';

/*
  Meeples are visible game pieces
  This class creates and draws meeples
  Animates and moves them
  A meeple can optionally refer to a marker (marker is a touch target area)
*/
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
      borderWidth: 2,
      background: swatch.color,
      radius: 8,
    });
    element.type = swatch.type;
    element.name = swatch.name;

    // add 'selected' decoration
    let decoration = this.uxe.box(element, {
      rect: [0, 0, params.rect[2]-2, params.rect[3]-2],
      border: '#fff',
      borderWidth: 3,
      radius: 12,
    });
    decoration.style.visibility = 'hidden';
    element.decoration = decoration;
    element.update = (p = {}) => {
      decoration.style.visibility = p.selected ? 'visible' : 'hidden';
    };

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

  sendToRect(meeple, rect) {
    this.updateRect(meeple, rect);
  }
}