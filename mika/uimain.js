export default class UiMain {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'Main';
    this.parent.appendChild(title);

    this._addButton('Settings ⚙', () => {
      this.program.gotoMode('settings');
    });

    let row1 = this._startRow('Daily games');
    for (let i = 0; i < 15; i++) {
      const btn = this._gameButton();
      row1.appendChild(btn);
    }
    let row2 = this._startRow('Other games');
    for (let i = 0; i < 25; i++) {
      const btn = this._gameButton();
      row2.appendChild(btn);
    }

    const startButton = document.createElement('button');
    startButton.textContent = 'New game';
    startButton.addEventListener('click', () => {
      this.program.newGame();
      this.program.gotoMode('pregame');
    });
    this.parent.appendChild(startButton);

    if (this.program.saveData.data.quickstart) {
      this._addButton('Quickstart', this._onQuickstart);
    }

    if (this.program.lastGame) {
      this._addButton('Continue', this._onContinue);
    }
  }

  _startRow(label) {
    const lbl = document.createElement('div');
    lbl.textContent = label;
    lbl.style.marginBottom = '0';
    this.parent.appendChild(lbl);

    const outer = document.createElement('div');
    outer.style.width = '28em';
    outer.style.overflow = 'hidden';
    outer.style.padding = '0.5em';
    outer.style.border = '1px solid black';
    outer.style.borderRadius = '4px';
    outer.style.background = 'transparent';

    const scroller = document.createElement('div');
    scroller.style.display = 'flex';
    scroller.style.flexDirection = 'row';
    scroller.style.gap = '0.5em';
    scroller.style.alignItems = 'center';
    scroller.style.whiteSpace = 'nowrap';
    scroller.style.transform = 'translateX(0px)';
    scroller.style.willChange = 'transform';
    scroller.style.touchAction = 'none';

    outer.appendChild(scroller);

    let dragging = false;
    let startX = 0;
    let startTranslate = 0;
    let maxTranslate = 0;

    function getTranslate() {
      const m = (scroller.style.transform || '').match(/translateX\((-?(?:\d+|\d+\.\d+))px\)/);
      return m ? Math.abs(Number(m[1])) : 0;
    }

    function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

    function recomputeMax() {
      const extra = Math.max(0, scroller.scrollWidth - outer.clientWidth);
      maxTranslate = extra;
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startTranslate = getTranslate();
      recomputeMax();
      try { outer.setPointerCapture && outer.setPointerCapture(e.pointerId); } catch (err) {}
      outer.style.cursor = 'grabbing';
      scroller.style.userSelect = 'none';
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      let next = clamp(startTranslate - dx, 0, maxTranslate);
      scroller.style.transform = `translateX(${-next}px)`;
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      try { outer.releasePointerCapture && outer.releasePointerCapture(e.pointerId); } catch (err) {}
      outer.style.cursor = 'default';
      scroller.style.userSelect = '';
    }

    outer.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    window.addEventListener('resize', recomputeMax);

    this.parent.appendChild(outer);
    return scroller;
  }

  _addText(text) {
    const p = document.createElement('p');
    p.textContent = text;
    this.parent.appendChild(p);
  }

  _addHeader(text) {
    const h = document.createElement('h1');
    h.textContent = text;
    this.parent.appendChild(h);
    return h;
  }

  _addButton(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    if (typeof onClick === 'function') {
      button.addEventListener('click', onClick.bind(this));
    }
    this.parent.appendChild(button);
    return button;
  }

  _gameButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'hello';
    // make it a 6em square
    btn.style.width = '6em';
    btn.style.height = '6em';
    btn.style.minWidth = '6em';
    btn.style.minHeight = '6em';
    btn.style.maxWidth = '6em';
    btn.style.maxHeight = '6em';
    btn.style.boxSizing = 'border-box';
    // prevent flex container from stretching the button
    btn.style.flex = '0 0 auto';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.textAlign = 'center';

    // inert click handler (do nothing)
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // intentionally no-op
    });

    this.parent.appendChild(btn);
    return btn;
  }

  _onQuickstart() {
    this.program.newGame();
    this.program.gotoMode('gameboard');
  }

  _onContinue() {
    this.program.tryContinue();
  }
}