import TinyHistory from './tinyhistory.js';

export default class UiMain {
  constructor(parent, program) {
    this.parent = parent;
    this.program = program;
    this.render();
  }

  render() {
    this.parent.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = 'Main';
    this.parent.appendChild(title);

    this._addButton('Settings ⚙', () => {
      this.program.gotoMode('settings');
    });

    let history = new TinyHistory(this.program.saveData.data.history);

    let daily = history.getDailyGames(15);

    let row1 = this._startRow('Daily games');
    daily.forEach((entry) => {
      const btn = this._gameButton(entry);
      row1.appendChild(btn);
    });

    let other = history.getOtherGames(25);
    let row2 = this._startRow('Other games');
    const newGame = this._gameButton();
    row2.appendChild(newGame);

    other.forEach((entry) => {
      const btn = this._gameButton(entry);
      row2.appendChild(btn);
    });

    if (this.program.saveData.data.quickstart) {
      this._addButton('Quickstart', this._onQuickstart);
    }
  }

  _getDayInfo(now, daysAgo) {
    // return some info about the day `daysAgo` before `now` (0 = today)
    const MS_DAY = 24 * 60 * 60 * 1000;
    const d = new Date(now.getTime() - (daysAgo * MS_DAY));
    const month = d.getMonth(); // 0-11
    const day = d.getDate(); // 1-31
    const year = d.getFullYear();
    const weekday = d.getDay(); // 0-6, local weekday for that date
    const weekdayabbr = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
    const utcMidnightTs = Math.floor(Date.UTC(year, month, day) / 1000);
    // simple positive 32-bit hash of utcMidnightTs (Knuth multiplicative)
    const hash = (Number(utcMidnightTs) * 2654435761) >>> 0;
    const seed = (hash % 900000) + 100000;
    return { ago: daysAgo, weekdayabbr, ts: utcMidnightTs, seed };
  }

  _startRow(label) {
    const lbl = document.createElement('div');
    lbl.textContent = label;
    lbl.style.marginBottom = '0.5em';
    this.parent.appendChild(lbl);

    const scroller = document.createElement('div');
    scroller.style.display = 'flex';
    scroller.style.flexDirection = 'row';
    scroller.style.gap = '0.5em';
    scroller.style.alignItems = 'center';
    scroller.style.width = '28em';
    scroller.style.overflowX = 'auto';
    scroller.style.overflowY = 'hidden';
    scroller.style.padding = '0.5em';
    scroller.style.border = '1px solid black';
    scroller.style.borderRadius = '4px';
    scroller.style.background = 'transparent';
    scroller.style.cursor = 'grab';
    // Hide scrollbar but keep scrolling
    scroller.style.scrollbarWidth = 'none'; // Firefox
    scroller.style.msOverflowStyle = 'none'; // IE/Edge
    // Tell browser we won't preventDefault on touch - allows passive scrolling
    scroller.style.touchAction = 'pan-x';

    // Simple drag-to-scroll for mouse only
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    scroller.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
      scroller.style.cursor = 'grabbing';
    });

    scroller.addEventListener('mouseleave', () => {
      isDragging = false;
      scroller.style.cursor = 'grab';
    });

    scroller.addEventListener('mouseup', () => {
      isDragging = false;
      scroller.style.cursor = 'grab';
    });

    scroller.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scroller.offsetLeft;
      const walk = (x - startX) * 2; // scroll speed multiplier
      scroller.scrollLeft = scrollLeft - walk;
    });

    this.parent.appendChild(scroller);
    return scroller;
  }

  _addText(text) {
    const p = document.createElement('p');
    p.textContent = text;
    this.parent.appendChild(p);
  }

  _addHeader(text) {
    const h = document.createElement('h1');
    h.textContent = text;
    this.parent.appendChild(h);
    return h;
  }

  _addButton(label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    if (typeof onClick === 'function') {
      button.addEventListener('click', onClick.bind(this));
    }
    this.parent.appendChild(button);
    return button;
  }

  _gameButton(params) {
    console.log(`bbb ${JSON.stringify(params)}`);
    const btn = document.createElement('button');
    btn.type = 'button';
    // make it a 6em square
    btn.style.width = '6em';
    btn.style.height = '6em';
    btn.style.minWidth = '6em';
    btn.style.minHeight = '6em';
    btn.style.maxWidth = '6em';
    btn.style.maxHeight = '6em';
    btn.style.boxSizing = 'border-box';
    // prevent flex container from stretching the button
    btn.style.flex = '0 0 auto';
    // very light grey background, no border
    btn.style.backgroundColor = '#f0f0f0';
    btn.style.border = 'none';
    // remove default padding so child can fill completely
    btn.style.padding = '0';
    // position relative so child layers can fill it
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';

    btn.onclick = () => {
      this._onGameButton(params);
    };

    let over = params && params.over;
    let started = params && params.saved;

    let colors;
    let border = '0.1em';
    colors = [ '#e6f2ff', '#b3d9ff' ];
    if (over) {
      colors = [ '#ffec97', '#daa520' ];
      border = '0.4em';
    }
    else if (started) {
      colors = [ '#91c5fc', '#2c80d4' ];
      border = '0.3em';
    }
    if (colors) {
      // Blue
      let layer = document.createElement('div');
      layer.style.backgroundColor = colors[0];
      layer.style.border = border + ' solid ' + colors[1];
      layer.style.borderRadius = '8px';
      layer.style.boxSizing = 'border-box';
      // fill the parent button completely
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      btn.appendChild(layer);
    }

    let star = over;
    if (star) {
      let layer = document.createElement('div');
      layer.style.opacity = '0.7';
      layer.textContent = '⭐';
      layer.style.fontSize = '4em';
      layer.style.display = 'flex';
      layer.style.alignItems = 'center';
      layer.style.justifyContent = 'center';
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
    }

    let newGame;
    newGame = !params;
    if (newGame) {
      // New Game
      let layer = document.createElement('div');
      layer.textContent = 'New Game';
      layer.style.color = '#333333';
      layer.style.fontSize = '1.8em';
      layer.style.fontWeight = 'bold';
      layer.style.display = 'flex';
      layer.style.alignItems = 'center';
      layer.style.justifyContent = 'center';
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
      // early out
      return btn;
    }

    let score;
    score = params && params.points;
    if (score !== undefined) {
      let layer = document.createElement('div');
      layer.textContent = score;
      layer.style.fontSize = '3em';
      layer.style.fontWeight = 'bold';
      layer.style.color = '#333333';
      layer.style.display = 'flex';
      layer.style.alignItems = 'center';
      layer.style.justifyContent = 'center';
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
    }

    let seed;
    seed = params && !params.daily && params.seed;
    if (seed) {
      let layer = document.createElement('div');
      layer.textContent = seed;
      layer.style.fontSize = '0.9em';
      layer.style.color = '#505050';
      layer.style.position = 'absolute';
      layer.style.top = '0.4em';
      layer.style.right = '0.6em';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
    }

    let ago;
    ago = started && params.time && this._ago(params.time);
    if (ago) {
      let layer = document.createElement('div');
      layer.textContent = ago;
      layer.style.fontSize = '1.2em';
      layer.style.fontWeight = 'bold';
      layer.style.color = '#404040';
      layer.style.position = 'absolute';
      layer.style.bottom = '0.3em';
      layer.style.left = '0.4em';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
    }

    let day;
    if (params.daily && params.month && params.day && params.weekday) {
      let abbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][params.weekday];
      day = `${abbr} ${params.month}/${params.day}`;
    }
    if (day) {
      let layer = document.createElement('div');
      layer.textContent = day;
      layer.style.fontSize = '0.9em';
      layer.style.fontWeight = 'bold';
      layer.style.color = '#404040';
      layer.style.position = 'absolute';
      layer.style.top = '0.4em';
      layer.style.left = '0.5em';
      layer.style.pointerEvents = 'none';
      btn.appendChild(layer);
    }

    return btn;
  }

  _onQuickstart() {
    this.program.newGame();
    this.program.gotoMode('gameboard');
  }

  _onContinue() {
    this.program.tryContinue();
  }

  _onGameButton(entry) {
    let history = new TinyHistory(this.program.saveData.data.history);
    let tiny = history.tinyFromObject(entry);
    this.program.newGame(tiny);

    if (tiny.started) {
      this.program.gotoMode('gameboard');
    }
    else {
      this.program.gotoMode('pregame');
    }
  }

  _ago(timeStamp) {
    let ago = Math.floor((Date.now() - timeStamp) / 1000);
    // return string. use these rules
    // if seconds <= 30 "now"
    // otherwise round up to minutes.
    // if minutes < 60 then "X m"
    // round up to hours, ading 15 minut and then rounding up.
    // if hours < 20 then "X h"
    // else round up to days, "X d"
    if (ago <= 30) return 'now';
    const minutes = Math.ceil(ago / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.ceil((minutes + 15) / 60);
    if (hours < 20) return `${hours}h`;
    const days = Math.ceil(hours / 24);
    return `${days}d`;
  }
}