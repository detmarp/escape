/*
Container is a general purpose layout and input handler for a UI.
It fills the window with a .outer element, and centers a .inner element within
it, with aspect ration bounds.

It also handles pointer input (mouse + touch) and detects taps and drags --
a simple single-finger gesture system.
*/
export default class Container {
  constructor(parent) {
    this.parent = parent;
    this.logicalWidth = 540;   // Fixed logical width
    this.logicalHeight = 960;  // Fixed logical height (9:16 aspect ratio)
    this.marginPercent = 0.98; // How much of viewport to use (0.98 = 2% margin)
    this.isPointerDown = false;
    this.dragThreshold = 5; // pixels to move before considering it a drag
    this.tapTimeThreshold = 300; // ms to consider it a tap
  }

  run() {
    this.parent.innerHTML = '';

    this.outer = document.createElement('div');
    this.parent.appendChild(this.outer);
    this.outer.style.cssText = 'width:100%; height:100%; margin:0; padding:0; box-sizing:border-box';

    this.inner = document.createElement('div');
    this.parent.appendChild(this.inner);
    this.inner.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); box-sizing:border-box';

    window.addEventListener('resize', () => this._updateLayout());
    this._updateLayout();
    this._setupInputHandlers();
    return this.outer;
  }

  _setupInputHandlers() {
    // Unified mouse + touch handlers on document (captures everywhere)
    // Coordinates will be relative to inner container
    document.addEventListener('mousedown', (e) => this._handleDown(e));
    document.addEventListener('mousemove', (e) => this._handleMove(e));
    document.addEventListener('mouseup', (e) => this._handleUp(e));

    document.addEventListener('touchstart', (e) => this._handleDown(e), { passive: false });
    document.addEventListener('touchmove', (e) => this._handleMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this._handleUp(e));
    document.addEventListener('touchcancel', (e) => this._handleCancel(e));
  }

  _handleHover(e) {
    // Desktop-only hover tracking for debugging
    if (!e.touches) {
      const pos = this._getPointerPosition(e);
      this._onFinger('hover', [pos.x, pos.y]);
    }
  }

  _getPointerPosition(e) {
    // Get the first touch or mouse position
    // Use changedTouches for touchend events (touches array is empty)
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Get position relative to inner container
    const rect = this.inner.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Convert to logical coordinates (540×960 space) and round to integers
    const logicalX = Math.round((x / rect.width) * this.logicalWidth);
    const logicalY = Math.round((y / rect.height) * this.logicalHeight);

    return { x: logicalX, y: logicalY, rawX: x, rawY: y };
  }

  _isInteractiveElement(target) {
    // Check if the target is a button, input, or other interactive HTML element
    const tagName = target.tagName.toLowerCase();
    return ['button', 'input', 'select', 'textarea', 'a'].includes(tagName);
  }

  _handleDown(e) {
    // Ignore if clicking on interactive elements
    if (this._isInteractiveElement(e.target)) return;

    // Don't prevent default if scrolling is enabled (for settings screen)
    if (this.scrollingEnabled) return;

    // Prevent default for touch to avoid scrolling
    if (e.touches) e.preventDefault();

    // Only handle single touch/click
    if (e.touches && e.touches.length > 1) return;

    const pos = this._getPointerPosition(e);
    this.isPointerDown = true;
    this.pointerStartPos = pos;
    this.pointerStartTime = Date.now();
    this.hasDragged = false;

    this._onFinger('down', [pos.x, pos.y]);
  }

  _handleMove(e) {
    // Track hover position (desktop only, for debugging)
    if (!this.isPointerDown && !e.touches) {
      this._handleHover(e);
    }

    if (!this.isPointerDown) return;

    // Don't prevent default if scrolling is enabled
    if (this.scrollingEnabled) return;

    // Prevent default for touch to avoid scrolling
    if (e.touches) e.preventDefault();

    const pos = this._getPointerPosition(e);
    const dx = pos.rawX - this.pointerStartPos.rawX;
    const dy = pos.rawY - this.pointerStartPos.rawY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've moved enough to consider it a drag
    if (!this.hasDragged && distance > this.dragThreshold) {
      this.hasDragged = true;
    }

    if (this.hasDragged) {
      this._onFinger('drag', [this.pointerStartPos.x, this.pointerStartPos.y], [pos.x, pos.y]);
    }
  }

  _handleUp(e) {
    if (!this.isPointerDown) return;

    const pos = this._getPointerPosition(e);
    const duration = Date.now() - this.pointerStartTime;

    this._onFinger('up', [pos.x, pos.y]);

    // Check if this was a tap (quick and no significant drag)
    if (!this.hasDragged && duration < this.tapTimeThreshold) {
      this._onFinger('tap', [pos.x, pos.y]);
    }

    this.isPointerDown = false;
    this.hasDragged = false;
  }

  _handleCancel(e) {
    if (!this.isPointerDown) return;

    console.log('CANCELLED');
    this.isPointerDown = false;
    this.hasDragged = false;
  }

  clear() {
    this.outer.innerHTML = '';
    this.inner.innerHTML = '';
  }

  // Enable/disable scrolling on inner container
  setScrollable(scrollable) {
    if (scrollable) {
      this.inner.style.overflowY = 'auto';
      this.inner.style.overflowX = 'hidden';
      // Allow native scrolling on touch devices for settings screen
      this.scrollingEnabled = true;
    } else {
      this.inner.style.overflow = 'hidden';
      this.scrollingEnabled = false;
    }
  }

  _updateLayout() {
    // Use window.innerWidth/innerHeight for ACTUAL visible viewport
    // This excludes browser chrome (address bar on iOS, nav buttons on Android)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = this.marginPercent;

    // Fixed 540×960 aspect ratio (9:16)
    const targetAspect = this.logicalWidth / this.logicalHeight;
    const viewportAspect = vw / vh;

    let w, h;
    if (viewportAspect > targetAspect) {
      // Viewport is wider - constrain by height
      h = vh * m;
      w = h * targetAspect;
    } else {
      // Viewport is taller - constrain by width
      w = vw * m;
      h = w / targetAspect;
    }

    // Scale is based on width (could also use height, they're proportional)
    this.scale = w / this.logicalWidth;

    this.inner.style.width = `${w}px`;
    this.inner.style.height = `${h}px`;
    this.inner.style.setProperty('--scale', this.scale);
    this.inner.style.setProperty('--width', this.logicalWidth);
    this.inner.style.setProperty('--height', this.logicalHeight);
    this.inner.style.fontSize = `${this.scale * 18}px`;

    if (this.onResize) this.onResize();
  }

  // Helper to convert logical units to pixels
  u(units) {
    return units * this.scale;
  }

  _onFinger(action, pos, pos2) {
    if (this.onFinger) {
      this.onFinger(action, pos, pos2);
    }
  }
}