export default class ClockBasic {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  draw(now = new Date()) {
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, 400, 400);

    // Draw outer circle
    this.ctx.beginPath();
    this.ctx.arc(200, 200, 195, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(200, 200, 120, 0, 2 * Math.PI);
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Draw 7 pie slice lines for days of the week
    // Starting from top (12:00) and dividing into 7 equal sections
    const colors = ['#eee', '#ccb', '#dbd', '#ecd', '#bbb', '#cdc', '#eed'];
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    for (let i = 0; i < 7; i++) {
      const startAngle = (i * 2 * Math.PI / 7) - Math.PI / 2; // Start from top (subtract PI/2)
      const endAngle = ((i + 1) * 2 * Math.PI / 7) - Math.PI / 2;

      // Fill the pie slice
      this.ctx.beginPath();
      this.ctx.arc(200, 200, 195, startAngle, endAngle);
      this.ctx.arc(200, 200, 120, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = colors[i];
      this.ctx.fill();

      // Draw the border lines
      const innerX = 200 + Math.cos(startAngle) * 120;
      const innerY = 200 + Math.sin(startAngle) * 120;
      const outerX = 200 + Math.cos(startAngle) * 195;
      const outerY = 200 + Math.sin(startAngle) * 195;

      this.ctx.beginPath();
      this.ctx.moveTo(innerX, innerY);
      this.ctx.lineTo(outerX, outerY);
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Draw curved day name (flip Tuesday, Wednesday, Thursday)
      const shouldFlip = i === 2 || i === 3 || i === 4; // Tuesday, Wednesday, Thursday
      this.drawCurvedText(dayNames[i], startAngle, endAngle, 180, shouldFlip);
    }

    // Draw day hand pointing to current day
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Calculate fractional day progress (0.0 = start of day, 1.0 = end of day)
    const dayProgress = (hours + minutes / 60) / 24;

    // Calculate angle for the day hand (includes fractional progress)
    const dayAngle = (dayOfWeek + dayProgress) * (2 * Math.PI / 7) - Math.PI / 2;

    // Draw day hand
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(200, 200);
    this.ctx.lineTo(
      200 + Math.cos(dayAngle) * 157, // Point to middle of the ring (halfway between 120 and 195)
      200 + Math.sin(dayAngle) * 157
    );
    this.ctx.stroke();

    // Draw center dot
    this.ctx.beginPath();
    this.ctx.arc(200, 200, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();
  }

  drawCurvedText(text, startAngle, endAngle, radius, flip = false) {
    // Calculate the angle span and arc length
    const angleSpan = endAngle - startAngle;
    const arcLength = radius * angleSpan;

    // Set text properties
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#333';

    // Reduce spacing by using 70% of the available arc length
    const usableSpan = angleSpan * 0.7;
    const spanOffset = angleSpan * 0.15; // Center the text

    // Draw each character along the arc
    for (let i = 0; i < text.length; i++) {
      // Calculate angle for this character
      let charAngle;
      if (flip) {
        // For flipped text, reverse the order and direction
        charAngle = endAngle - spanOffset - (i + 0.5) * (usableSpan / text.length);
      } else {
        charAngle = startAngle + spanOffset + (i + 0.5) * (usableSpan / text.length);
      }

      // Calculate position
      const x = 200 + Math.cos(charAngle) * radius;
      const y = 200 + Math.sin(charAngle) * radius;

      // Save context for rotation
      this.ctx.save();

      // Move to character position and rotate
      this.ctx.translate(x, y);
      if (flip) {
        this.ctx.rotate(charAngle - Math.PI / 2); // Subtract 90° for flipped text
      } else {
        this.ctx.rotate(charAngle + Math.PI / 2); // Add 90° for normal text
      }

      // Draw the character
      this.ctx.fillText(text[i], 0, 0);

      // Restore context
      this.ctx.restore();
    }
  }
}
