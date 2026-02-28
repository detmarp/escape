export default class Celest {
    constructor(containerDiv, logicalW, logicalH, options = {}) {
        console.log('Celest constructor:', { containerDiv, logicalW, logicalH });
        this.containerDiv = containerDiv;
        this.logicalW = logicalW;
        this.logicalH = logicalH;
        this.aspectRatio = logicalW / logicalH;

        this.cssVarPrefix = options.cssVarPrefix || '--logic';
        this.rafId = null;

        // Create outer div that simply fills parent
        this.outer = document.createElement('div');
        this.containerDiv.appendChild(this.outer);
        this.outer.id = 'celest-outer';
        this.outer.style.position = 'absolute';
        this.outer.style.width = '100%';
        this.outer.style.height = '100%';
        this.outer.style.top = '0';
        this.outer.style.left = '0';

        // Create inner div that we'll resize
        this.inner = document.createElement('div');
        this.outer.appendChild(this.inner);
        this.inner.id = 'celest-inner';
        this.inner.style.position = 'absolute';
        this.inner.style.top = '50%';
        this.inner.style.left = '50%';
        this.inner.style.transform = 'translate(-50%, -50%)';

        // Event hooks
        this.onResize = options.onResize || null;
        this.onFrame = options.onFrame || null;

        // Bind methods
        this.tick = this.tick.bind(this);
    }

    init() {
        if (this.rafId) return;

        this._resize();
        this.tick(true);
    }

    term() {
        if (!this.rafId) return;

        cancelAnimationFrame(this.rafId);
        this.rafId = null;

        // Clear CSS vars from inner div
        this.inner.style.removeProperty(`${this.cssVarPrefix}-w`);
        this.inner.style.removeProperty(`${this.cssVarPrefix}-h`);
    }

    tick(first = true) {
        if (!first && !this.rafId) return;

        // Always resize every frame
        const rect = this.containerDiv.getBoundingClientRect();
        this._resize(rect);

        // Call frame callback if provided
        if (this.onFrame) {
            this.onFrame(performance.now());
        }

        this.rafId = requestAnimationFrame(this.tick);
        console.log(`xxx ${JSON.stringify(this.logicalSize)} ${JSON.stringify({width: rect.width, height: rect.height})}`);
    }

    _resize(rect = null) {
        if (!rect) {
            rect = this.containerDiv.getBoundingClientRect();
        }
        const containerW = rect.width;
        const containerH = rect.height;
        const containerAspect = containerW / containerH;

        let finalW, finalH;

        if (containerAspect > this.aspectRatio) {
            // Container is wider than target aspect - fit to height
            finalH = containerH;
            finalW = finalH * this.aspectRatio;
        } else {
            // Container is taller than target aspect - fit to width
            finalW = containerW;
            finalH = finalW / this.aspectRatio;
        }

        // Set the inner div to maintain aspect ratio within container
        this.inner.style.width = `${finalW}px`;
        this.inner.style.height = `${finalH}px`;

        // Set CSS variables to represent the size of one logical unit
        let unitW = finalW / this.logicalW;
        let unitH = finalH / this.logicalH;
        this.inner.style.setProperty(`${this.cssVarPrefix}-w`, `${unitW}px`);
        this.inner.style.setProperty(`${this.cssVarPrefix}-h`, `${unitH}px`);

        // Call resize callback if provided
        if (this.onResize) {
            this.onResize(this.logicalW, this.logicalH);
        }
    }

    // Getters/setters
    get logicalSize() {
        return { w: this.logicalW, h: this.logicalH };
    }

    setLogicalSize(w, h) {
        this.logicalW = w;
        this.logicalH = h;
        this.aspectRatio = w / h;
        if (this.rafId) {
            this._resize();
        }
    }
}
