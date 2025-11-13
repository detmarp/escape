export default class PieceAnim {
  constructor(pieces) {
    this.pieces = pieces;
  }

  _updateText(piece) {
    let lines = [];
    lines.push(`id: ${piece.id}`);
    if (piece.spot) {
      lines.push(`spot: ${piece.spot.id}`);
    }
    if (piece.fromSpot) {
      lines.push(`from: ${piece.fromSpot.id}`);
    }
    if (piece.position) {
      lines.push(`pos: [${piece.position.join(', ')}]`);
    }
    if (piece.nopickup) {
      lines.push(`(nopickup)`);
    }
    piece.textContent = lines.filter(line => line).join('\n');
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