function _cycle(center, radius, period, time) {
  let t = (time % period) / period;
  let angle = t * 2 * Math.PI;
  return [
    center[0] + Math.cos(angle) * radius,
    center[1] + Math.sin(angle) * radius,
  ];
}

function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 2, 0, 2 * Math.PI);
  ctx.fill();
}

function _curve(ctx, color, points) {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i][0] + points[i + 1][0]) / 2;
    const midY = (points[i][1] + points[i + 1][1]) / 2;
    ctx.quadraticCurveTo(points[i][0], points[i][1], midX, midY);
  }

  ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
  ctx.stroke();
}

function _rand(n) {
  return Math.floor(Math.random() * n);
}

function _randf(a, b) {
  return a + Math.random() * (b - a);
}

export default class OceanFx {
  constructor() {
  }

  init() {
    for (let i = 0; i < 40; i++) {
      let w = this._makeWave();
      this._node.tree.add(w, this._node);
    }
  }

  work(dt, time) {
  }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 240, 240);
  }

  _makeWave() {
    const self = this;

    let w = {
      init: function() {
        this._node.position = [
          _randf(20, 220),
          _randf(20, 220),
        ];
        this._node.ttl = _randf(4, 8);
        this.p = [
          [_randf(-40, -20), _randf(-5, 5)],
          [_randf(-10, 10), _randf(-5, 5)],
          [_randf(20, 40), _randf(-5, 5)],
        ];
        this.r = [_randf(10, 20), _randf(10, 20), _randf(10, 20)];
        this.d = [
          _randf(4, 8) * (_rand(2) ? 1 : -1),
          _randf(4, 8) * (_rand(2) ? 1 : -1),
          _randf(4, 8) * (_rand(2) ? 1 : -1),
        ];
        this.pos = [];
      },
      work: function(dt, time) {
        this.pos[0] = _cycle(this.p[0], this.r[0], this.d[0], time);
        this.pos[1] = _cycle(this.p[1], this.r[1], this.d[1], time);
        this.pos[2] = _cycle(this.p[2], this.r[2], this.d[2], time);
      },
      draw: function(ctx) {
        let a = Math.sin(Math.PI * this._node.t);
        _curve(
          ctx,
          `rgba(255, 0, 255, ${a})`,
          this.pos
        );
      },
      term: function() {
        self._node.tree.add(self._makeWave(), self._node);
      }
    };

    return w;
  }
}
