export default class Finger {
  constructor(canvas) {
    this.canvas = canvas;

    this.x = 0;
    this.y = 0;

    this.touches = new Map();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.ignoreUntilZero = false;

    this.dragWorld = null;

    this.setupListeners();
  }

  screenToWorld(sx, sy) {
    return {
      x: this.x + sx,
      y: this.y + sy,
    };
  }

  worldToCamera(wx, wy, sx, sy) {
    return {
      x: wx - sx,
      y: wy - sy,
    };
  }

  setupListeners() {
    this.canvas.addEventListener('touchstart', e => this.onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', e => this.onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', e => this.onTouchEnd(e), { passive: false });

    this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('mouseup', e => this.onMouseUp(e));
    this.canvas.addEventListener('wheel', e => this.onMouseWheel(e), { passive: false });
  }

  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseDown = true;
  }

  onMouseUp(e) {
    this.mouseDown = false;
    this.dragWorld = null;
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  onMouseWheel(e) {
    e.preventDefault();
  }

  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 1) {
      this.ignoreUntilZero = true;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.touches.set(touch.identifier, {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    this.dragWorld = null;
  }

  onTouchMove(e) {
    e.preventDefault();
    if (this.ignoreUntilZero) return;

    const rect = this.canvas.getBoundingClientRect();
    for (const touch of e.touches) {
      this.touches.set(touch.identifier, {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      this.touches.delete(touch.identifier);
    }
    if (e.touches.length === 0) {
      this.ignoreUntilZero = false;
      this.dragWorld = null;
    }
  }

  work(dt) {
    if (this.ignoreUntilZero) return;

    const touchCount = this.touches.size;

    if (touchCount === 1) {
      this.handleDrag();
    } else if (touchCount === 0) {
      this.handleMouseDrag();
    }
  }

  handleDrag() {
    const touches = Array.from(this.touches.values());
    const touch = touches[0];

    if (!this.dragWorld) {
      this.dragWorld = this.screenToWorld(touch.x, touch.y);
      return;
    }

    const cam = this.worldToCamera(this.dragWorld.x, this.dragWorld.y, touch.x, touch.y);
    this.x = cam.x;
    this.y = cam.y;
  }

  handleMouseDrag() {
    if (!this.mouseDown) return;

    if (!this.dragWorld) {
      this.dragWorld = this.screenToWorld(this.mouseX, this.mouseY);
      return;
    }

    const cam = this.worldToCamera(this.dragWorld.x, this.dragWorld.y, this.mouseX, this.mouseY);
    this.x = cam.x;
    this.y = cam.y;
  }
}
