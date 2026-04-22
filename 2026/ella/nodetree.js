// class NodeTree
// A simple Unity-inpired tree of transform nodes.
// For Canvas 2d usage.
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

  add(object, parent, params = {}) {
    object ??= {};
    parent ??= this.root;

    if (parent.tree !== this) {
      throw new Error('Parent node is not in this NodeTree');
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

  _removeNode(node) {
    if (node.parent) {
      let idx = node.parent.children.indexOf(node);
      if (idx !== -1) {
        node.parent.children.splice(idx, 1);
      }
    }
    if (node.object && node.object.term) {
      node.object.term();
    }
  }

  update() {
    this._work();
    this._draw();
    if (this.debug) {
      this._debugDraw();
    }
    // do 'kill' cleanup here
    for (let node of this.flat) {
      if (node.kill) {
        this._removeNode(node);
      }
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
    let time = this.lastTime / 1000;

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
          needInit ??= [];
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
      node.age += dt;
      if (node.object && node.object.work) {
        if (node.ttl) {
          node.t = node.age / node.ttl;
          if (node.age > node.ttl) {
            node.t = 1;
            node.kill = true;
          }
        } else if (node.period) {
          node.t = (node.age % node.period) / node.period;
        } else {
          node.t = 0;
        }

        node.object.work(dt, time, this.frame);
      }
    }
  }

  _draw() {
    // walk the tree, not the flat list
    const walk = (node) => {
      if (!node.inited) {
        return;
      }
      let transform = null;
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
      if (node.object && node.object.draw) {
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
      //console.log(`ddd ${this.frame} ${this.flat.length}`);
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
      tree: this,
    };
  }
}
