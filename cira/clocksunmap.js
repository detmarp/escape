export default class ClockSunMap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.earthImg = new Image();
    this.earthImg.src = './earth-400x200.png';
  }

  draw(now = new Date()) {
    this.ctx.fillStyle = '#123';
    this.ctx.fillRect(0, 0, 400, 400);

    if (this.earthImg.complete) {
      this.ctx.drawImage(this.earthImg, 0, 100, 400, 200);
    }

    var utcNow = now

    const sun = this.getSun(utcNow);

    const x = (200 + (sun.longitude / 360) * 400) % 400;
    const y = 200 - (sun.latitude / 90) * 100;

    // Draw big orange dot
    this.ctx.beginPath();
    this.ctx.shadowColor = 'rgba(155,80,0,1)';
    this.ctx.shadowBlur = 15;
    for (let offset = -400; offset <= 400; offset += 400) {
      this.ctx.fillStyle = 'rgba(255,210,150,1)';
      this.ctx.arc(x + offset, y, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = 'rgba(255,255,200,1)';
      this.ctx.arc(x + offset, y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  getSun(datetime) {
    // datetime is a UTC Date object
    // Get newyears in UTC
    const startOfYear = new Date(Date.UTC(datetime.getUTCFullYear(), 0, 1));
    // Get d as days since new years; [0 - 365.25]
    const d = (datetime.getTime() - startOfYear.getTime()) / 86400000;
    // d is 0 for Jan 1, 100 for Apr 10, 359 for Xmas

    const declination = -23.45 * Math.cos(2 * Math.PI / 365.25 * (d + 10));
    // latitude
    // declination is +23.45 for June 21st, -23.45 for Dec 21st

    const equationOfTime = -0.171 * Math.sin(0.0337 * d + 0.465) - 0.129 * Math.sin(0.0178 * d - 0.15);
    // equationOfTime is [-0.3, 0.3] hours, wobble correction for time of year

    // Greenwich Hour Angle
    var gha = (datetime.getUTCHours() * 15)
        + (datetime.getUTCMinutes() * 0.25)
        + (equationOfTime * 60 * 0.25)
        -180; // Shift so noon = 0°
    // gha is [0, 360]
    // How many degrees west of Greenwich the sun is
    // 0 for Greenwich, 90 for Mexico, 270 (-90) for India
    const longitude = (-gha) % 360;

    return {
      latitude: declination,
      longitude: longitude,
    };
  }
}