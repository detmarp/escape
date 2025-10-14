export default class Ui {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.container = document.createElement('div');
    parent.appendChild(this.container);

    this._setup();

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _setup() {
    this.innerSize = 118;
    this.inner = document.createElement('div');
    this.inner.style.margin = '4px';
    this.inner.style.width = `calc(var(--size120) * ${this.innerSize})`;
    this.inner.style.height = `calc(var(--size120) * ${this.innerSize})`;
    this.inner.style.background = '#888'; // medium gray
    this.inner.style.position = 'relative';
    this.inner.style.userSelect = 'none';
    this.inner.style.touchAction = 'none';
    this.inner.style.webkitUserSelect = 'none';
    this.container.appendChild(this.inner);

    this._makePieces();
    this._getImage();

    // Handle both touchstart and mousedown events
    this.inner.addEventListener('touchstart', (e) => {
      this._onTouchEvent(e);
    }, { passive: false });
    this.inner.addEventListener('mousedown', (e) => {
      this._onTouchEvent(e);
    });

    this.container.style.position = 'absolute';
    this.container.style.left = '50%';
    this.container.style.top = '0';
    this.container.style.transform = 'translateX(-50%)';
    this.container.style.display = 'flex';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
  }

  _makePieces() {
    this.pieces = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const piece = document.createElement('div');
        piece.style.width = '25%';
        piece.style.height = '25%';
        piece.style.position = 'absolute';
        piece.style.left = `${j * 25}%`;
        piece.style.top = `${i * 25}%`;
        piece.style.boxSizing = 'border-box';
        piece.style.border = '1px solid #444';
        piece.style.backgroundSize = '800px 800px';
        piece.style.backgroundRepeat = 'no-repeat';
        piece.index = i * 4 + j;
        piece.screen = this._getScreen(piece.index);
        // Initial background will be set by _setPiecesImage
        this.inner.appendChild(piece);
        this.pieces.push(piece);
      }
    }
  }

  _redrawPieces() {
    // For each visual piece (0-15), find its logical position in fifteen.board
    for (let visualIdx = 0; visualIdx < 16; visualIdx++) {
      let boardIdx = -1;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (this.program.fifteen.board[i][j] === visualIdx) {
            boardIdx = i * 4 + j;
          }
        }
      }
      if (boardIdx !== -1) {
        const [x, y] = this._getScreen(boardIdx);
        const piece = this.pieces[visualIdx];
        piece.style.left = `${x}px`;
        piece.style.top = `${y}px`;
      } else {
        // If the piece is the null, hide it
        this.pieces[visualIdx].style.display = 'none';
      }
    }
  }

  _getScreen(index) {
    const pieceW = this.inner.offsetWidth / 4;
    const pieceH = this.inner.offsetHeight / 4;
    const x = (index % 4) * pieceW;
    const y = Math.floor(index / 4) * pieceH;
    return [x, y];
  }

  _setPiecesImage(imgUrl) {
    const innerW = this.inner.offsetWidth;
    const innerH = this.inner.offsetHeight;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const idx = i * 4 + j;
        const piece = this.pieces[idx];
        const x = -(j * innerW / 4);
        const y = -(i * innerH / 4);
        piece.style.backgroundImage = `url(${imgUrl})`;
        piece.style.backgroundPosition = `${x}px ${y}px`;
        piece.style.backgroundSize = `${innerW}px ${innerH}px`;
      }
    }
  }

  _getImage() {
    // Create gradient image
    const size = 800;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#00ff00'); // green
    grad.addColorStop(1, '#0000ff'); // blue
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const gradientUrl = canvas.toDataURL();
    this._setPiecesImage(gradientUrl);

    // Load cat image
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this._setPiecesImage(img.src);
    };
    img.src = 'https://cataas.com/cat?width=800&height=800';
  }

  _onTouchEvent(e) {
    e.preventDefault();
    let x, y;
    if (e.touches && e.touches.length > 0) {
      const rect = this.inner.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if (e.clientX !== undefined && e.clientY !== undefined) {
      const rect = this.inner.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    // Convert to percent of innerSize
    const percentX = Math.max(0, Math.min(100, (x / (parseFloat(this.inner.style.width) || this.inner.offsetWidth)) * 100));
    const percentY = Math.max(0, Math.min(100, (y / (parseFloat(this.inner.style.height) || this.inner.offsetHeight)) * 100));
    this._onTouch(percentX, percentY);
  }

  _onTouch(percentX, percentY) {
    const x = Math.max(0, Math.min(3, Math.floor(percentX / 25)));
    const y = Math.max(0, Math.min(3, Math.floor(percentY / 25)));
    const index = y * 4 + x;
    const moves = this.program.fifteen.touch(index);
    var solved = false;
    if (moves.length > 0) {
      solved = this.program.fifteen.doMoves(moves);
      console.log('moves', JSON.stringify(moves));
    }
    console.log(this.program.fifteen.toString());
    console.log(solved ? 'Puzzle solved!' : 'Not solved yet.');
    this._redrawPieces();
  }

  _resize() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    this.size = size;
    this.container.style.width = size + 'px';
    this.container.style.height = size + 'px';
    this.container.style.setProperty('--size', size + 'px');
    this.container.style.setProperty('--size120', size/120 + 'px');
    // Update piece backgrounds to match new inner size
    if (this.pieces && this.pieces.length === 16) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const idx = i * 4 + j;
          const piece = this.pieces[idx];
          const innerW = this.inner.offsetWidth;
          const innerH = this.inner.offsetHeight;
          const x = -(j * innerW / 4);
          const y = -(i * innerH / 4);
          piece.style.backgroundSize = `${innerW}px ${innerH}px`;
          piece.style.backgroundPosition = `${x}px ${y}px`;
        }
      }
    }

    this._redrawPieces();
  }
}
