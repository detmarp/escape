// version 2026-04-11
// A class to do some finger drag stuff, for a mobile web page canvas.
// Multi finger support, with mouse simulation for desktop testing.
// On desktop we use the left and right mouse buttons to simulate touches.
// Call onChangeCallback(touches, type) when the state changes
//   touches: array of {start: [x,y], end: [x,y]}
//   type: one of: start, move, end, none.

export default class Mytouch {
  constructor(canvas, onChangeCallback = null) {
    this.canvas = canvas;
    this.mouseButtonCount = 0;
    this.buttonMask = 0;
    this.mouseStart = [0, 0];
    this.mousePosition = [0, 0];
    this.touches = [];
    this.onChangeCallback = onChangeCallback;
    this.fingerStarts = new Map();

    this.initEventListeners();
  }

  initEventListeners() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.canvas.addEventListener('touchstart', this.onTouch.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouch.bind(this));
    this.canvas.addEventListener('touchend', this.onTouch.bind(this));

    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  onTouch(event) {
    event.preventDefault();

    let touches = [];

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      if (!this.fingerStarts.has(touch.identifier)) {
        this.fingerStarts.set(touch.identifier, [touch.clientX, touch.clientY]);
      }
      let p = [touch.clientX, touch.clientY];
      let start = this.fingerStarts.get(touch.identifier);
      touches.push({
        start: start ? start : p,
        end: p
      });
    }

    if (event.type === 'touchend') {
      if (this.touches.length) {
        this.onChanged(this.touches, 'end');
      }
    }

    if (event.type === 'touchend' && event.touches.length === 0) {
      this.onChanged([], 'none');
    }

    if (event.type === 'touchend') {
      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        this.fingerStarts.delete(touch.identifier);
      }
    }

    this.touches = touches;
    if (event.type === 'touchstart') {
      this.onChanged(touches, 'start');
    }
    if (event.type === 'touchmove') {
      this.onChanged(touches, 'move');
    }
  }

  onMouseDown(event) {
    event.preventDefault();
    let mask = 1 << event.button;
    if (!(this.buttonMask & mask)) {
      this.buttonMask |= mask;
      this.mouseChange(this.mouseButtonCount + 1, event);
    }
  }

  onMouseUp(event) {
    event.preventDefault();
    let mask = 1 << event.button;
    if (this.buttonMask & mask) {
      this.buttonMask &= ~mask;
      this.mouseChange(this.mouseButtonCount - 1, event);
    }
  }

  onMouseLeave(event) {
    event.preventDefault();
    if (this.buttonMask) {
      this.buttonMask = 0;
      this.mouseChange(0);
    }
  }

  onMouseMove(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = this._mousePosition(event);
    if (this.buttonMask & 5) {
      this._simulateFromMouse();
      this.onChanged(this.touches, 'move');
    }
  }


  onChanged(touches, type) {
    //console.log(`ttt ${type}  ${JSON.stringify(touches)}`);
    if (this.onChangeCallback) {
      this.onChangeCallback(touches, type);
    }
  }

  mouseChange(count, event) {
    // We are using the mouse to simulate touch events.

    if (count < this.mouseButtonCount) {
      // if the count decreases, then send an end event
      this.onChanged(this.touches, 'end');
      this.touches = [];
    }

    if (count === 0) {
      this.onChanged([], 'none');
    }

    if (event) {
      const rect = this.canvas.getBoundingClientRect();
      let position = this._mousePosition(event);
      if (count > 0 && this.mouseButtonCount === 0) {
        this.mouseStart = position;
      }
    }
    this.mouseButtonCount = count;

    if (count && event) {
      this.mousePosition = this._mousePosition(event);
      this._simulateFromMouse();
      this.onChanged(this.touches, 'start');
    }
  }

  _mousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
  }

  _center() {
    return [this.canvas.width / 2, this.canvas.height / 2];
  }

  _simulateFromMouse() {
    // left button = one finger, right button = two fingers, both = three
    if (this.buttonMask & 4) {
      var center = this._center();
      this.touches = [
        {
          start: this.mouseStart,
          end: this.mousePosition,
        },
        {
          start: [
            2 * center[0] - this.mouseStart[0],
            2 * center[1] - this.mouseStart[1]
          ],
          end: [
            2 * center[0] - this.mousePosition[0],
            2 * center[1] - this.mousePosition[1]
          ]
        }
      ];
      if (this.buttonMask & 1) {
        this.touches.push({
          start: center,
          end: center
        });
      }
    }
    if (this.buttonMask == 1) {
      this.touches = [
        {
          start: this.mouseStart,
          end: this.mousePosition
        }]
    }
  }
}
