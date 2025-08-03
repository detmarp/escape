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
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.marginBottom = '10px';
    return container;
  }

  doMenuLayout() {
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

  doSingleLayout(selectedIndex) {
    // Remove all children from parent
    this.parent.innerHTML = '';

    // Get the selected drawer
    const drawer = this.config.drawers[selectedIndex];
    if (!drawer || !drawer.source) {
      return;
    }

    // Calculate the size to make it square and fit the screen
    const parentWidth = this.parent.clientWidth || window.innerWidth;
    const parentHeight = this.parent.clientHeight || window.innerHeight;
    const size = Math.min(parentWidth, parentHeight) - 40; // Leave margin for border and spacing

    // Ensure minimum size
    const finalSize = Math.max(size, 200);

    // Create a single container for the selected clock
    const container = document.createElement('div');
    container.style.width = `${finalSize}px`;
    container.style.height = `${finalSize}px`;
    container.style.border = '1px solid #ccc';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.margin = '10px auto 0 auto'; // Top center alignment
    container.style.display = 'block';

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    container.appendChild(canvas);
    this.parent.appendChild(container);

    // Initialize the canvas with the selected drawer
    this.makeCanvas(canvas, drawer.source);
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
    //this.doMenuLayout();
    this.doSingleLayout(0);
  }
}
