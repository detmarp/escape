export default class SpriteA {
  constructor(baseFilename) {
    this.baseFilename = baseFilename;
    this.sheet = new Image();
    this.data = null;
    this.loaded = false;
    this.error = null;
    this.flat = [];
    this.sprites = {};

    this._loadAssets();
  }

  async _loadAssets() {
    try {
      await Promise.all([
        this._loadImage(),
        this._loadData()
      ]);
      this._parseSprites();
      this._buildLookups();
      this.loaded = true;
    } catch (error) {
      this.error = error;
      console.error('Failed to load sprite assets:', error);
    }
  }

  _loadImage() {
    return new Promise((resolve, reject) => {
      let imagePath = `${this.baseFilename}.png`;
      this.sheet.onload = () => resolve();
      this.sheet.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
      this.sheet.src = imagePath;
    });
  }

  async _loadData() {
    let dataPath = `${this.baseFilename}.json`;
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${dataPath} (${response.status})`);
    }
    this.data = await response.json();
  }

  _parseSprites() {
    if (!this.data || !this.data.sprites) {
      throw new Error('Sprite data is not loaded or invalid');
    }

    this.flat = [];

    for (const sprite of this.data.sprites) {
      this._parseGrid(sprite);
    }
  }

  _parseGrid(grid) {
    const [firstX, firstY, cellW, cellH] = grid.source;

    let [insetX, insetY, contentW, contentH] = grid.inset ?
      grid.inset :
      [0, 0, cellW, cellH];

    const columns = grid.columns || 1;
    const rows = grid.rows || 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const frame = grid.columnMajor ? (col * rows + row) : (row * columns + col);
        const cellX = firstX + col * cellW;
        const cellY = firstY + row * cellH;

        this.flat.push({
          id: grid.id,
          label: `${grid.label}`,
          flabel: `${grid.label}_${frame}`,
          sx: cellX + insetX,
          sy: cellY + insetY,
          sw: contentW,
          sh: contentH,
          cx: grid.origin ? (grid.origin[0] - insetX) : (cellW / 2 - insetX),
          cy: grid.origin ? (grid.origin[1] - insetY) : (cellH / 2 - insetY),
          frame: (grid.frame || 0) + frame
        });
      }
    }
  }

  _buildLookups() {
    this.sprites = {};

    for (const entry of this.flat) {
      if (!this.sprites[entry.id]) {
        this.sprites[entry.id] = [];
      }
      this.sprites[entry.id][entry.frame] = entry;

      if (entry.label) {
        if (!this.sprites[entry.label]) {
          this.sprites[entry.label] = [];
        }
        this.sprites[entry.label][entry.frame] = entry;
      }

      if (entry.flabel) {
        this.sprites[entry.flabel] = [entry];
      }
    }
  }

  draw(ctx, id, x, y, scale = 1, frame = 0) {
    if (!this.loaded) return;

    const frames = this.sprites[id];
    if (frames && frames.length > 0) {
      const wrappedFrame = frame % frames.length;
      const entry = frames[wrappedFrame];
      if (entry) {
        this._drawEntry(ctx, entry, x, y, scale);
      }
    }
  }

  _drawEntry(ctx, entry, x, y, scale = 1) {
    const dw = entry.sw * scale;
    const dh = entry.sh * scale;
    const dx = x - entry.cx * scale;
    const dy = y - entry.cy * scale;

    ctx.drawImage(this.sheet, entry.sx, entry.sy, entry.sw, entry.sh, dx, dy, dw, dh);
  }
}