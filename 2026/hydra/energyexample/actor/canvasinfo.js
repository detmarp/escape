export default class CanvasInfo {
  constructor(canvas) {
    this.canvas = canvas;
  }

  added() {
    this.addFrame = this._node.tree.frame;
  }

  init() {
    this.initFrame = this._node.tree.frame;
  }

  work(dt, time) {
    this.workFrame = this._node.tree.frame;
    let w = 200;
    this._node.position = [this.canvas.width - w, 0];
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
    const scale = ctx.getTransform().a;
    const text = `CanvasInfo
Width: ${this.canvas.width}
Height: ${this.canvas.height}
Scale: ${scale.toFixed(2)}`;
    text.split('\n').forEach((line, i) => {
      ctx.fillText(line, 4, 16 + i * 18);
    });
  }
}