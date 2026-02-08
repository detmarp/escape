export default class Astra {
  constructor() {
    this.title = document.title;
    this._original = null;
    this._styleTap = null;
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
    // Save original state
    this._original = {
      docStyles: { ...document.documentElement.style },
      bodyStyles: { ...document.body.style }
    };
    Object.assign(document.documentElement.style, {
      height: '100%',
      boxSizing: 'border-box',
      scrollBehavior: 'smooth',
    });
    Object.assign(document.body.style, {
      height: '100%',
      margin: '0',
      padding: '0',
      boxSizing: 'border-box',
      fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`,
      fontSize: '16px',
      background: '#fff',
      color: '#111',
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      userSelect: 'none',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      WebkitUserSelect: 'none',
      msTouchAction: 'none',
      WebkitOverflowScrolling: 'auto',
      position: 'relative',
    });
    // Remove tap highlight on mobile for a and button
    this._styleTap = document.createElement('style');
    this._styleTap.textContent = `a, button { -webkit-tap-highlight-color: transparent; }`;
    document.head.appendChild(this._styleTap);
    // Set styles for all elements
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      el.style.boxSizing = 'inherit';
      el.style.userSelect = 'none';
      el.style.WebkitUserSelect = 'none';
      el.style.touchAction = 'none';
      el.style.msTouchAction = 'none';
    });
    // Prevent iOS pinch/double-tap zoom and context menu
    ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu'].forEach(type => {
      const fn = e => e.preventDefault();
      document.addEventListener(type, fn, { passive: false });
      this._listeners.push({ type, fn });
    });
  }

  reset() {
    if (!this._fullscreenActive) return;
    this._fullscreenActive = false;
    // Restore document styles
    if (this._original && this._original.docStyles) {
      Object.assign(document.documentElement.style, this._original.docStyles);
    }
    if (this._original && this._original.bodyStyles) {
      Object.assign(document.body.style, this._original.bodyStyles);
    }
    // Remove styleTap
    if (this._styleTap && this._styleTap.parentNode) {
      this._styleTap.parentNode.removeChild(this._styleTap);
      this._styleTap = null;
    }
    // Remove event listeners
    this._listeners.forEach(({ type, fn }) => {
      document.removeEventListener(type, fn, { passive: false });
    });
    this._listeners = [];
    this._original = null;
  }
}
