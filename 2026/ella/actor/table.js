import Arena from "./arena.js";
import Ocean from "./ocean.js";
import Offset from "./offset.js";
import Text from "./text.js";
import Missile from "./missile.js";
import Fx from './fx.js';
import Timer from './timer.js';

function _position(cell) {
  return [cell[0] * 24 + 12, cell[1] * 24 + 12];
}

function _add(from, to) {
  return [from[0] + to[0], from[1] + to[1]];
}

export default class Table {
  constructor(game) {
    this.game = game;
    this.arenas = [];
    this.arenaPositions = [[60, 20], [60, 320]];
  }

  added() {
    this.fxLayer = this._node.parent.addActor(this._makeFxLayer());
    this.fx = this.fxLayer._node.addActor(new Fx());

    for (let i = 0; i < 2; i++) {
      let board = this.game ? this.game.boards[i] : null;
      let pos = this._node.addActor(new Offset(this.arenaPositions[i]));
      this.arenas.push(pos._node.addActor(new Arena(board)));
    }
  }

  init() {
  }

  work(dt, time) {
  }

  draw(ctx) {
    ctx.fillStyle = '#8ac';
    ctx.fillRect(0, 0, 360, 580);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 360, 580);
  }

  setWinner(winner) {
    this.arenas[0].setEndGame(winner == 0);
    this.arenas[1].setEndGame(winner == 1);
  }

  onEvent(type, data) {
    if (type === 'missile') {
      let from = _add(this.arenaPositions[data.fromIndex], _position([4.5, 4.5]));
      let to = _add(this.arenaPositions[data.toIndex], _position(data.target));
      this._node.addActor(new Missile(from, to));
    }
    if (type === 'landed') {
      let from = _add(this.arenaPositions[data.fromIndex], _position([4.5, 4.5]));
      let to = _add(this.arenaPositions[data.toIndex], _position(data.target));
      let anim = data.hit ? 'explosion' : 'splash';
      this.fx.partA.spawnPrefab(anim, { x: to[0], y: to[1] });
    }
  }

  _makeFxLayer() {
    return {
    }
  }
}