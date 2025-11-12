export default class PieceAnim {
  constructor(pieces) {
    this.pieces = pieces;
  }

  _updateText(piece) {
    // for now, set text contents, with newslines,
    // id: piece id
    // if .spot then show that id,
    // show position[]
    const spot = piece.spot ? `spot: ${piece.spot.id}` : '';
    const pos = piece.position ? `pos: [${piece.position.join(', ')}]` : '';
    piece.textContent = `id: ${piece.id}\n${spot}\n${pos}`;
  }

  _clampToSpot(piece) {
    // Clamp piece position so it fits within its spot's rect
    if (!piece.spot) return piece.position;

    let [sx, sy, sw, sh] = piece.spot.rect;
    let [w, h] = piece.size;
    let [cx, cy] = piece.position;

    // Handle X dimension
    let clampedX;
    if (w >= sw) {
      // Piece too wide, use center
      clampedX = sx + sw/2;
    } else {
      // Calculate valid X bounds
      let minX = sx + w/2;
      let maxX = sx + sw - w/2;
      clampedX = Math.max(minX, Math.min(maxX, cx));
    }

    // Handle Y dimension
    let clampedY;
    if (h >= sh) {
      // Piece too tall, use center
      clampedY = sy + sh/2;
    } else {
      // Calculate valid Y bounds
      let minY = sy + h/2;
      let maxY = sy + sh - h/2;
      clampedY = Math.max(minY, Math.min(maxY, cy));
    }

    return [Math.round(clampedX), Math.round(clampedY)];
  }

  _randomPoint(spot) {
    // Return a random [x, y] position within the spot
    let [sx, sy, sw, sh] = spot.rect;
    let x = sx + Math.random() * sw;
    let y = sy + Math.random() * sh;
    return [Math.round(x), Math.round(y)];
  }
};