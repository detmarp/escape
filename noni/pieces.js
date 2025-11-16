import PieceAnim from './pieceanim.js';
import PieceUx from './pieceux.js';

export default class Pieces {
  constructor(parent, owner = null) {
  this.lastDragSpot = null;
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
    this.paused = false;
  }

  pause(set = true) {
    this.paused = set;
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
    this._setPieceSpot(piece, spot);

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
  this._setPieceSpot(piece, spot);
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
      let piece = this.pieces[i];
      let isCurrentPiece = (this.currentPiece !== null && piece.id === this.currentPiece);
      let defaultLevel = isCurrentPiece ? 3 : 0;
      let finalLevel = (piece.id === pieceIndex && level !== undefined) ? level : defaultLevel;
      this.pieceUx.updatePieceStyle(piece, finalLevel);
    }
  }

  _setCurrentPiece(pieceIndex) {
    this.currentPiece = pieceIndex;
    this._highlightPiece(); // Refresh all piece highlights
  }

  _setCurrentSpot(spot) {
    let spotIndex = spot.index;
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
    if (this.owner?.onSpotTap) {
      this.owner.onSpotTap(spot);
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

  _setPieceSpot(piece, spot) {
    if (piece.spot !== spot) {
      if (piece.spot && piece.spot.pieces) {
        const idx = piece.spot.pieces.indexOf(piece);
        if (idx !== -1) {
          piece.spot.pieces.splice(idx, 1);
        }
      }
      piece.spot = spot;
      if (spot && spot.pieces) {
        spot.pieces.push(piece);
      }
    }
  }

  onFinger(action, pos, pos2) {
    //console.log(`ppp ${action} at (${pos[0]}, ${pos[1]})${pos2 ? ` to (${pos2[0]}, ${pos2[1]})` : ''}`);

    // Track pieces that need text updates
    let modifiedPieces = new Set();

    if (this.dragging) {
      if (action === 'drag' && pos2) {
        let dx = pos2[0] - this.dragging.startPos[0];
        let dy = pos2[1] - this.dragging.startPos[1];

        if (!this.dragging.active && (dx !== 0 || dy !== 0)) {
          // Only now, on first movement, start dragging
          let p = this.dragging.piece;
          if (p.nopickup) {
            // nopickup: start drag visually, but do not clear .spot or set .fromSpot
          } else {
            p.fromSpot = p.spot;
            this._setPieceSpot(p, null);
            modifiedPieces.add(p);
          }
          this.dragging.active = true;
          this._onDrag(p);
        }

        if (!this.dragging.active) {
          // Position hasn't changed yet
          return;
        }

        // Update piece position while dragging
        let [cx, cy] = this.dragging.startPosition;
        let [w, h] = this.dragging.piece.size;
        let newCx = cx + dx;
        let newCy = cy + dy;
        this.dragging.piece.position = [newCx, newCy];

        this.pieceUx.updatePiecePosition(this.dragging.piece, newCx - w/2, newCy - h/2);
        modifiedPieces.add(this.dragging.piece);

        // Highlight spot when dragging over it (use center position)
        let spot = this._findSpot([newCx, newCy]);
        if (spot) {
          this._highlightSpot(spot.index, 1);
        } else {
          this._highlightSpot();
        }

          // Call okToDrop (owner.canPieceDrop) when entering/exiting a spot
          if (spot !== this.lastDragSpot) {
            if (this.owner && typeof this.owner.canPieceDrop === 'function') {
              let canDrop = this._okToDrop(this.dragging.piece, spot);
              // Optionally, notify owner of enter/exit (customize as needed)
              if (spot) {
                if (this.owner.onDragEnterSpot) {
                  this.owner.onDragEnterSpot(this.dragging.piece, spot, canDrop);
                }
              }
              if (this.lastDragSpot && this.owner.onDragExitSpot) {
                this.owner.onDragExitSpot(this.dragging.piece, this.lastDragSpot);
              }
            }
            this.lastDragSpot = spot;
          }
      }
      else if (action === 'up') {
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
        modifiedPieces.add(this.dragging.piece);

        // If the piece's spot is still set and spot.nopickup, snap back to real spot
        let p = this.dragging.piece;
        if (p.nopickup) {
          this.sendTo(p, p.spot);
          modifiedPieces.add(p);
          this._highlightPiece();
          this._highlightSpot();
          this.dragging = null;
          return;
        }

        // Check if dropped into a spot (using center position)
        let droppedSpot = this._findSpot([newCx, newCy]);
        let canDrop = droppedSpot ? this._okToDrop(p, droppedSpot) : false;

        if (canDrop) {
          this._setPieceSpot(p, droppedSpot)  ;
          p.fromSpot = null;
          let clampedPosition = this.pieceAnim._clampToSpot(p);
          p.position = clampedPosition;
          let [cx, cy] = clampedPosition;
          let [w, h] = p.size;
          this.pieceUx.updatePiecePosition(p, cx - w/2, cy - h/2);
          this._setCurrentSpot(droppedSpot);
          this._setCurrentPiece(p.id);
          modifiedPieces.add(p);
        } else if (p.fromSpot) {
          droppedSpot = p.fromSpot;
          this.sendTo(p, p.fromSpot);
          modifiedPieces.add(p);
        } else {
          droppedSpot = null;
          this.kill(p);
        }

        this._onDrop(p, droppedSpot);
        this._highlightPiece();
        this._highlightSpot();
        this.dragging = null;
      }
    } else {
      if (action === 'hover') {
        let p = this._find(pos);
        if (p == null) {
          this._highlightPiece();
          let spot = this._findSpot(pos);
          if (spot) {
            this._highlightSpot(spot.index, 1);
          } else {
            this._highlightSpot();
          }
        } else {
          this._highlightPiece(p.id, 1);
        }
      } else if (action === 'down') {
        if (!this.paused) {
          let p = this._find(pos);
          if (p != null) {
            this._onTap(p);
            this._setCurrentPiece(p.id);
            this.currentSpot = null;
            this._highlightPiece(p.id, 2);
            this._moveToTop(this.pieces.indexOf(p));
            // Do NOT clear spot or set fromSpot yet; only do so on first movement
            this.dragging = {
              piece: p,
              startPos: pos,
              startPosition: [...p.position],
              active: false,
            };
          } else {
            let spot = this._findSpot(pos);
            if (spot) {
              this._setCurrentSpot(spot);
              this.currentPiece = null;
            } else {
              this._clearCurrent();
            }
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
