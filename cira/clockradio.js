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
  }

  draw() {
    // Clear with dark red background
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, 400, 400);

    // Get current time
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();

    // Convert to 12-hour format
    const isPM = hours >= 12;
    hours = hours % 12;
    if (hours === 0) hours = 12;

    // Format time string
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
      this.drawDigit(digit, x, startY, digitWidth, digitHeight);
    }

    // Draw colon between hours and minutes
    const colonX = startX + 2 * (digitWidth + digitSpacing) - digitSpacing / 2;
    const colonY = startY + digitHeight / 2;
    this.drawColon(colonX, colonY);

    // Draw PM indicator if needed
    if (isPM) {
      this.ctx.fillStyle = this.colors.segmentOn;
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText('PM', 380, startY + digitHeight + 30);
    }
  }

  drawDigit(digit, x, y, width, height) {
    const segments = this.getSegments(digit);
    const segmentWidth = width * 0.8;
    const segmentHeight = height * 0.4;
    const thickness = 8;

    // Segment positions (top, top-right, bottom-right, bottom, bottom-left, top-left, middle)
    const positions = [
      { x: x + width * 0.1, y: y, w: segmentWidth, h: thickness, horizontal: true },           // top
      { x: x + width * 0.85, y: y + thickness, w: thickness, h: segmentHeight, horizontal: false }, // top-right
      { x: x + width * 0.85, y: y + height * 0.5 + thickness, w: thickness, h: segmentHeight, horizontal: false }, // bottom-right
      { x: x + width * 0.1, y: y + height - thickness, w: segmentWidth, h: thickness, horizontal: true }, // bottom
      { x: x + width * 0.05, y: y + height * 0.5 + thickness, w: thickness, h: segmentHeight, horizontal: false }, // bottom-left
      { x: x + width * 0.05, y: y + thickness, w: thickness, h: segmentHeight, horizontal: false }, // top-left
      { x: x + width * 0.1, y: y + height * 0.5, w: segmentWidth, h: thickness, horizontal: true } // middle
    ];

    // Draw each segment
    for (let i = 0; i < 7; i++) {
      const isOn = segments[i];
      const pos = positions[i];

      // Set color and glow
      if (isOn) {
        // Draw glow
        this.ctx.shadowColor = this.colors.glow;
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = this.colors.segmentOn;
      } else {
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = this.colors.segmentOff;
      }

      // Draw segment
      this.ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  drawColon(x, y) {
    // Blink colon: red for first half of second, gray (off) for second half
    const now = new Date();
    const isOn = now.getMilliseconds() < 500;
    this.ctx.fillStyle = isOn ? this.colors.segmentOn : this.colors.segmentOff;
    this.ctx.shadowColor = this.colors.glow;
    this.ctx.shadowBlur = isOn ? 8 : 0;

    // Top dot
    this.ctx.beginPath();
    this.ctx.arc(x, y - 15, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Bottom dot
    this.ctx.beginPath();
    this.ctx.arc(x, y + 15, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
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
