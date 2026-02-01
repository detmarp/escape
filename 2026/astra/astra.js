export default class Astra {
  constructor(title = 'Paxi') {
    this.title = title;
  }
  init() {
    // Set document title
    document.title = this.title;
    // Set styles directly via JS
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
    const styleTap = document.createElement('style');
    styleTap.textContent = `a, button { -webkit-tap-highlight-color: transparent; }`;
    document.head.appendChild(styleTap);
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
    ['gesturestart', 'gesturechange', 'gestureend', 'contextmenu'].forEach(function(type) {
      document.addEventListener(type, function(e) {
        e.preventDefault();
      }, { passive: false });
    });
  }
}
