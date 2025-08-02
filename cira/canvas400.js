export default class Canvas400 {
  constructor(canvas, drawer) {
    this.canvas = canvas;
    this.drawer = drawer;
    this.animationId = null;
  }

  updateCanvasSize() {
    // Get the actual display size of the canvas from the container
    const rect = this.canvas.getBoundingClientRect();

    // Update canvas internal size to match container pixel size
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Set up logical 400x400 coordinate system
    const maxDimension = Math.max(this.canvas.width, this.canvas.height);
    const scale = maxDimension / 400;

    // Calculate translation to center the 400x400 logical space
    const offsetX = (this.canvas.width / scale - 400) / 2;
    const offsetY = (this.canvas.height / scale - 400) / 2;

    // Reset transform and apply scale and translation
    const ctx = this.canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);
  }

  animate = () => {
    this.updateCanvasSize();
    this.drawer.draw();
    this.animationId = requestAnimationFrame(this.animate);
  }

  start() {
    this.animate();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}