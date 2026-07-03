// Font loading and management
class FontLoader {
  static loaded = false;
  static loading = false;
  static promise = null;

  static fontDefs = {
    title: { name: 'Noto Sans', weights: [400, 700] },
    mono: { name: 'Roboto Mono', weights: [400, 700] },
    copy: { name: 'Public Sans', weights: [300, 500] },
  };

  static get(type, size = 16) {
    return `${size}px ${this.fontDefs[type].name}`;
  }

  static _buildFontUrl() {
    const families = Object.values(this.fontDefs)
      .map(font => `family=${font.name.replace(/ /g, '+')}:wght@${font.weights.join(';')}`)
      .join('&');
    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
  }

  static async load() {
    if (this.loaded) return;
    if (this.loading) return this.promise;

    this.loading = true;
    this.promise = new Promise((resolve) => {
      const link = document.createElement('link');
      link.href = this._buildFontUrl();
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      document.fonts.ready.then(() => {
        this.loaded = true;
        this.loading = false;
        resolve();
      });
    });

    return this.promise;
  }
}

export default class Text {
  static TITLE = 'title';
  static MONO = 'mono';
  static COPY = 'copy';

  constructor(size = 16, type = Text.COPY, color = '#fff', text = '---') {
    this.size = size;
    this.type = type;
    this.color = color;
    this.text = text;
    this.centered = false;
    FontLoader.load();
  }

  draw(ctx) {
    Text.drawText(ctx, this.text, 0, this.size, this.type, this.size, this.color, this.centered);
  }

  static setFont(ctx, type, size = 16) {
    ctx.font = FontLoader.get(type, size);
    return ctx;
  }

  static drawText(ctx, text, x, y, type = Text.COPY, size = 16, color = '#fff', centered = false) {
    ctx.fillStyle = color;
    ctx.font = FontLoader.get(type, size);
    let drawX = x;
    if (centered) {
      const metrics = ctx.measureText(text);
      drawX = x - metrics.width / 2;
    }
    ctx.fillText(text, drawX, y);
  }
}