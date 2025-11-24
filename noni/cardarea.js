import UxElement from './uxelement.js';
import Swatches from './swatches.js';

// helper class for screengame
// draws and manages the game cards
export default class CardArea {
  constructor(parent, screengame) {
    this.parent = parent;
    this.screengame = screengame;
    this.tiny = screengame.tiny;
    this.uxe = new UxElement(this.parent);

    let y = 960 - 216;
    let rect = [0, 0, 540, 216];
    this.x0 = this.uxe.box(this.parent, {
      rect: rect,
    });
    this.x0.style.background = 'linear-gradient(25deg, #c4a384ff 40%, #eccdabff 100%)';
    this.marker = this.screengame.markers.add({
      rect: [rect[0], rect[1] + y, rect[2], rect[3]],
      fixed: true,
    });
    this.marker.delegate = this;

    this.x1 = this.uxe.text(this.x0, {
    });

    this.cards = [];
    let hand = this.tiny.getHand();
    for (let i = 0; i < hand.length; i++) {
      let card = hand[i];
      let position = [20 + i * 24, 6];

      let c = this._card(this.x0, card, position);
      c.index = i;
      c.card = card;
      this.cards.push(c);
    }
    this.current = 0;
    this.show(3);
  }

  _update(text) {
    this.x1.style.zIndex = 10;
    this.x1.style.position = 'absolute';
    this.x1.innerText = text;
  }

  onMarkers(action, params) {
    let start = 20;
    let space = 24;
    let width = 326;
    let left = start + space * this.current;
    let right = left + width;

    if (action === 'tap') {
      let x = params.position[0];
      let i = this.current;
      if (x < left) {
        i = Math.max(0, i - 1 - Math.floor((left - x) / space));
      }
      if (x > right) {
        i = Math.min(this.cards.length - 1, i + 1 + Math.floor((x - right) / space));
      }
      console.log(`${this.current} ${x} (${left} ${right})`);
      this.show(i);
    }
    if (action === 'click') {
    }
    if (action === 'drag') {
      this.dragCurrent = this.current;
    }
    if (action === 'dragging') {
      let delta = params.position[0] - params.startPos[0];
      let space = 24;
      let i = this.dragCurrent + Math.round(delta / space);
      i = Math.max(0, Math.min(this.cards.length - 1, i));
      this.show(i);
    }
  }

  _card(parent, card, position) {
    let div = this.uxe.box(parent, {
      rect: [position[0], position[1], 334, 200],
      border: '#333333',
      borderWidth: 1,
      background: '#dabe83ff',
      radius: 8,
    });

    let swatches = new Swatches();
    let swatch = swatches.getSwatch(card.category);

    let a = this.uxe.box(div, {
      rect: [3, 3, 326, 192 ],
      border: swatch.color,
      borderWidth: 4,
      background: '#ebdcb7ff',
      radius: 4,
      text: card.name,
    });
    a.style.paddingLeft = `calc(var(--scale) * 8px)`;

    let b = this.uxe.box(div, {
      rect: [302, 4, 24, 24],
      borderWidth: 2,
      background: swatch.color,
    });
    let c = this.uxe.box(div, {
      rect: [10, 32, 200, 154],
      border: '#666666',
      borderWidth: 1,
      background: '#eeeeee',
      radius: 4,
    });
    let d = this.uxe.box(div, {
      rect: [216, 32, 104, 154],
      border: '#666666',
      borderWidth: 1,
      background: '#eeeeee',
      radius: 4,
    });

    return div;
  }

  show(value) {
    // value can be: index, short or category
    let index = this.cards.findIndex((c, i) =>
      i === value ||
      c.card.category === value ||
      c.card.short === value
    );
    index ??= 0;
    this.current = index;
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].style.zIndex = 10 - Math.abs(i - index);
    }
    this.screengame.selectMeepleByName(this.cards[index].card.category);
  }
}