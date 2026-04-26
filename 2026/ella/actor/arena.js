import Ocean from "./ocean.js";
import OneBoat from "./oneboat.js";
import Temp from "./temp.js";
import Surface from "./surface.js";
import Air from "./air.js";
import BigX from "./bigx.js";

function _dot(ctx, color, position) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position[0], position[1], 2, 0, 2 * Math.PI);
  ctx.fill();
}

function _rect(ctx, color, rect) {
  ctx.fillStyle = color;
  ctx.fillRect(rect[0], rect[1], rect[2], rect[3]);
}

function _rand(n) {
  return Math.floor(Math.random() * n);
}

function _randf(a, b) {
  return a + Math.random() * (b - a);
}

function _toPosition(cell) {
  return [cell[0] * 24 + 12, cell[1] * 24 + 12];
}

export default class Arena {
  constructor(board) {
    this.board = board;
    this.seenShots = new Set();
  }

  added() {
    // make a ocean and ad as child
    let ocean = new Ocean();
    this._node.tree.addActor(ocean, this._node);

    this.below = this._node.addActor({});
    this.surface = new Surface(this.board);
    this.below._node.addActor(this.surface);

    if (this.board) {
      for (let b of this.board.ships) {
        this._node.addActor(new OneBoat(b));
      }
    }

    this.above = this._node.addActor({});
    this.above._node.addActor(new Air(this.board));
  }

  setEndGame(won) {
    if (won) {
    }
    else {
      this.above._node.addActor(new BigX());
    }
  }

  _addShot(shot) {
    this.surface.addShot(shot);
  }

  init() {
  }

  work(dt, time) {
    if (this.board) {
      if (this.board.shots.length > this.seenShots.size) {
        for (let s of this.board.shots) {
          if (!this.seenShots.has(s)) {
            this.seenShots.add(s);
            this._addShot(s);
          }
        }
      }
    }
  }

  draw(ctx) {
    if (this.board) {
      if (this.board.ready) {
        this._greenBorder(ctx);
      }
    }
  }

  _update() {
    if (this.board) {
    }
  }

  _greenBorder(ctx) {
    function s(color, width, padding) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.strokeRect(-padding, -padding, 240 + padding * 2, 240 + padding * 2);
    }
    s('#0f88', 6, 6);
    s('#0f4c', 2, 6);
  }
}