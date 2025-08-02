export default class DrawInfo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }
  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw gray square outline from (0,0) to (99,99)
    this.ctx.strokeStyle = 'gray';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, 99, 99);

    // Draw white square outline from (1,1) to (98,98)
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(1, 1, 97, 97);

    // Draw black square outline from (2,2) to (97,97)
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(2, 2, 95, 95);
    // Get canvas logical size
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Get container inner size (clientWidth/clientHeight excludes border)
    const container = this.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate logical size based on current transform
    const transform = this.ctx.getTransform();
    const scaleX = transform.a;
    const scaleY = transform.d;
    const logicalWidth = Math.round(canvasWidth / scaleX);
    const logicalHeight = Math.round(canvasHeight / scaleY);

    // Set up text styling
    this.ctx.fillStyle = 'black';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw three lines of text
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Line 1: Canvas logical size
    const canvasText = `Canvas: ${canvasWidth}x${canvasHeight}`;
    this.ctx.fillText(canvasText, centerX, centerY - 25);

    // Line 2: Container size
    const containerText = `Container: ${containerWidth}x${containerHeight}`;
    this.ctx.fillText(containerText, centerX, centerY);

    // Line 3: Logical size
    const logicalText = `Logical: ${logicalWidth}x${logicalHeight}`;
    this.ctx.fillText(logicalText, centerX, centerY + 25);
  }
}
