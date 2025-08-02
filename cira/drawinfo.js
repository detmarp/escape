export default class DrawInfo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Get canvas logical size
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Get container inner size (clientWidth/clientHeight excludes border)
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Set up text styling
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw two lines of text
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Line 1: Canvas logical size
    const canvasText = `Canvas: ${canvasWidth}x${canvasHeight}`;
    this.ctx.fillText(canvasText, centerX, centerY - 15);

    // Line 2: Container size
    const containerText = `Container: ${containerWidth}x${containerHeight}`;
    this.ctx.fillText(containerText, centerX, centerY + 15);
  }
}
