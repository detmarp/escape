import UxElement from '../noni/uxelement.js';

export default class PieceUx {
  constructor(parent) {
    this.parent = parent;
    this.uxe = new UxElement(this.parent);

    // Container for spots (rendered first, so under pieces)
    this.spotDiv = this.uxe.box(this.parent, {});
    this.spotDiv.style.position = 'absolute';
    this.spotDiv.style.left = '0px';
    this.spotDiv.style.top = '0px';
    this.spotDiv.style.width = '100%';
    this.spotDiv.style.height = '100%';
    this.spotDiv.style.pointerEvents = 'none';

    // Container for pieces (rendered on top of spots)
    this.pieceDiv = this.uxe.box(this.parent, {});
    this.pieceDiv.style.position = 'absolute';
    this.pieceDiv.style.left = '0px';
    this.pieceDiv.style.top = '0px';
    this.pieceDiv.style.width = '100%';
    this.pieceDiv.style.height = '100%';
    this.pieceDiv.style.pointerEvents = 'none'; // Container lets clicks through
  }

  makeSpot(id, rect) {
    // rect is [x, y, w, h] in logical units
    let spot = this.uxe.box(this.spotDiv, {
      rect: rect,
      border: '#666666',
      borderWidth: 1,
      radius: 8,
    });
    spot.style.backgroundColor = 'transparent';
    spot.id = id;
    spot.textContent = `Spot ${id}`;
    return spot;
  }

  makePiece(id, rect) {
    // rect is [x, y, w, h] in logical units
    let piece = this.uxe.box(this.pieceDiv, {
      rect: rect,
      border: '#999999',
      borderWidth: 4,
      radius: 8,
    });
    piece.style.backgroundColor = '#ff0000';
    piece.style.pointerEvents = 'auto'; // Pieces block clicks to elements below
    piece.id = id;
    piece.textContent = `Piece ${id}`;
    return piece;
  }

  updateSpotStyle(spot, state) {
    // state can be: 'normal', 'highlighted', 'current'
    if (state === 'current') {
      spot.style.borderColor = '#ffffff';
      spot.style.borderWidth = 'calc(var(--scale) * 3px)';
    } else if (state === 'highlighted') {
      spot.style.borderColor = '#00aaff';
      spot.style.borderWidth = 'calc(var(--scale) * 3px)';
    } else {
      spot.style.borderColor = '#666666';
      spot.style.borderWidth = 'calc(var(--scale) * 1px)';
    }
  }

  updatePieceStyle(piece, level) {
    // level: undefined/0 = normal, 1 = hover (yellow), 2 = active (green), 3 = current (white)
    let color = '#999999'; // default
    if (level === 1) {
      color = '#ffff00'; // hover
    } else if (level === 2) {
      color = '#00ff00'; // active/grabbed
    } else if (level === 3) {
      color = '#ffffff'; // current
    }
    piece.style.borderColor = color;
  }

  updatePiecePosition(piece, x, y) {
    piece.style.left = `calc(var(--scale) * ${x}px)`;
    piece.style.top = `calc(var(--scale) * ${y}px)`;
  }

  movePieceToTop(piece) {
    // Move DOM element to end (so it renders on top)
    this.pieceDiv.appendChild(piece);
  }
}