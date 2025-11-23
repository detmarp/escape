import UxElement from './uxelement.js';

// helper class for screengame
// draws and manages the game cards
export default class CardArea {
  constructor(parent, screengame) {
    this.parent = parent;
    this.screengame = screengame;
    this.tiny = screengame.tiny;
    this.uxe = new UxElement(this.parent);

    let y = 960 - 208;
    this.x0 = this.uxe.box(this.parent, {
      rect: [0, 0, 540, 208],
    });
    this.x1 = this.uxe.text(this.parent, {
      text: this.tiny ? `${JSON.stringify(Object.keys(this.tiny))}` : 'null',
    });
    this.marker = this.screengame.markers.add({
      rect: [0, y, 540, 208],
    });
    this.marker.delegate = this;
    this._update('Card Area Initialized');

  }
  /*
  tap
  click
  drag
  dragging
  anim?
  */
  _update(text) {
    this.x1.innerText = text;
  }

  onMarkers(action, params) {
    if (action === 'tap') {
      this._update('tap');
    }
    if (action === 'click') {
      this._update('click');
    }
    if (action === 'dragging') {
      this._update(`dragging ${JSON.stringify(Object.keys(params))}`);
    }
  }
}