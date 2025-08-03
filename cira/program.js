export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.config = null;
    this.singleContainer = null;
  }

  async setup() {
    const response = await fetch('./config.json');
    this.config = await response.json();

    window.addEventListener('resize', () => {
      if (this.singleContainer) {
        this.setSizeCentered(this.singleContainer);
      }
    });

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

    // Clear single container reference
    this.singleContainer = null;

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
      this.onClick(canvas, () => {
        this.doSingleLayout(index);
      });
    });
  }

  onClick(canvas, callback) {
    const handler = (event) => {
      event.preventDefault();
      callback(event);
    };
    canvas.addEventListener('click', handler);
    canvas.addEventListener('touchend', handler);
  }

  doSingleLayout(selectedIndex) {
    this.parent.innerHTML = '';

    const drawer = this.config.drawers[selectedIndex];
    if (!drawer || !drawer.source) {
      return;
    }

    const container = document.createElement('div');
    container.style.border = '1px solid #ccc';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.margin = '10px auto 0 auto'; // Top center alignment
    container.style.display = 'block';

    this.setSizeCentered(container);

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    container.appendChild(canvas);
    this.parent.appendChild(container);

    // Initialize the canvas with the selected drawer
    this.makeCanvas(canvas, drawer.source);

    this.onClick(canvas, () => {
      this.doMenuLayout();
    });
    this.singleContainer = container;
  }

  setSizeCentered(element) {
    const parentWidth = window.innerWidth;
    const parentHeight = window.innerHeight;
    const size = Math.min(parentWidth, parentHeight) - 40;
    const finalSize = Math.max(size, 200);
    console.log('finalSize:', finalSize);
    console.log('parent.clientWidth:', this.parent.clientWidth);
    console.log('parent.clientHeight:', this.parent.clientHeight);
    element.style.width = `${finalSize}px`;
    element.style.height = `${finalSize}px`;
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
    this.doMenuLayout();
    //this.doSingleLayout(0);
  }
}
