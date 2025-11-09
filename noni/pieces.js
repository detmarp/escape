import UxElement from './uxelement.js';

export default class Pieces {
  constructor(parent) {
    this.parent = parent;
    this.pieces = [];
    this.uxe = new UxElement(this.parent);
    this.id = 0;
    this.dragging = null;

    this.div = this.uxe.box(this.parent, {
    });
    this.div.style.position = 'absolute';
    this.div.style.left = '0px';
    this.div.style.top = '0px';
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.div.style.pointerEvents = 'none'; // Let clicks pass through to elements below
  }

  addPiece(rect) {
    // rect is [x, y, w, h] in logical units
    let piece = this.uxe.box(this.div, {
      rect: rect,
      border: '#999999',
      borderWidth: 4,
      radius: 8,
    });
    piece.style.backgroundColor = '#ff0000';
    //piece.style.pointerEvents = 'auto'; // Re-enable pointer events for the piece itself
    piece.id = this.id++;
    piece.textContent = `Piece ${piece.id}`;
    piece.position = rect;

    piece.index = this.pieces.length;
    this.pieces.push(piece);
    return piece;
  }

  _find(pos) {
    // Find piece at logical position pos = [x, y] - returns last match (top-most)
    let found = null;
    for (let piece of this.pieces) {
      let [x, y, w, h] = piece.position;
      if (pos[0] >= x && pos[0] < x + w && pos[1] >= y && pos[1] < y + h) {
        found = piece;
      }
    }
    return found;
  }

  _highlight(pieceIndex, color) {
    color ||= '#999999';
    for (let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].style.borderColor = (i === pieceIndex) ? color : '#999999';
    }
  }

  _moveToTop(pieceIndex) {
    let piece = this.pieces[pieceIndex];

    // Remove from array and add to end
    this.pieces.splice(pieceIndex, 1);
    this.pieces.push(piece);

    // Update all piece.index values to match their array position
    for (let i = 0; i < this.pieces.length; i++) {
      this.pieces[i].index = i;
    }

    // Move DOM element to end (so it renders on top)
    this.div.appendChild(piece);
  }

  onFinger(action, pos, pos2) {
    //console.log(`ppp ${action} at (${pos[0]}, ${pos[1]})${pos2 ? ` to (${pos2[0]}, ${pos2[1]})` : ''}`);

    if (this.dragging) {
      if (action === 'drag' && pos2) {
        // Update piece position while dragging
        let [x, y, w, h] = this.dragging.startPosition;
        let dx = pos2[0] - pos[0];
        let dy = pos2[1] - pos[1];
        this.dragging.piece.style.left = `calc(var(--scale) * ${x + dx}px)`;
        this.dragging.piece.style.top = `calc(var(--scale) * ${y + dy}px)`;
      }
      else if (action === 'up') {
        // Drop the piece
        let [x, y, w, h] = this.dragging.startPosition;
        let dx = pos[0] - this.dragging.startPos[0];
        let dy = pos[1] - this.dragging.startPos[1];
        this.dragging.piece.position = [x + dx, y + dy, w, h];
        this._highlight();
        this.dragging = null;
      }
    }
    else {
      if (action === 'hover') {
        let p = this._find(pos);
        if (p == null) {
          this._highlight();
        }
        else {
          this._highlight(p.index, '#ffff00');
        }
      }
      else if (action === 'down') {
        let p = this._find(pos);
        if (p != null) {
          this._highlight(p.index, '#00ff00');
          this._moveToTop(p.index);
          this.dragging = {
            piece: p,
            startPos: pos,
            startPosition: [...p.position], // Copy the position array
          };
        }
      }
    }
  }
}
