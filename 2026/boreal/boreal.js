export default class Boreal {
  constructor(parent, { scrollable = true } = {}) {
    this.parent = parent;
    this._setup(scrollable);
  }

  _setup(scrollable) {
    Object.assign(this.parent.style, {
      WebkitTextSizeAdjust: '100%',
      msTextSizeAdjust: '100%',
      fontFamily: 'sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      margin: '0',
      padding: '0',
      whiteSpace: 'pre-wrap',
    });
    this.parent.classList.add('boreal');
    const css = `
      .header {
        padding: 16px;
        border-bottom: 1px solid #ccc;
        flex-shrink: 0;
      }
      .boreal button {
        font-size: 16px;
        padding: 12px 24px;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-family: inherit;
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        background: #007acc;
      }
      .boreal button:hover {
        background: #005a9e;
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
        padding: 4px 0;
      }
      .clear-button {
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: #d73a49;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 100;
      }
      .clear-button:hover {
        background: #cb2431;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
}
