export default class SpriteA {
  constructor(baseFilename) {
    this.baseFilename = baseFilename;
    this.sheet = new Image();
    this.data = null;
    this.loaded = false;
    this.error = null;
    this.flat = [];
    this.sprites = {};
    this.strips = {};

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

    // Skip if grid.id or grid.label is undefined/null/empty
    if (grid.id == null && !grid.label) return;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const frame = grid.columnMajor ? (col * rows + row) : (row * columns + col);
        const cellX = firstX + col * cellW;
        const cellY = firstY + row * cellH;

        this.flat.push({
          id: grid.id,
          label: grid.label ? `${grid.label}` : undefined,
          flabel: grid.label ? `${grid.label}_${frame}` : undefined,
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
    this.strips = {};

    for (const entry of this.flat) {
      if (entry.id != null) {
        if (!this.strips[entry.id]) {
          this.strips[entry.id] = [];
        }
        this.strips[entry.id][entry.frame] = entry;

        if (!this.sprites[entry.id] || entry.frame === 0) {
          this.sprites[entry.id] = entry;
        }
      }

      if (entry.label) {
        if (!this.strips[entry.label]) {
          this.strips[entry.label] = [];
        }
        this.strips[entry.label][entry.frame] = entry;

        if (!this.sprites[entry.label] || entry.frame === 0) {
          this.sprites[entry.label] = entry;
        }
      }

      if (entry.flabel) {
        this.sprites[entry.flabel] = entry;
      }
    }
  }

  getFrame(id, frame = 0) {
    const strip = this.strips[id];
    if (strip && strip.length > 0) {
      if (strip[frame]) {
        return strip[frame];
      }

      const dense = strip.filter(Boolean);
      if (dense.length > 0) {
        let wrapped = frame % dense.length;
        if (wrapped < 0) {
          wrapped += dense.length;
        }
        return dense[wrapped];
      }
    }

    if (frame === 0 && this.sprites[id]) {
      return this.sprites[id];
    }

    return null;
  }

  getStrip(id) {
    const strip = this.strips[id];
    if (!strip) {
      return null;
    }
    return strip.filter(Boolean);
  }

  getSprite(id) {
    return this.sprites[id] || null;
  }


  drawFrame(ctx, id, frame = 0, x, y, scale = 1) {
    //console.log(`Drawing frame: id=${id}, frame=${frame}, x=${x}, y=${y}, scale=${scale}`);
    if (!this.loaded) return;

    const sprite = this.getFrame(id, frame);
    if (sprite) {
      this.drawSprite(ctx, sprite, x, y, scale);
    }
  }

  drawSprite(ctx, sprite, x, y, scale = 1) {
    const dw = sprite.sw * scale;
    const dh = sprite.sh * scale;
    const dx = x - sprite.cx * scale;
    const dy = y - sprite.cy * scale;
    ctx.drawImage(this.sheet, sprite.sx, sprite.sy, sprite.sw, sprite.sh, dx, dy, dw, dh);
  }
}