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

    this.x1 = this.uxe.text(this.x0, {
    });

    this._card(this.x0, null, [20, 0]);
    this._card(this.x0, null, [25, 2]);
    this._card(this.x0, null, [30, 4]);
    this._card(this.x0, null, [35, 6]);
    this._card(this.x0, null, [40, 8]);
    this._card(this.x0, null, [45, 10]);
    this._card(this.x0, null, [50, 12]);
    this._card(this.x0, null, [55, 14]);

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
    this.x1.style.zIndex = 10;
    this.x1.style.position = 'absolute';
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

  _card(parent, card, position) {
    let div = this.uxe.box(parent, {
      rect: [position[0], position[1], 400, 200],
      border: '#333333',
      borderWidth: 1,
      background: '#ffffff',
      radius: 8,
    });
    return div;
  }
}