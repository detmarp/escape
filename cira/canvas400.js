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