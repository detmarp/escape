export default class DrawX {
  constructor() {
  }

  work(dt, time, frame) {
  }

  draw(ctx) {
    // draw a big red x, like with a wide flat brush, in a 240x240 square
    ctx.strokeStyle = '#f008';
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(220, 220);
    ctx.moveTo(220, 0);
    ctx.lineTo(0, 220);
    ctx.stroke();
  }
}