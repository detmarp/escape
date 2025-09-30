export default class AppContainer {
  constructor(parent, program, onResize) {
    this.parent = parent;
    this.program = program;
    this.onResize = onResize;
  }

  run() {
    // Prevent scroll and overscroll globally
    Object.assign(document.documentElement.style, {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
    });
    Object.assign(document.body.style, {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      margin: '0',
      padding: '0',
    });

    this.div = document.createElement('div');
    this.div.style.position = 'fixed';
    this.div.style.top = '0';
    this.div.style.left = '0';
    this.div.style.width = '100vw';
    this.div.style.height = '100vh';
    this.div.style.overflow = 'hidden';
    this.div.style.background = '#fff';
    this.div.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    this.div.style.fontSize = 'clamp(16px, 2.5vw, 22px)';
    this.div.style.touchAction = 'none';
    this.div.style.webkitTapHighlightColor = 'transparent';
    this.div.style.overscrollBehavior = 'none';

    this.parent.appendChild(this.div);
    this.container = this.div;

    // Window resize/orientation handler
    const handleResize = () => {
      this.div.style.width = '100vw';
      this.div.style.height = '100vh';
      if (typeof this.onResize === 'function') {
        this.onResize();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize(); // Initial call

    return this.container;
  }
}
