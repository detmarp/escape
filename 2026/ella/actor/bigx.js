function _randf(min, max) {
  return min + Math.random() * (max - min);
}

function _offset(position, r) {
  return [position[0] + _randf(-r, r), position[1] + _randf(-r, r)];
}

function _add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

export default class BigX {
  constructor() {
    this.corner = [
      _offset([0, 0], 20),
      _offset([240, 0], 20),
      _offset([240, 240], 20),
      _offset([0, 240], 20),
    ];
  }

  draw(ctx) {
    let f0 = this._node.age * 4;
    let f1 = this._node.age * 4 - 1;
    ctx.strokeStyle = '#f40c';
    ctx.lineWidth = 22;
    ctx.lineCap = 'butt';  // Square ends like flat brush
    ctx.beginPath();
    this._stroke(ctx, this.corner[0], this.corner[2], f0);
    this._stroke(ctx, this.corner[1], this.corner[3], f1);
    ctx.stroke();  // Actually render the paths!
  }

  _stroke(ctx, from, to, f) {
    // clamp f [0,1]; then lerp from to to based on f.  draw the stroke of that fraction
    // assume beginPath already done
    f = Math.max(0, Math.min(1, f));
    ctx.moveTo(...from);
    let end = [
      from[0] + (to[0] - from[0]) * f,
      from[1] + (to[1] - from[1]) * f,
    ];
    ctx.lineTo(...end);
  }
}