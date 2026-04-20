// class NodeTree
// A simple Unity-inpired tree of transform nodes.
// For Canvas 2d useage.
// With lists of children and components.
// With support for recursive work and draw traversal.
// Intrinsic TTL support, generator support.
export default class NodeTree {
  static id = 0;

  constructor(params = {}) {
    if (params.canvas) {
      this.setCanvas(params.canvas);
    }
    this.frame = 0;
    this.lastTime = performance.now();
    this.debug = true;
    this.clear();
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  add(object = {}, parent = null, params = {}) {
    parent = parent || this.root;
    if (!parent.children) {
      parent.children = [];
    }

    let node = this._newNode(object, params);

    parent.children.push(node);
    node.parent = parent;
    object._node = node;

    return object;
  }

  remove(object) {
    if (object && object._node) {
      object._node.kill = true;
    }
  }

  update() {
    this._work();
    this._draw();
    if (this.debug) {
      this._debugDraw();
    }
  }

  clear() {
    this.root = this._newNode();
  }

  _work() {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.frame++;

    this.flat = [];

    // Walk the tree
    const walk = (node) => {
      this.flat.push(node);
      if (node.children) {
        node.children.forEach(walk);
      }
    };
    walk(this.root);

    // check flat list for needs init
    let needInit = null;
    for (let node of this.flat) {
      if (!node.inited) {
        if (node.object && node.object.init) {
          needInit |= [];
          needInit.push(node);
        }
        else {
          node.inited = true;
        }
      }
    }

    // do inits
    if (needInit) {
      for (let node of needInit) {
        node.object.init();
        node.inited = true;
      }
    }

    // do work
    for (let node of this.flat) {
      if (node.object && node.object.work) {
        node.age += dt;
        node.object.work(dt, this.frame);
      }
    }
  }

  _draw() {
    // walk the tree, not the flat list
    const walk = (node) => {
      let transform = null;
      if (node.object && node.object.draw) {
        if (node.position || node.rotation || node.offset) {
          transform = true;
          this.ctx.save();
          if (node.position) {
            this.ctx.translate(node.position[0], node.position[1]);
          }
          if (node.rotation) {
            this.ctx.rotate(node.rotation);
          }
          if (node.offset) {
            this.ctx.translate(-node.offset[0], -node.offset[1]);
          }
        }
        node.object.draw(this.ctx);
      }
      if (node.children) {
        node.children.forEach(walk);
      }
      if (transform) {
        this.ctx.restore();
      }
    }
    walk(this.root);
  }

  _debugDraw() {
    console.log(`ddd ${this.frame} ${this.flat.length}`);
    for (let node of this.flat) {
      let position = node.screenPosition || node.position || [0, 0];
      if (node.size) {
        // draw green rect
        this.ctx.strokeStyle = '#0f0';
        //this.ctx.strokeRect(position[0], position[1], node.size[0], node.size[1]);
      }
      else {
        // draw blue dot
        this.ctx.fillStyle = '#08f';
        this.ctx.beginPath();
        //this.ctx.arc(position[0], position[1], 5, 0, 2 * Math.PI);
        this.ctx.fill();
      }
    }
  }

  _newNode(obj, params = {}) {
    return {
      ttl: null,

      ...params,

      object: obj,
      id: NodeTree.id++,
      parent: null,
      children: [],
      age: 0,
    };
  }
}
