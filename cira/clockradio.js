export default class ClockRadio {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Color palette
    this.colors = {
      background: '#111',
      segmentOn: '#f11',
      segmentOff: '#222',
      glow: '#f40'
    };

    this.segmentSizes(60, 100);
  }

  segmentSizes(w, h) {
    //   000
    //  5   1
    //   666
    //  4   2
    //   333
    const thick = 10;
    const h2 = (h - 3 * thick) / 2;
    const w2 = (w - 2 * thick);
    this.segments = [
      [ thick, 0, w2, thick ],
      [ w - thick, thick, thick, h2],
      [ w - thick, h2 + 2 * thick, thick, h2],
      [ thick, h - thick, w2, thick ],
      [ 0, h2 + 2 * thick, thick, h2],
      [ 0, thick, thick, h2],
      // Middle segment
      [ thick, h2 + thick, w - 2 * thick, thick ]
    ];
  }

  draw(now = new Date()) {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, 400, 400);

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12;
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const timeString = `${hours.toString().padStart(2, ' ')}${minutes.toString().padStart(2, '0')}`;

    // Draw the 4 digits
    const digitWidth = 60;
    const digitHeight = 100;
    const digitSpacing = 20;
    const startX = (400 - (4 * digitWidth + 3 * digitSpacing)) / 2;
    const startY = (400 - digitHeight) / 2;

    for (let i = 0; i < 4; i++) {
      const digit = timeString[i] === ' ' ? '' : timeString[i];
      const x = startX + i * (digitWidth + digitSpacing);
      this.drawDigit(digit, x, startY);
    }

    // Draw colon between hours and minutes
    const colonX = startX + 2 * (digitWidth + digitSpacing) - digitSpacing / 2;
    const colonY = startY + digitHeight / 2;
    this.drawColon(colonX, colonY, now);

    // Draw PM indicator if needed
    if (isPM) {
      this.ctx.fillStyle = this.colors.segmentOn;
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText('PM', 380, startY + digitHeight + 30);
    }
  }

  fillPoints(points, on) {
    this.startPath(on);
    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(point[0], point[1]);
      } else {
        this.ctx.lineTo(point[0], point[1]);
      }
    });
    this.endPath();
  }

  startPath(on) {
    if (on) {
      this.ctx.shadowColor = this.colors.glow;
      this.ctx.shadowBlur = 5;
      this.ctx.fillStyle = this.colors.segmentOn;
    } else {
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = this.colors.segmentOff;
    }
    this.ctx.beginPath();
  }

  endPath() {
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawDigit(digit, x, y, width, height) {
    const segments = this.getSegments(digit);

    for (let i = 0; i < 7; i++) {
      const isOn = segments[i];
      this.drawSegment(x, y, i, isOn);
    }
  }

  drawSegment(x, y, i, on) {
    let [x2, y2, w, h] = this.segments[i];
    x2 += x;
    y2 += y;
    w -= 1;
    h -= 1
    const points = [
      [x2, y2],
      [x2 + w, y2],
      [x2 + w, y2 + h],
      [x2, y2 + h]
    ];
    this.fillPoints(points, on);
  }

  drawColon(x, y, now) {
    this.startPath(now.getMilliseconds() < 500);
    this.ctx.arc(x, y - 15, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x, y + 15, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  getSegments(digit) {
    // Returns array of 7 booleans for segments: [top, top-right, bottom-right, bottom, bottom-left, top-left, middle]
    const patterns = {
      '0': [true, true, true, true, true, true, false],
      '1': [false, true, true, false, false, false, false],
      '2': [true, true, false, true, true, false, true],
      '3': [true, true, true, true, false, false, true],
      '4': [false, true, true, false, false, true, true],
      '5': [true, false, true, true, false, true, true],
      '6': [true, false, true, true, true, true, true],
      '7': [true, true, true, false, false, false, false],
      '8': [true, true, true, true, true, true, true],
      '9': [true, true, true, true, false, true, true],
      '': [false, false, false, false, false, false, false] // blank
    };

    return patterns[digit] || patterns[''];
  }
}
