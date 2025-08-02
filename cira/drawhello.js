export default class DrawHello {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isYellow = true;
  }

  draw() {
    // Fill background with midnight blue
    this.ctx.fillStyle = 'midnightblue';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate font size to fit "Hello" horizontally
    const text = 'Hello';
    let fontSize = Math.floor(this.canvas.width / text.length * 1.2);
    this.ctx.font = `${fontSize}px Arial`;

    // Adjust font size if text is too wide
    let textWidth = this.ctx.measureText(text).width;
    while (textWidth > this.canvas.width * 0.9 && fontSize > 10) {
      fontSize -= 2;
      this.ctx.font = `${fontSize}px Arial`;
      textWidth = this.ctx.measureText(text).width;
    }

    // Set text color (flicker between yellow and lime)
    this.ctx.fillStyle = this.isYellow ? 'yellow' : 'lime';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw the text centered
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    this.ctx.fillText(text, centerX, centerY);

    // Toggle color for next frame
    this.isYellow = !this.isYellow;
  }
}
