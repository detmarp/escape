import PieceAnim from './pieceAnim.js';
import PieceUx from './pieceux.js';

export default class Pieces {
  constructor(parent, owner = null) {
    this.parent = parent;
    this.owner = owner;
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
    // Remove piece from pieces array
    let index = this.pieces.indexOf(piece);
    if (index !== -1) {
      this.pieces.splice(index, 1);
      // Update all piece.index values to match their array position
      for (let i = 0; i < this.pieces.length; i++) {
        this.pieces[i].index = i;
      }
    }

    // Remove from pieceMap
    delete this.pieceMap[piece.id];

    // Remove DOM element
    this.pieceUx.removePiece(piece);

    // Notify owner
    this._onKill(piece);
  }

  sendTo(piece, spot) {
  // Send piece back to a spot (for auto-return)
  if (!spot) return;

  // Generate random position within the spot
  let position = this.pieceAnim._randomPoint(spot);

  // Clamp position to fit within spot
  piece.spot = spot;
  piece.fromSpot = null;
  let clampedPosition = this.pieceAnim._clampToSpot(piece);
  piece.position = clampedPosition;

  // Update visual position
  let [cx, cy] = clampedPosition;
  let [w, h] = piece.size;
  this.pieceUx.updatePiecePosition(piece, cx - w/2, cy - h/2);

  // Update text
  this.pieceAnim._updateText(piece);
  }

  _okToDrop(piece, spot) {
    // Check if piece can be dropped on spot
    if (this.owner?.canPieceDrop) {
      return this.owner.canPieceDrop(piece, spot);
    }
    return true; // default allow
  }

  _onDrag(piece) {
    // Called when a drag begins
    if (this.owner?.onPieceDragStart) {
      this.owner.onPieceDragStart(piece);
    }
  }

  _onDrop(piece, spot) {
    // Called when a piece is dropped
    if (this.owner?.onPieceDrop) {
      this.owner.onPieceDrop(piece, spot);
    }
  }

  _onTap(piece) {
    // Called when a piece is tapped (without dragging)
    if (this.owner?.onPieceTap) {
      this.owner.onPieceTap(piece);
    }
  }

  _onKill(piece) {
    // Called when a piece is killed
    if (this.owner?.onPieceKill) {
      this.owner.onPieceKill(piece);
    }
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

    // Track pieces that need text updates
    let modifiedPieces = new Set();

    if (this.dragging) {
      if (action === 'drag' && pos2) {
        // Check if position has actually changed
        let dx = pos2[0] - this.dragging.startPos[0];
        let dy = pos2[1] - this.dragging.startPos[1];

        if (!this.dragging.active && (dx !== 0 || dy !== 0)) {
          // Position changed - start dragging
          this.dragging.active = true;
          this._onDrag(this.dragging.piece);
        }

        if (!this.dragging.active) {
          // Position hasn't changed yet
          return;
        }

        // Update piece position while dragging
        let [cx, cy] = this.dragging.startPosition;
        let [w, h] = this.dragging.piece.size;
        let newCx = cx + dx;
        let newCy = cy + dy;        // Update piece's logical position
        this.dragging.piece.position = [newCx, newCy];

        // Convert center to top-left for rendering
        this.pieceUx.updatePiecePosition(this.dragging.piece, newCx - w/2, newCy - h/2);

        // Mark piece for text update
        modifiedPieces.add(this.dragging.piece);

        // Highlight spot when dragging over it (use center position)
        let spot = this._findSpot([newCx, newCy]);
        if (spot) {
          this._highlightSpot(spot.index, 1);
        } else {
          this._highlightSpot();
        }
      }
      else if (action === 'up') {
        // Check if this was actually a drag or just a tap
        if (!this.dragging.active) {
          // Never moved far enough to be a drag - treat as tap only
          this.dragging = null;
          return;
        }

        // Drop the piece
        let [cx, cy] = this.dragging.startPosition;
        let dx = pos[0] - this.dragging.startPos[0];
        let dy = pos[1] - this.dragging.startPos[1];
        let newCx = cx + dx;
        let newCy = cy + dy;
        this.dragging.piece.position = [newCx, newCy];

        // Mark piece for text update
        modifiedPieces.add(this.dragging.piece);

        // Check if dropped into a spot (using center position)
        let droppedSpot = this._findSpot([newCx, newCy]);

        // Check if the drop is valid
        let canDrop = droppedSpot ? this._okToDrop(this.dragging.piece, droppedSpot) : false;

        if (canDrop) {
          // Valid drop - assign piece to the new spot
          this.dragging.piece.spot = droppedSpot;
          this.dragging.piece.fromSpot = null;

          // Clamp position to fit within the spot
          let clampedPosition = this.pieceAnim._clampToSpot(this.dragging.piece);
          this.dragging.piece.position = clampedPosition;

          // Update visual position
          let [cx, cy] = clampedPosition;
          let [w, h] = this.dragging.piece.size;
          this.pieceUx.updatePiecePosition(this.dragging.piece, cx - w/2, cy - h/2);

          this._setCurrentSpot(droppedSpot.index);
          this._setCurrentPiece(this.dragging.piece.index);
          modifiedPieces.add(this.dragging.piece);
        } else if (this.dragging.piece.fromSpot && this.dragging.piece.fromSpot.autoreturn) {
          // Invalid drop and fromSpot has autoreturn - send piece back
          this.sendTo(this.dragging.piece, this.dragging.piece.fromSpot);
          modifiedPieces.add(this.dragging.piece);
        } else {
          // Invalid drop, no autoreturn - kill the piece
          this.kill(this.dragging.piece);
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
          // Tapped on a piece - notify owner and start drag
          this._onTap(p);
          this._setCurrentPiece(p.index);
          this.currentSpot = null;
          this._highlightPiece(p.index, 2);
          this._moveToTop(p.index);
          // Track where the piece came from, then clear its spot
          p.fromSpot = p.spot;
          p.spot = null;
          modifiedPieces.add(p);
          this.dragging = {
            piece: p,
            startPos: pos,
            startPosition: [...p.position], // Copy the center position array
            active: false, // Not actively dragging until moved beyond threshold
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

    // Update text for all modified pieces at the end
    for (let piece of modifiedPieces) {
      this.pieceAnim._updateText(piece);
    }
  }
}
