import Boreal from '../boreal/boreal.js';

// Ux is a set of div-formatting and UI helper functions.

export default class Ux {
  static id = 0;

  static div(params = {}) {
    const div = document.createElement('div');
    div.params = {...params};
    let parent = params.parent || document.body;
    parent.appendChild(div);
    return div;
  }

  static button(params = {}) {
    const btn = document.createElement('button');
    btn.textContent = params.text || '';
    btn.style.margin = '2px';
    btn.style.padding = '2px 6px';
    if (params.onclick) btn.onclick = params.onclick;
    if (params.disabled) {
      btn.disabled = true;
      btn.style.color = '#999';
      btn.style.background = '#ddd';
      btn.style.border = '1px solid #bbb';
    }
    if (params.parent) params.parent.appendChild(btn);
    return btn;
  }

  static gameHeader(params = {}) {
    const div = Ux.div(params);
    div.space = params.space;
    div.redraw = (params = {}) => {
      let text = `🪙${div.space.spaceport.money} 🔷${div.space.spaceport.gems} ${div.space.time}`;
      params.text ||= text;
      div.textDiv.redraw(params);
    };

    div.textDiv = Ux.text1({ parent: div, });

    div.redraw();

    return div;
  }

  static setupFullscreen() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
  }

  static createScreenRoot(parent, params = {}) {
    const screenRoot = document.createElement('div');
    Object.assign(screenRoot.style, {
      position: 'relative',
      width: params.width || '100%',
      height: params.height || '100%',
    });
    if (params.onClick) screenRoot.onclick = params.onClick;
    parent.appendChild(screenRoot);
    return screenRoot;
  }

  static createGameContainer(params = {}) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      position: 'absolute',
      width: params.width || '100%',
      height: params.height || '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: params.background || 'transparent',
    });
    if (params.onClick) container.onclick = params.onClick;
    return container;
  }

  static createResourcePanel(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      padding: params.padding || '12px',
      borderBottom: params.borderBottom || '1px solid #ddd',
      fontWeight: params.fontWeight || 'bold',
      background: params.background || 'white',
      color: params.color || '#1a1a1a',
    });
    if (params.onClick) div.onclick = params.onClick;
    return div;
  }

  static box1(params = {}) {
    let div = Ux.div(params);
    Object.assign(div.style, {
      border: '1px solid #999',
      padding: '2px',
      margin: '2px',
      background: params.background || '#fafafa',
      fontFamily: params.fontFamily || 'monospace',
      fontSize: params.fontSize || '12px',
    });
    return div;
  }

  static text1(params = {}) {
    let div = Ux.div(params);
    // text contents from params.text, with line break, pre formatting
    div.redraw = (params = {}) => {
      div.textContent = params.text || '';
    }

    div.redraw(params);

    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    Object.assign(div.style, {
      border: '1px solid #999',
      padding: '2px',
      margin: '2px',
      background: params.background || '#fafafa',
      fontFamily: params.fontFamily || 'monospace',
      fontSize: params.fontSize || '12px',

    });
    // here's a redraw func that will update the text contents
    return div;
  }

  static building2(params = {}) {
    let div = Ux.box1(params);
    div.redraw = (params = {}) => {
    }
    let text = Ux.text1({parent: div, text: 'Hello'});
    let buttons = [
      'Upgrade',
      'Finish',
      'Research',
      'Speedup',
      'Build',
      'Launch',
      'Abort',
      'Mission',
    ].map(text => {
      return Ux.button({text: text, parent: div, onclick: () => {
        if (params.onCommand) {
          params.onCommand(text);
        }
      }});
    });
    return div;
  }

  static createBuildingsPanel(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      padding: params.padding || '12px',
      flex: params.flex || '1',
      overflowY: params.overflow || 'auto',
      background: params.background || 'white',
    });
    if (params.onClick) div.onclick = params.onClick;
    return div;
  }

  static createEventsPanel(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      padding: params.padding || '12px',
      borderTop: params.borderTop || '1px solid #ddd',
      minHeight: params.minHeight || '40px',
      background: params.background || '#f9f9f9',
      color: params.color || '#333',
    });
    if (params.onClick) div.onclick = params.onClick;
    return div;
  }

  static createGameLayout(params = {}) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%';

    // 1. Meta controls (top stripe)
    const metaControls = document.createElement('div');
    Object.assign(metaControls.style, {
      padding: '4px 12px',
      background: '#f0f0f0',
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '8px'
    });

    if (params.onReset) {
      Ux.button({ text: 'Reset', onclick: params.onReset, parent: metaControls });
    }
    if (params.onSave) {
      Ux.button({ text: 'Save', onclick: params.onSave, parent: metaControls });
    }
    if (params.onNewGame) {
      Ux.button({ text: 'New game', onclick: params.onNewGame, parent: metaControls });
    }

    // 2. Game header (resources)
    const gameHeader = document.createElement('div');
    Object.assign(gameHeader.style, {
      padding: '8px 12px',
      background: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid #ddd'
    });

    const resources = document.createElement('div');
    resources.style.display = 'flex';
    resources.style.gap = '16px';

    const moneyDisplay = document.createElement('div');
    moneyDisplay.textContent = '💸 $10';
    moneyDisplay.style.fontWeight = 'bold';

    const gemsDisplay = document.createElement('div');
    gemsDisplay.textContent = '💠 5';
    gemsDisplay.style.fontWeight = 'bold';

    resources.appendChild(moneyDisplay);
    resources.appendChild(gemsDisplay);
    gameHeader.appendChild(resources);

    // 3. Sky section
    const sky = Ux.sky(params.skyParams || {});

    // 4. City/buildings area
    const city = document.createElement('div');
    Object.assign(city.style, {
      flex: '1',
      overflowY: 'auto',
      padding: '12px',
      background: params.cityBackground || '#f9f9f9',
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      gap: '8px'
    });

    container.appendChild(metaControls);
    container.appendChild(gameHeader);
    container.appendChild(sky);
    container.appendChild(city);

    // Update function
    container.updateResources = (data = {}) => {
      moneyDisplay.textContent = `💸 $${data.money || 10}`;
      gemsDisplay.textContent = `💠 ${data.gems || 5}`;
    };

    return container;
  }

  static sky(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      width: '100%',
      minHeight: '20px',
      marginBottom: params.marginBottom || '8px',
      background: params.background || 'linear-gradient(to bottom, #87CEEB, #E0F6FF)',
      border: params.border || '1px solid #999',
      position: 'relative',
      overflow: 'hidden',
    });
    Ux._setParent(div, params);
    return div;
  }

  static building(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      border: params.border || '1px solid #999',
      padding: params.padding || '12px',
      margin: '1px',
      background: params.background || '#fafafa',
      fontFamily: params.fontFamily || 'monospace',
      fontSize: params.fontSize || '12px',
      width: 'auto',
      display: 'inline-block',
    });

    const nameLevel = document.createElement('div');
    nameLevel.style.marginBottom = '8px';
    div.appendChild(nameLevel);

    const upgradeBtn = Ux.button({ text: 'Upgrade', onclick: params.onUpgrade, disabled: !params.onUpgrade, parent: div });
    const speedupBtn = Ux.button({ text: 'Speedup', onclick: params.onSpeedup, disabled: !params.onSpeedup, parent: div });
    const collectBtn = Ux.button({ text: 'Collect', onclick: params.onCollect, disabled: !params.onCollect, parent: div });

    div.redraw = (data = {}) => {
      let infoStr = data.info?.t ? ` (${data.info.t})` : '';
      nameLevel.textContent = `${data.name} [${data.level}]${infoStr}`;
    };

    return div;
  }

  static createCityDiv(params = {}) {
    const div = document.createElement('div');
    Object.assign(div.style, {
      padding: params.padding || '12px',
      flex: params.flex || '1',
      overflowY: params.overflow || 'auto',
      background: params.background || 'white',
    });

    div.redraw = (content = '') => {
      div.textContent = content;
    };

    return div;
  }

  static _setParent(div, params) {
    if (params.parent) {
      params.parent.appendChild(div);
    }
  }

  static store(params = {}) {
    let div = Ux.div(params);
    Object.assign(div.style, {
      border: '1px solid #999',
      padding: '12px',
      margin: '1px',
      background: '#f5f5f5',
      width: 'auto',
      display: 'inline-block',
    });

    const collapsedDiv = document.createElement('div');
    Object.assign(collapsedDiv.style, {
      display: 'flex',
      justifyContent: 'flex-start',
    });
    const storeBtn = Ux.button({ text: 'Store', parent: collapsedDiv });
    storeBtn.onclick = () => {
      collapsedDiv.style.display = 'none';
      expandedDiv.style.display = 'block';
    };

    const expandedDiv = document.createElement('div');
    expandedDiv.style.display = 'none';

    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    });

    const title = document.createElement('div');
    title.textContent = 'Store';
    title.style.fontWeight = 'bold';
    header.appendChild(title);

    const closeBtn = Ux.button({ text: 'X', parent: header });
    closeBtn.onclick = () => {
      expandedDiv.style.display = 'none';
      collapsedDiv.style.display = 'flex';
    };
    expandedDiv.appendChild(header);

    const itemsContainer = document.createElement('div');
    Object.assign(itemsContainer.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    });

    if (params.items) {
      params.items.forEach(item => {
        const itemDiv = document.createElement('div');
        Object.assign(itemDiv.style, {
          border: '1px solid #ccc',
          padding: '8px',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        });

        const itemName = document.createElement('div');
        itemName.textContent = item.name;

        const buyBtn = Ux.button({ text: 'Buy', disabled: item.hidden, parent: itemDiv });
        if (!item.hidden && params.onBuy) {
          buyBtn.onclick = () => params.onBuy(item);
        }

        itemDiv.appendChild(itemName);
        itemDiv.appendChild(buyBtn);
        itemsContainer.appendChild(itemDiv);
      });
    }

    expandedDiv.appendChild(itemsContainer);

    div.appendChild(collapsedDiv);
    div.appendChild(expandedDiv);

    div.redraw = (newParams = {}) => {
    };

    return div;
  }

  static screen2(params = {}) {
    let div = Ux.div(params);
    new Boreal(div, { scrollable: true });
    div.redraw = (p = {}) => {
    };
    div.redraw(params);
    return div;
  }

  static header2(params = {}) {
    let div = Ux.div(params);
    Ux.text1({
      parent: div,
      text: 'Screen2',
    });

    if (params.buttons) {
      let buttonsDiv = Ux.div({ parent: div });
      Object.assign(buttonsDiv.style, {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
      });

      params.buttons.forEach(btn => {
        const button = Ux.button({ text: btn.text, parent: buttonsDiv });
        if (btn.onClick) {
          button.onclick = btn.onClick;
        }
      });
    }

    let textB = Ux.text1({
      parent: div,
    });

    div.redraw = (p = {}) => {
      textB.redraw({
        text: `count:${p.count || 0} frame:${p.frame || 0} dt:${(p.dt || 0).toFixed(3)}`,
      });
    };

    div.redraw(params);

    return div;
  }

  static hr(params = {}) {
    let div = Ux.div(params);
    Object.assign(div.style, {
      borderTop: '1px solid #999',
      margin: '4px 0',
    });
    return div;
  }

  static city2(params = {}) {
    let div = Ux.div(params);
    div.redraw = (p = {}) => {
    }
    div.redraw(params);
    return div;
  }

}