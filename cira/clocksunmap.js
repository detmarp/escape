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

    var utcNow = new Date(now.toUTCString().slice(0, -4));
    const sun = this.getSun(utcNow);

    let centerX = 200;
    let centerY = 200;
    let radius = 195; // 390/2
    // Convert latitude/longitude to x/y on the clock face
    // Longitude: -180 (left) to +180 (right)
    // Latitude: -90 (bottom) to +90 (top)
    const x = 200 - (sun.longitude / 180) * 200;
    const y = 200 - (sun.latitude / 90) * 100;
    //console.log(`Subsolar latitude: ${sun.latitude}, longitude: ${sun.longitude}, x: ${x}, y: ${y}`);

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

  const d = (datetime - new Date(Date.UTC(datetime.getFullYear(), 0, 1))) / 86400000;

  // Solar Declination (latitude)
  const declination = -23.45 * Math.cos(2 * Math.PI / 365.25 * (d + 10));

  // Equation of Time and Hour Angle (for longitude)
  const equationOfTime = -0.171 * Math.sin(0.0337 * d + 0.465) - 0.129 * Math.sin(0.0178 * d - 0.15);

  // Hour Angle
  const gha = (datetime.getUTCHours() * 15) + (datetime.getUTCMinutes() * 0.25) + (equationOfTime * 60 * 0.25);

  const longitude = gha % 360;

  return {
    latitude: declination,
    longitude: longitude > 180 ? longitude - 360 : longitude,
  };
}
}