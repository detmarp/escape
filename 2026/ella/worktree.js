// A simple tree structure to manage work items that need to be updated and drawn each frame.
export default class WorkTree {
  constructor() {
    this.debug = false;
  }

  clear() {
    this.root = {};
  }

  add(parent, item) {
    parent = parent || this.root;
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(item);
    item.parent = parent;
  }

  find(position) {
    if (!this.flat) return null;

    let found = null;
    for (let node of this.flat) {
      if (node._screenPosition && node.size) {
        const [x, y] = position;
        const [nodeX, nodeY] = node._screenPosition;
        const [nodeW, nodeH] = node.size;

        if (x >= nodeX && x < nodeX + nodeW &&
            y >= nodeY && y < nodeY + nodeH) {
          found = node;
        }
      }
    }
    return found;
  }

  call(method, ...args) {
    if (method === 'work') {
      this.flat = [];
    }

    this._callInternal(this.root, method, ...args);

    if (this.debug && method === 'draw') {
      this._debugDraw(...args);
    }
  }

  _callInternal(node, method, ...args) {
    if (!node) return;
    if (node[method]) {
      node[method](...args);
    }

    if (method == 'work') {
      if (node.position) {
        let screenPosition = [...node.position];
        if (node.parent && node.parent._screenPosition) {
          screenPosition[0] += node.parent._screenPosition[0];
          screenPosition[1] += node.parent._screenPosition[1];
        }
        node._screenPosition = screenPosition;
      }
      this.flat.push(node);
    }

    let offset = method === 'draw' && node._screenPosition;
    if (offset) {
      args[0].save();
      args[0].translate(offset[0], offset[1]);
    }

    if (node.children) {
      node.children.forEach(child => this._callInternal(child, method, ...args));
    }

    if (offset) {
      args[0].restore();
    }
  }

  _debugDraw(ctx) {
    for (let node of this.flat) {
      if (node._screenPosition) {
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(node._screenPosition[0], node._screenPosition[1], 5, 0, 2 * Math.PI);
        ctx.fill();
        if (node.size) {
          ctx.strokeStyle = '#f0f';
          ctx.strokeRect(node._screenPosition[0], node._screenPosition[1], node.size[0], node.size[1]);
        }
      }
    }
  }
}
