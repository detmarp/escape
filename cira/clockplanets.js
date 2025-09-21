export default class ClockPlanets {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this._makeTable();
    this.bodies.forEach((body, index) => { this._preprocess(body, index); });
    console.log(JSON.stringify(this.bodies, null, 2));
  }

  _makeTable() {
    this.bodies = [
      { dist: 0.0, size: 5, color: '#ffffee', host: null, year: 1, name: 'sun', type: 'star', },
      { dist: 0.4, size: 2.4, color: '#bbbbbb', host: 0, year: 0.1, name: 'mercury', type: 'planet', },
      { dist: 0.7, size: 6.0, color: '#eecb94', host: 0, year: 0.9, name: 'venus', type: 'planet', },
      { dist: 1.0, size: 6.4, color: '#00aaff', host: 0, year: 1.0, name: 'earth', type: 'planet', },
      { dist: 1.5, size: 3.4, color: '#ff4444', host: 0, year: 2.0, name: 'mars', type: 'planet', },
      { dist: 5.2, size: 70, color: '#e2c290', host: 0, year: 11.9, name: 'jupiter', type: 'planet', },
      { dist: 9.5, size: 58, color: '#ffe580', host: 0, year: 29.5, name: 'saturn', type: 'planet', },
      //{ dist: 160, size: 7, color: '#aaffff', host: 0, year: 84.0, name: 'uranus', },
      //{ dist: 170, size: 7, color: '#0044ff', host: 0, year: 164.8, name: 'neptune', },
      //{ dist: 190, size: 2, color: '#888888', host: 0, year: 248.0, name: 'pluto', },
      { dist: 10, size: 1.7, color: '#8888ff', host: 3, year: 0.0748, name: 'moon', type: 'moon', },
      { dist: 100, size: 1.7, color: '#8888ff', host: 6, year: 0.0, name: 'r1', type: 'ring', },
    ];
  }

  _preprocess(body, index) {
    body.index = index;
    body.type = body.type || 'planet';

    if (body.type === 'star') {
      body.r = 0;
      body.s = body.size;
    }
    else if (body.type === 'planet') {
      body.r = Math.log10(body.dist + 1) * (190 / Math.log10(10 + 1));
      body.s = Math.log10(body.size + 1) * (8 / Math.log10(58 + 1));
    }
    else {
      body.r = body.dist;
      body.s = body.size;
    }
  }

  _updateAngle(now) {
    var t = (now.getTime() / 1000 / 60 / 60 / 24 / 365.25);
    this.bodies.forEach(body => {
      body.angle = (-2 * Math.PI * t / body.year) % (2 * Math.PI);
    });
  }

  _updatePositions() {
    this.bodies.forEach(body => {
      // Apply logarithmic scale to distance
      let dist = Math.log10(body.dist + 1) * (200 / Math.log10(10 + 1));
      let centerX, centerY;
      if (body.host !== null) {
        centerX = this.bodies[body.host].x;
        centerY = this.bodies[body.host].y;
      } else {
        centerX = 200;
        centerY = 200;
      }
      body.x = centerX + body.r * Math.cos(body.angle);
      body.y = centerY + body.r * Math.sin(body.angle);
    });
  }

  work(now) {
    this._updateAngle(now);
    this._updatePositions();
  }

  draw(now) {
    this.work(now);

    this.bg();

    this.bodies.forEach(body => {
      this.arc([200, 200], body.dist, body.angle, body.angle + 1, '#ffeedd');
      this.drawDot(body.x, body.y, body.s, body.color);
    });
  }

  _draw(body) {
    if (body.type === 'ring') {
      this.arc([body.x, body.y], body.s * 4, 0, 2 * Math.PI, body.color, 1);
    }
    else {
      this.drawDot(body.x, body.y, body.s, body.color);
    }
  }

  drawDot(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  arc(center, radius, startAngle, endAngle, color) {
    const ctx = this.ctx;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const a0 = startAngle + (endAngle - startAngle) * (i / steps);
      const a1 = startAngle + (endAngle - startAngle) * ((i + 1) / steps);
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, a0, a1);
      ctx.strokeStyle = color;
      let taper = (steps - i) / steps;
      ctx.lineWidth = 0.5 * taper; // taper from 1 down to 0
      ctx.globalAlpha = 0.5 * taper; // taper from 1 down to 0
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  bg() {
    const ctx = this.ctx;
    ctx.fillStyle = '#123';
    ctx.fillRect(0, 0, 400, 400);
  }
}