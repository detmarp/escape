export default class UiContainer {
  constructor(parent, program) {
    this.parent = parent || document.body;
    this.program = program;
    this._style();
    this._render();

  }

  _style() {
    this._styleMobile();
  }

  _styleMobile() {
    this._addStyle('ui-vertical-stack', `
      /* Ensure direct child divs and buttons behave as block-level stacked items */
      #mika-root {
        display: flex;
        flex-direction: column; /* top to bottom */
        align-items: flex-start; /* left aligned */
        gap: 10px; /* spacing between items */
        padding: 10px 14px; /* small top/left padding */
        width: 100%;
      }

      #mika-root > div,
      #mika-root > button {
        display: block;
        width: auto;
        margin: 0;
        text-align: left;
      }
    `);

    // mobile interaction tweaks (prevent double-tap zoom and pull-to-refresh)
    this._addStyle('mobile-behavior', `
      /* Prefer preventing double-tap zoom and pull-to-refresh where supported */
      html, body, #mika-root { overscroll-behavior: none; }
      #mika-root, #mika-root * { touch-action: manipulation; -ms-touch-action: manipulation; }
    `);

    // add JS guards to handle iOS pull-to-refresh and double-tap zoom prevention
    this._disableMobileDefaults();

    this._addStyle('typography', `
      /* Base typography and smoothing for consistent rendering across platforms */
      #mika-root, #mika-root * {
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #111;
        box-sizing: border-box;
      }

      /* Make text comfortably readable on Android/iOS (avoid tiny auto-scaling)
         and provide a consistent baseline for buttons and labels. */
      #mika-root {
        font-size: 16px; /* baseline readable size on mobile */
        line-height: 1.1;
        -webkit-text-size-adjust: 100%; /* prevent iOS/Android aggressive resizing */
        text-size-adjust: 100%;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
  /* paragraphs should not add extra vertical spacing by default */
  #mika-root p { margin: 0; }
      /* Make headings more compact vertically */
      #mika-root h1 {
        margin: 6px 0; /* smaller top/bottom margin */
        font-size: 1.4em; /* slightly smaller than default h1 */
        line-height: 1.05;
        font-weight: 600;
      }
    `);

    this._addStyle('button-stuff', `
      /* Uniform, touch-friendly buttons */
      #mika-root button {
        font-size: 16px;
        line-height: 1.2;
        padding: 10px 14px;
        border-radius: 8px;
        border: 0;
        background: #007acc;
        color: #fff;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }

      /* Slight visual adjustment for hover (desktop) */
      #mika-root button:hover { filter: brightness(0.95); }
    `);
  }

  _addStyle(id, css) {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (id && head.querySelector('#' + id)) {
      return;
    }

    const style = document.createElement('style');
    if (id) style.id = id;
    style.textContent = css;
    head.appendChild(style);
  }

  _disableMobileDefaults() {
    if (typeof window === 'undefined' || this._mobileDefaultsApplied) return;
    this._mobileDefaultsApplied = true;

    // Prevent double-tap to zoom by tracking last touch time
    let lastTouch = 0;
    const onTouchStart = (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) {
        // second tap within 300ms -> prevent zoom
        e.preventDefault();
      }
      lastTouch = now;
    };

    // Prevent pull-to-refresh on iOS by preventing the overscroll when at top
    let maybePreventPull = false;
    let startY = 0;
    const onTouchMove = (e) => {
      if (window.scrollY === 0) {
        const touch = e.touches && e.touches[0];
        if (!touch) return;
        const delta = touch.clientY - startY;
        if (delta > 10) {
          // pulling down at top -> prevent default
          e.preventDefault();
        }
      }
    };

    const onTouchStartForPull = (e) => {
      const touch = e.touches && e.touches[0];
      if (touch) startY = touch.clientY;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchstart', onTouchStartForPull, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
  }

  _render() {
    this.parent.innerHTML = '';
    this.div = document.createElement('div');
    this.div.id = 'mika-root';
    this.parent.appendChild(this.div);
  }
}