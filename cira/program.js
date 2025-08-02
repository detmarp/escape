export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.config = null;
  }

  async setup() {
    const response = await fetch('./config.json');
    this.config = await response.json();
  }

  makeContainer() {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.border = '1px solid #ccc';
    container.style.resize = 'both';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.marginBottom = '10px';
    return container;
  }

  doLayout() {
    // Remove all children from parent
    this.parent.innerHTML = '';

    // Create a div for each drawer in config
    this.config.drawers.forEach((drawer, index) => {
      // Skip if no source is specified
      if (!drawer.source) {
        return;
      }

      const div = document.createElement('div');

      // Create resizable container
      const container = this.makeContainer();

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      container.appendChild(canvas);
      div.appendChild(container);
      this.parent.appendChild(div);

      // Initialize the canvas with the appropriate drawer
      this.makeCanvas(canvas, drawer.source);
    });
  }

  async makeCanvas(canvas, jsFileName) {
    // Import Canvas400 and the specific drawer class
    const { default: Canvas400 } = await import('./canvas400.js');
    const { default: DrawerClass } = await import(jsFileName);

    // Create drawer instance and start animation
    const drawer = new DrawerClass(canvas);
    const canvas400 = new Canvas400(canvas, drawer);
    canvas400.start();
  }

  async run() {
    await this.setup();
    this.doLayout();
  }
}
