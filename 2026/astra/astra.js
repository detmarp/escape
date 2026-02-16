export default class Astra {
  constructor() {
    this.title = document.title;
    this._original = null;
    this._listeners = [];
    this._fullscreenActive = false;
  }

  setTitle(title) {
    this.title = title;
    document.title = title;
  }

  setFixedFullscreen() {
    if (this._fullscreenActive) return;
    this._fullscreenActive = true;

    // Save only the minimal properties we actually modify
    this._original = {
      html: { height: document.documentElement.style.height },
      body: {
        height: document.body.style.height,
        margin: document.body.style.margin,
        padding: document.body.style.padding,
        overflow: document.body.style.overflow,
        touchAction: document.body.style.touchAction,
      }
    };

    // Apply minimal fullscreen styles
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Prevent iOS gestures
    ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu'].forEach(type => {
      const fn = e => e.preventDefault();
      document.addEventListener(type, fn, { passive: false });
      this._listeners.push({ type, fn });
    });
  }

  reset() {
    if (!this._fullscreenActive) return;
    this._fullscreenActive = false;

    // Restore the minimal properties
    if (this._original) {
      document.documentElement.style.height = this._original.html.height || '';
      document.body.style.height = this._original.body.height || '';
      document.body.style.margin = this._original.body.margin || '';
      document.body.style.padding = this._original.body.padding || '';
      document.body.style.overflow = this._original.body.overflow || '';
      document.body.style.touchAction = this._original.body.touchAction || '';
    }

    // Remove event listeners
    this._listeners.forEach(({ type, fn }) => {
      document.removeEventListener(type, fn, { passive: false });
    });
    this._listeners = [];
    this._original = null;
  }
}
