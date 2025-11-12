import PieceAnim from './pieceAnim.js';
import PieceUx from './pieceux.js';

export default class Pieces {
  constructor(parent) {
    this.parent = parent;
    this.pieceUx = new PieceUx(this.parent);
    this.spots = [];
    this.pieces = [];
    this.spotMap = {};
    this.pieceAnim = new PieceAnim(this);
    this.pieceMap = {};
    this.spotId = 0;
    this.pieceId = 0;
    this.dragging = null;
    this.highlightedSpot = null;
    this.currentSpot = null;
    this.currentPiece = null;
  }

  addSpot(rect) {
    // rect is [x, y, w, h] in logical units - spots keep rect as their definition
    let id = this.spotId++;
    let spot = this.pieceUx.makeSpot(id, rect);
    spot.rect = rect;
    spot.index = this.spots.length;
    spot.pieces = [];
    this.spots.push(spot);
    this.spotMap[id] = spot;
    return spot;
  }

  addPiece(size, position = [0, 0]) {
    // size is [w, h], position is [x, y] center point in logical units
    let id = this.pieceId++;
    let [w, h] = size;
    let [cx, cy] = position;
    // Calculate rect for initial rendering
    let rect = [cx - w/2, cy - h/2, w, h];
    let piece = this.pieceUx.makePiece(id, rect);
    // Pieces store position [x, y] and size [w, h] as core properties
    piece.position = position;
    piece.size = size;
    piece.index = this.pieces.length;
    this.pieces.push(piece);
    this.pieceMap[id] = piece;
    return piece;
  }

  newPiece(spotId, params = {}) {
    let spot = this.spotMap[spotId];
    let size = params.size || [80, 80];
    let position = this.pieceAnim._randomPoint(spot);
    let piece = this.addPiece(size, position);
    piece.spot = spot;

    // Clamp position and update rendering
    let clampedPosition = this.pieceAnim._clampToSpot(piece);
    piece.position = clampedPosition;
    let [cx, cy] = clampedPosition;
    let [w, h] = size;
    this.pieceUx.updatePiecePosition(piece, cx - w/2, cy - h/2);

    if (params.color) {
      piece.style.backgroundColor = params.color;
    }
    if (params.textColor) {
      piece.style.color = params.textColor;
    }
    this.pieceAnim._updateText(piece);
    return piece;
  }

  _getPieceRect(piece) {
    // Calculate rect [x, y, w, h] from position and size
    let [cx, cy] = piece.position;
    let [w, h] = piece.size;
    return [cx - w/2, cy - h/2, w, h];
  }

  kill(piece) {
    // TODO set a piece to die; make it immediately logically gone
  }

  sendTo(piece, spot) {
    // TODO start sending this piece to this spot
  }

  _okToDrop(piece, spot) {
    // TODO, return truthy if this piece (which is being dragged) can land here
  }

  _onDrag(piece, spot) {
    // Called when a drag begins
    console.log('eee Drag started for piece:', piece.id);
  }

  _onDrop(piece, spot) {
    // TODO called when a piece is dropped
    console.log('eee Drag ended for piece:', piece.id);
  }

  _onKill(piece) {
    // TODO we are killing this piece
  }


  _findSpot(pos) {
    // Find spot at logical position pos = [x, y] - returns last match (top-most)
    let found = null;
    for (let spot of this.spots) {
      let [x, y, w, h] = spot.rect;
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
      let [cx, cy] = piece.position; // Center position
      let [w, h] = piece.size;
      let x = cx - w/2;
      let y = cy - h/2;
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
        let [cx, cy] = this.dragging.startPosition;
        let [w, h] = this.dragging.piece.size;
        let dx = pos2[0] - pos[0];
        let dy = pos2[1] - pos[1];
        let newCx = cx + dx;
        let newCy = cy + dy;
        // Convert center to top-left for rendering
        this.pieceUx.updatePiecePosition(this.dragging.piece, newCx - w/2, newCy - h/2);

        // Highlight spot when dragging over it (use center position)
        let spot = this._findSpot([newCx, newCy]);
        if (spot) {
          this._highlightSpot(spot.index, 1);
        } else {
          this._highlightSpot();
        }
      }
      else if (action === 'up') {
        // Drop the piece
        let [cx, cy] = this.dragging.startPosition;
        let dx = pos[0] - this.dragging.startPos[0];
        let dy = pos[1] - this.dragging.startPos[1];
        let newCx = cx + dx;
        let newCy = cy + dy;
        this.dragging.piece.position = [newCx, newCy];

        // Check if dropped into a spot (using center position)
        let droppedSpot = this._findSpot([newCx, newCy]);

        if (droppedSpot) {
          // Dropped into a spot - make both the spot and piece current
          this._setCurrentSpot(droppedSpot.index);
          this._setCurrentPiece(this.dragging.piece.index);
        } else {
          // Dropped outside any spot - make the piece current, clear spot
          this._setCurrentPiece(this.dragging.piece.index);
          this.currentSpot = null;
        }

        this._onDrop(this.dragging.piece, droppedSpot);

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
            startPosition: [...p.position], // Copy the center position array
          };
          this._onDrag(p, p.spot);
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
