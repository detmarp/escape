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
    //this.x0.style.background = 'linear-gradient(25deg, #c4a384ff 40%, #eccdabff 100%)';
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
    this.show(4);
  }

  _update(text) {
    this.x1.style.zIndex = 10;
    this.x1.style.position = 'absolute';
    this.x1.innerText = text;
  }

    // Animate rotation of SVG pattern (clockwise, 1/10 second)
    _rotateShape(svg) {
      // Reset any previous transition
      svg.style.transition = '';
      // Get current rotation
      let current = svg._rotation || 0;
      let next = current + 90;
      svg._rotation = next;
      // Animate
      svg.style.transition = 'transform 0.1s linear';
      svg.style.transform = `rotate(${next}deg)`;
      // Optionally, clean up transition after animation
      setTimeout(() => {
        svg.style.transition = '';
      }, 120);
    }

  onMarkers(action, params) {
    let start = 4;
    let space = 28;
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
      this.show(i);
    }
    if (action === 'click') {
      console.log('card clicked:', this.current, this.cards[this.current].card);
      // Animate rotation of the SVG pattern on the clicked card
      let cardDiv = this.cards[this.current];
      // Find the d element (pattern container)
      let d = cardDiv.d;
      if (d) {
        let svg = d.querySelector('svg');
        if (svg) {
          this._rotateShape(svg);
        }
      }
    }
    if (action === 'drag') {
      this.leftEdge = start + this.current * space; // track the front card edge
    }
    if (action === 'dragging') {
      let delta = params.position[0] - params.startPos[0];
      left = this.leftEdge + delta;
      left = Math.max(start, Math.min(left, start + space * (this.cards.length - 1)));
      this.current = Math.round((left - start) / space);
      this.show(this.current, left);
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
      text: card.text,
    });
    div.d = this.uxe.box(div, {
      rect: [216, 32, 104, 154],
      border: '#666666',
      borderWidth: 1,
      background: '#eeeeee',
      radius: 4,
    });
    // Add SVG pattern if card.shape exists
        if (card.shape) {
      let svg = this.uxe.makePatternSVG(card.shape);
      svg.style.position = 'absolute';
      svg.style.left = '0';
      svg.style.top = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      div.d.appendChild(svg);
    }

    return div;
  }

  show(value, offset = null) {
    //console.log('show called with:', value, offset);
    // value can be: index, short or category
    let index = this.cards.findIndex((c, i) =>
      i === value ||
      c.card.category === value ||
      c.card.short === value
    );
    index ??= 0;
    this.current = index;
    let start = 4;
    let space = 28;
    for (let i = 0; i < this.cards.length; i++) {
      let x = start + space * i;
      if (offset !== null && this.current == i) {
        x = offset;
      }
      this.cards[i].style.zIndex = 10 - Math.abs(i - index);
      this.cards[i].style.left = `calc(var(--scale) * ${x}px)`;
    }
    this.screengame.selectMeepleByName(this.cards[index].card.category);
  }
}