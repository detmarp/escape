export default class SimpleBox200 {
  constructor() {
  }

  added() {
    this.addFrame = this._node.tree.frame;
  }

  init() {
    this.initFrame = this._node.tree.frame;
  }

  work(dt, time) {
    this.workFrame = this._node.tree.frame;
  }

  draw(ctx) {
    this.drawFrame = this._node.tree.frame;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.font = '16px monospace';
    const text = `SimpleBox200\nadded: ${this.addFrame}\ninit: ${this.initFrame}\nwork: ${this.workFrame}\ndraw: ${this.drawFrame}`;
    text.split('\n').forEach((line, i) => {
      ctx.fillText(line, 4, 16 + i * 18);
    });
  }
}