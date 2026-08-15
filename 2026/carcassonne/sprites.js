export default class Sprites {
  constructor() {
    this.tileSize = 128;
    this.tileImages = {};
    this.columns = 8;
    this.rows = 8;

    this.sheet = new Image();
    this.sheet.src = 'data/c03.png';
    this.codes = [
      'grgg', 'gggg', 'cccc', 'crgr', 'gggc', 'cgcg',
      'gcgc', 'cgcg', 'ccgg', 'rrgc', 'cgrr', 'crrr',
      'ggcc', 'ggcc', 'rrcc', 'rrcc', 'cgcc', 'cgcc',
      'crcc', 'crcc', 'grgr', 'grrg', 'rrrg', 'rrrr',
    ];
  }

  getImage(params = {}, x = 0, y = 0) {
  }

  draw(ctx, data) {
    const { n, r } = data;
    this._drawSprite(ctx, 0, 0, n, r);
    //this._drawPlaceholder(ctx, data);
  }

  _getSource(n) {
    n = n % 24;
    const col = n % 6 + 1;
    const row = Math.floor(n / 6) + 1;
    const sx = col * this.tileSize;
    const sy = row * this.tileSize;
    return [sx, sy, this.tileSize, this.tileSize];
  }

  _drawImage(ctx, x, y) {
    let n = Math.floor(Math.random() * 64);
    let r = Math.floor(Math.random() * 4);
    this._drawSprite(ctx, x, y, n, r);
  }

  _drawSprite(ctx, x, y, n, r) {
    const [sx, sy, sw, sh] = this._getSource(n);
    const cx = x + sw / 2;
    const cy = y + sh / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-(r * Math.PI) / 2);
    ctx.drawImage(this.sheet, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
    ctx.restore();
  }

  _drawPlaceholder(ctx, data) {
    const px = 0;
    const py = 0;

    ctx.fillStyle = '#fff';
    //ctx.fillRect(px, py, this.tileSize, this.tileSize);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(px, py, this.tileSize, this.tileSize);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${data.key} ${data.n} ${data.r}`, px + 4, py + 12);
    ctx.fillText(`${data.code} ${data.neighbors}`, px + 4, py + 28);
  }


}
