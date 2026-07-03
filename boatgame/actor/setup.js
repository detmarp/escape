import Arena from "./arena.js";
import Ocean from "./ocean.js";
import Offset from "./offset.js";
import GameText from "./gametext.js";
import Missile from "./missile.js";
import Fx from './fx.js';
import Timer from './timer.js';
import ShipBoard from '../shipboard.js';

function _position(cell) {
  return [cell[0] * 24 + 12, cell[1] * 24 + 12];
}

function _add(from, to) {
  return [from[0] + to[0], from[1] + to[1]];
}

export default class Setup {
  constructor(game, params = {}) {
    this.game = game;
    this.params = params;
    this.board = new ShipBoard();
    this.arenas = [];
    this.arenaPositions = [[60, 40], [60, 330]];
  }

  added() {
    this.fxLayer = this._node.parent.addActor(this._makeFxLayer());
    this.fx = this.fxLayer._node.addActor(new Fx());

    let i = 0;
    let board = this.board;
    let pos = this._node.addActor(new Offset(this.arenaPositions[i]));
    let hidden = false;
    this.arenas.push(pos._node.addActor(new Arena(board, { hidden })));

    let labelA = 'Deploy your fleet';
    let labelB = '';
    this.text = this.fxLayer._node.addActor(new GameText(labelA, labelB));
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    ctx.fillStyle = '#8ac';
    ctx.fillRect(0, 0, 360, 610);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 360, 610);
  }

  _makeFxLayer() {
    return {
    }
  }
}