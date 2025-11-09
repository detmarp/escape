import UxElement from './uxelement.js';

export default class Pieces {
  constructor(parent) {
    this.parent = parent;
    this.pieces = [];
    this.uxe = new UxElement(this.parent);
    this.id = 0;

    this.div = this.uxe.box(this.parent, {
      border: '#00ff00',
      text: 'pieces',
    });
    this.div.style.position = 'absolute';
    this.div.style.left = '0px';
    this.div.style.top = '0px';
    this.div.style.width = '100%';
    this.div.style.height = '100%';
  }

  addPiece(rect) {
    // rect is [x, y, w, h] in logical units
    let piece = this.uxe.box(this.div, {
      rect: rect,
    });
    piece.style.backgroundColor = '#ff0000';
    piece.textContent = `Piece ${this.id++}`;
    this.pieces.push(piece);
    return piece;
  }

  onFinger(action, pos, pos2) {
    if (pos2) {
      console.log(`PIECES FINGER: ${action} at (${pos[0]}, ${pos[1]}) and (${pos2[0]}, ${pos2[1]})`);
    } else {
      console.log(`PIECES FINGER: ${action} at (${pos[0]}, ${pos[1]})`);
    }
    if (action === 'down') {
      this.pieces[0].style.left = `calc(var(--scale) * ${pos[0]} - 40px)`;
      this.pieces[0].style.top = `calc(var(--scale) * ${pos[1]} - 40px)`;
    }
    if (action === 'hover') {
      this.pieces[1].style.left = `calc(var(--scale) * ${pos[0]} - 40px)`;
      this.pieces[1].style.top = `calc(var(--scale) * ${pos[1]} - 40px)`;
    }
    if (action === 'drag' && pos2) {
      this.pieces[2].style.left = `calc(var(--scale) * ${pos2[0]} - 40px)`;
      this.pieces[2].style.top = `calc(var(--scale) * ${pos2[1]} - 40px)`;
    }
    if (action === 'up') {
      this.pieces[3].style.left = `calc(var(--scale) * ${pos[0]} - 40px)`;
      this.pieces[3].style.top = `calc(var(--scale) * ${pos[1]} - 40px)`;
    }
  }

}
