export default class Boreal {
  constructor(parent, { scrollable = true } = {}) {
    this.parent = parent;
    this._setup(scrollable);
  }

  _setup(scrollable) {
    Object.assign(this.parent.style, {
      WebkitTextSizeAdjust: '100%',
      msTextSizeAdjust: '100%',
      fontFamily: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      fontSize: '15px',
      lineHeight: '1.5',
      margin: '0 auto',
      padding: '0',
      whiteSpace: 'pre-wrap',
      color: '#1a1a1a',
      maxWidth: '800px',
    });
    this.parent.classList.add('boreal');
    const css = `
      .boreal > * {
        margin-bottom: 4px;
      }
      .boreal > *:last-child {
        margin-bottom: 0;
      }
      .boreal h1, .boreal h2, .boreal h3 {
        margin: 0 0 8px 0;
        font-weight: 600;
        line-height: 1.2;
      }
      .boreal h1 { font-size: 24px; color: #111; }
      .boreal h2 { font-size: 20px; color: #222; }
      .boreal h3 { font-size: 16px; color: #333; }
      .boreal p {
        margin: 0 0 12px 0;
        color: #444;
      }
      .header {
        padding: 20px;
        border-bottom: 1px solid #e5e5e5;
        flex-shrink: 0;
        background: #fafafa;
      }
      .boreal button {
        font-size: 15px;
        font-weight: 500;
        padding: 12px 24px;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-family: inherit;
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        background: #4f46e5;
        transition: all 0.15s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        letter-spacing: 0.025em;
      }
      .boreal button:hover {
        background: #4338ca;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      }
      .boreal button:active {
        background: #3730a3;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .container {
        flex: 1;
        position: relative;
        overflow: hidden;
      }
      .scroll-area {
        height: 100%;
        overflow-y: auto;
        box-sizing: border-box;
      }
      /* Hide scrollbar for Chrome, Safari and Opera */
      body::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      body {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
      }
      .text-line {
        margin-bottom: 8px;
        padding: 6px 0;
        color: #555;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
}
