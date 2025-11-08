import UxElement from './uxelement.js';

export default class Pieces {
  constructor(parent) {
    this.parent = parent;
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

  addPiece() {
    let piece = this.uxe.box(this.div, {
    });
    piece.style.position = 'absolute';
    piece.style.left = `${Math.random() * (this.div.clientWidth - 100)}px`;
    piece.style.top = `${Math.random() * (this.div.clientHeight - 100)}px`;
    piece.style.width = '80px';
    piece.style.height = '80px';
    piece.style.backgroundColor = '#ff0000';
    piece.textContent = `Piece ${this.id++}`;
    return piece;
  }
}
