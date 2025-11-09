import PieceUx from './pieceux.js';

export default class Pieces {
  constructor(parent) {
    this.parent = parent;
    this.pieceUx = new PieceUx(this.parent);
    this.spots = [];
    this.pieces = [];
    this.spotId = 0;
    this.pieceId = 0;
    this.dragging = null;
    this.highlightedSpot = null;
    this.currentSpot = null;
    this.currentPiece = null;
  }

  addSpot(rect) {
    // rect is [x, y, w, h] in logical units
    let spot = this.pieceUx.makeSpot(this.spotId++, rect);
    spot.position = rect;
    spot.index = this.spots.length;
    this.spots.push(spot);
    return spot;
  }

  addPiece(rect) {
    // rect is [x, y, w, h] in logical units
    let piece = this.pieceUx.makePiece(this.pieceId++, rect);
    piece.position = rect;
    piece.index = this.pieces.length;
    this.pieces.push(piece);
    return piece;
  }

  _findSpot(pos) {
    // Find spot at logical position pos = [x, y] - returns last match (top-most)
    let found = null;
    for (let spot of this.spots) {
      let [x, y, w, h] = spot.position;
      if (pos[0] >= x && pos[0] < x + w && pos[1] >= y && pos[1] < y + h) {
        found = spot;
      }
    }
    return found;
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

  _highlightSpot(spotIndex, level) {
    // level: undefined = normal, 1 = highlighted (blue), 2 = current (white)
    if (level !== undefined) {
      this.highlightedSpot = spotIndex;
    } else {
      this.highlightedSpot = null;
    }

    // Update all spot styles
    for (let i = 0; i < this.spots.length; i++) {
      let state = 'normal';
      if (i === this.currentSpot) {
        state = 'current';
      } else if (i === this.highlightedSpot) {
        state = 'highlighted';
      }
      this.pieceUx.updateSpotStyle(this.spots[i], state);
    }
  }

  _highlightPiece(pieceIndex, level) {
    // level: undefined = normal, 1 = hover, 2 = active, 3 = current
    for (let i = 0; i < this.pieces.length; i++) {
      let isCurrentPiece = (this.currentPiece !== null && this.pieces[i].index === this.currentPiece);
      let defaultLevel = isCurrentPiece ? 3 : 0;
      let finalLevel = (i === pieceIndex && level !== undefined) ? level : defaultLevel;
      this.pieceUx.updatePieceStyle(this.pieces[i], finalLevel);
    }
  }

  _setCurrentPiece(pieceIndex) {
    this.currentPiece = pieceIndex;
    this._highlightPiece(); // Refresh all piece highlights
  }

  _setCurrentSpot(spotIndex) {
    this.currentSpot = spotIndex;
    // Refresh spot highlights to show current state
    for (let i = 0; i < this.spots.length; i++) {
      let state = 'normal';
      if (i === this.currentSpot) {
        state = 'current';
      } else if (i === this.highlightedSpot) {
        state = 'highlighted';
      }
      this.pieceUx.updateSpotStyle(this.spots[i], state);
    }
  }

  _clearCurrent() {
    this.currentPiece = null;
    this.currentSpot = null;
    this._highlightPiece(); // Refresh piece highlights
    this._highlightSpot(); // Refresh spot highlights
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
    this.pieceUx.movePieceToTop(piece);
  }

  onFinger(action, pos, pos2) {
    //console.log(`ppp ${action} at (${pos[0]}, ${pos[1]})${pos2 ? ` to (${pos2[0]}, ${pos2[1]})` : ''}`);

    if (this.dragging) {
      if (action === 'drag' && pos2) {
        // Update piece position while dragging
        let [x, y, w, h] = this.dragging.startPosition;
        let dx = pos2[0] - pos[0];
        let dy = pos2[1] - pos[1];
        this.pieceUx.updatePiecePosition(this.dragging.piece, x + dx, y + dy);

        // Highlight spot when dragging over it
        let currentPos = [x + dx + w/2, y + dy + h/2]; // Use center of piece
        let spot = this._findSpot(currentPos);
        if (spot) {
          this._highlightSpot(spot.index, 1);
        } else {
          this._highlightSpot();
        }
      }
      else if (action === 'up') {
        // Drop the piece
        let [x, y, w, h] = this.dragging.startPosition;
        let dx = pos[0] - this.dragging.startPos[0];
        let dy = pos[1] - this.dragging.startPos[1];
        let newX = x + dx;
        let newY = y + dy;
        this.dragging.piece.position = [newX, newY, w, h];

        // Check if dropped into a spot
        let centerPos = [newX + w/2, newY + h/2];
        let droppedSpot = this._findSpot(centerPos);

        if (droppedSpot) {
          // Dropped into a spot - make both the spot and piece current
          this._setCurrentSpot(droppedSpot.index);
          this._setCurrentPiece(this.dragging.piece.index);
        } else {
          // Dropped outside any spot - make the piece current, clear spot
          this._setCurrentPiece(this.dragging.piece.index);
          this.currentSpot = null;
        }

        this._highlightPiece();
        this._highlightSpot(); // Clear hover highlight
        this.dragging = null;
      }
    }
    else {
      if (action === 'hover') {
        let p = this._find(pos);
        if (p == null) {
          this._highlightPiece();
          // Highlight spot on hover if no piece is found
          let spot = this._findSpot(pos);
          if (spot) {
            this._highlightSpot(spot.index, 1);
          } else {
            this._highlightSpot();
          }
        }
        else {
          this._highlightPiece(p.index, 1);
        }
      }
      else if (action === 'down') {
        let p = this._find(pos);
        if (p != null) {
          // Tapped on a piece - make it current
          this._setCurrentPiece(p.index);
          this.currentSpot = null;
          this._highlightPiece(p.index, 2);
          this._moveToTop(p.index);
          this.dragging = {
            piece: p,
            startPos: pos,
            startPosition: [...p.position], // Copy the position array
          };
        } else {
          // Check if tapped on a spot
          let spot = this._findSpot(pos);
          if (spot) {
            // Tapped on a spot - make it current
            this._setCurrentSpot(spot.index);
            this.currentPiece = null;
          } else {
            // Tapped outside any piece or spot - clear current
            this._clearCurrent();
          }
        }
      }
    }
  }
}
