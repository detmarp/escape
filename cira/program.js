export default class Program {
  constructor(parent) {
    this.parent = parent;
    this.config = null;
    this.startTimestamp = Date.now(); // Capture start time
    this.speedUp = 0; // Speed multiplier (0 = normal time)
  }

  async setup() {
    const response = await fetch('./config.json');
    this.config = await response.json();
    this.drawers = this.config.drawers.filter(drawer => drawer.source);

    window.addEventListener('resize', () => {
      if (this.resizeCallback) {
        this.resizeCallback();
      }
    });
  }

  makeContainer() {
    const container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '300px';
    container.style.border = '1px solid #ccc';
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.marginBottom = '10px';
    return container;
  }

  doMenuLayout() {
    this.parent.innerHTML = '';

    // Set up the parent to use flexbox for horizontal wrapping
    this.parent.style.display = 'flex';
    this.parent.style.flexWrap = 'wrap';
    this.parent.style.gap = '10px';
    this.parent.style.padding = '10px';

    let squares = [];

    // Create a div for each drawer in config
    this.drawers.forEach((drawer, index) => {
      // Create container directly (no wrapper div needed)
      const container = this.makeContainer();

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      container.appendChild(canvas);
      this.parent.appendChild(container);
      squares.push(container);

      // Initialize the canvas with the appropriate drawer
      this.makeCanvas(canvas, drawer.source);
      this.onClick(canvas, () => {
        this.doSingleLayout(index);
      });
    });

     this.resizeCallback = () => {
      let size =  200;
      squares.forEach(container => {
        container.style.width = `${size}px`;
        container.style.height = `${size}px`;
      });
    };
    this.resizeCallback();

    this.persistClear();
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

    const drawer = this.drawers[selectedIndex];
    if (!drawer) {
      this.doMenuLayout();
      return;
    }

    const container = document.createElement('div');
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

    this.makeCanvas(canvas, drawer.source);

    this.onClick(canvas, () => {
      this.doMenuLayout();
    });

    this.resizeCallback = () => {
      this.setSizeCentered(container);
    };
    this.resizeCallback();

    this.persistSave(selectedIndex);
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
    const canvas400 = new Canvas400(canvas, drawer, this.getNow.bind(this));
    canvas400.start();
  }

  persistSave(selection) {
    localStorage.setItem('selection', selection.toString());
  }

  persistClear() {
    localStorage.removeItem('selection');
  }

  persistGet() {
    const value = localStorage.getItem('selection');
    return value !== null ? parseInt(value, 10) : null;
  }

  getNow() {
    if (this.speedUp === 0) {
      return new Date(); // Normal time
    }

    // Calculate accelerated time
    const elapsed = Date.now() - this.startTimestamp;
    const acceleratedElapsed = elapsed * this.speedUp;
    return new Date(this.startTimestamp + acceleratedElapsed);
  }

  async run() {
    await this.setup();

    let selected = this.persistGet();
    if (selected === null || selected < 0 || selected >= this.drawers.length) {
      this.doMenuLayout();
    }
    else {
      this.doSingleLayout(selected);
    }
  }
}
