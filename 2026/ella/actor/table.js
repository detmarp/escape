import Arena from "./arena.js";
import Ocean from "./ocean.js";
import Offset from "./offset.js";
import Text from "./text.js";

export default class Table {
  constructor(game) {
    this.game = game;
    this.arenas = [];
  }

  added() {
    let board0 = this.game ? this.game.boards[0] : null;
    let board1 = this.game ? this.game.boards[1] : null;

    let pos0 = this._node.addActor(new Offset([60, 20]));
    let pos1 = this._node.addActor(new Offset([60, 320]));

    this.arenas.push(pos0._node.addActor(new Arena(board0)));
    this.arenas.push(pos1._node.addActor(new Arena(board1)));

    let text = new Text(16, Text.MONO, '#fff');
    text.text = `game ${this.game ? this.game.id : 'none'}`;
    this._node.addActor(text);
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    ctx.fillStyle = '#655';
    ctx.fillRect(0, 0, 360, 580);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 360, 580);
  }
}