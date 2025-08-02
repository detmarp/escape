export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.animationId = null;
    this.startTime = null;
    this.cycleDuration = 2000; // 2 seconds for full cycle
  }

  run() {
    // Set initial styles
    this.parent.style.transition = 'none';
    this.parent.style.backgroundColor = 'red';

    // Start animation
    this.startTime = performance.now();
    this.animate();
  }

  animate = (currentTime) => {
    if (!this.startTime) this.startTime = currentTime;

    const elapsed = currentTime - this.startTime;
    const progress = (elapsed % this.cycleDuration) / this.cycleDuration;

    const fadeValue = progress < 0.5
      ? progress * 2
      : 2 - (progress * 2);

    // Interpolate between red and yellow
    const red = Math.round(255);
    const green = Math.round(fadeValue * 255);
    const blue = 0;

    this.parent.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;

    this.animationId = requestAnimationFrame(this.animate);
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}