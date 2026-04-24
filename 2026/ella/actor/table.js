import Ocean from "./ocean.js";
import Offset from "./offset.js";

export default class Table {
  constructor() {
    this.ocean = [];
  }

  init() {
    let pos0 = this._node.tree.addActor(new Offset([60, 20]));
    this.ocean.push(this._node.tree.addActor(new Ocean(), pos0._node));

    let pos1 = this._node.tree.addNode({ position: [60, 320] });
    this.ocean.push(this._node.tree.addActor(new Ocean(), pos1._node));
  }

  work(dt, time) {
  }

  draw(ctx) {
    ctx.fillStyle = '#655a';
    ctx.fillRect(0, 0, 360, 580);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 360, 580);
  }
}