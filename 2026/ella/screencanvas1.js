import Board from './board.js';
import Ux2 from './ux2.js';
import Celest from '../celest/celest.js';
import NodeTree from './nodetree.js';
import OceanFx from './oceanfx.js';

export default class ScreenCanvas1 {
  static count = 0;

  constructor(parent, params) {
    this.parent = parent;
    this.params = params;
  }

  init() {
    ScreenCanvas1.count++;

    this.celest = new Celest(this.parent, 360, 640);
    this.celest.init();

    this.celest.outer.style.backgroundColor = '#8B4A8B';
    this.celest.inner.style.backgroundColor = '#8b8b8b';

    this.ux = new Ux2(this.celest.inner);

    this.header = this.ux.header({
      parent: this.celest.inner,
      onhome: () => this.params.program.goto('main')
    });

    this.bottom = this.ux.div({
      parent: this.celest.inner,
      size: [360, 610],
      position: [0, 30],
    });

    this.board = new Board(this.bottom, {
    });
    this.board.init();

    this.nodeTree = new NodeTree({
      canvas: this.board.canvas,
    });

    this._setupScene();
  }

  term() {
    if (this.board) {
      this.board.term();
    }
  }

  work(dt, time, frame) {
    this.board.update();
    this.nodeTree.update();
  }

  _setupOcean() {
    let root = this.nodeTree.add(
      null,
      null,
      { position: [60, 320], }
    );
    this.nodeTree.add(new OceanFx(), root._node);
  }

  _setupScene() {
    this._setupOcean();

    function _rect(ctx, color, r) {
      // local helper
      ctx.fillStyle = color;
      ctx.fillRect(r[0], r[1], r[2], r[3]);
    }
    function _circ(ctx, color, c, r) {
      // local helper
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, 2 * Math.PI);
      ctx.fill();
    }
    function _rnd(n) {
     // int random helper
     return Math.floor(Math.random() * n);
    }

    let topSquare = this.nodeTree.add(
      { draw: function(ctx) { _rect(ctx, '#f40a', [0, 0, this._node.size[0], this._node.size[1]]); }, },
      null,
      { size: [240, 240], position: [(360-240)/2, 20], }
    );

    this.nodeTree.add(
      { draw: function(ctx) { _rect(ctx, '#08f5', [0, 0, 60, 60]); }, },
      topSquare._node,
      { position: [10, 10], }
    );

    this.nodeTree.add(
      { draw: function(ctx) { _rect(ctx, '#0ffa', [0, 0, 60, 60]); }, },
      topSquare._node,
      { position: [90, 10], }
    );

    this.nodeTree.add(
      {
        draw: function(ctx) { _rect(ctx, '#ff0', [0, 0, 60, 60]); },
        work: function() {
          this._node.position = [160 + Math.random() * 4, 10 + Math.random() * 4];
        },
      },
      topSquare._node,
      { position: [160, 10], }
    );

    this.nodeTree.add(
      {
        draw: function(ctx) { _rect(ctx, '#f08', [-30, -30, 60, 60]); },
        work: function() {
          this._node.rotation = Math.PI * this._node.age * 0.5;
        },
      },
      topSquare._node,
      { position: [0 + 40, 80 + 40], offset: [0, 0],}
    );

    this.nodeTree.add(
      {
        draw: function(ctx) { _circ(ctx, '#80f', [0, 0], this.r); },
        work: function() {
          this.r = 25 + 20 * Math.sin(Math.PI * 2 * this._node.t);
        },
      },
      topSquare._node,
      {
        position: [80 + 40, 80 + 40],
        period: 4,
      }
    );

    function _makeTtlTest0(parent) {
      // make this just like the plum pulse above
      return this.nodeTree.add(
        {
          draw: function(ctx) { _circ(ctx, '#f00a', [0, 0], this.r); },
          work: function() {
            this.r = 5 + 40 * Math.sin(Math.PI * this._node.t);
          },
          term: function() {
            _makeTtlTest0.call(self, parent);
          }
        },
        parent,
        {
          position: [_rnd(3) * 80 + 40, _rnd(3) * 80 + 40],
          ttl: 1,
        }
      );
    }

    const self = this;
    _makeTtlTest0.call(this, topSquare._node);
  }
}