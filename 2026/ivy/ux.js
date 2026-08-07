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

  static building(params = {}) {
    let div = Ux.div(params);
    div.redraw = (params = {}) => {
    }
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

  static createHeader(params = {}) {
    const header = document.createElement('div');
    Object.assign(header.style, {
      padding: params.padding || '12px',
      borderBottom: params.borderBottom || '1px solid #ddd',
      background: params.background || 'white',
    });

    const infoDisplay = document.createElement('div');
    Object.assign(infoDisplay.style, {
      marginBottom: '8px',
      fontSize: '13px',
      color: params.color || '#666',
    });

    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '8px';

    if (params.onReset) {
      const resetBtn = Ux.button({ text: params.resetLabel || 'Reset', onclick: params.onReset, parent: btnContainer });
      resetBtn.style.marginRight = '8px';
    }

    if (params.onSave) {
      const saveBtn = Ux.button({ text: params.saveLabel || 'Save', onclick: params.onSave, parent: btnContainer });
      saveBtn.style.marginRight = '8px';
    }

    if (params.onNewGame) {
      Ux.button({ text: params.newGameLabel || 'New game', onclick: params.onNewGame, parent: btnContainer });
    }

    const counterDisplay = document.createElement('div');
    Object.assign(counterDisplay.style, {
      marginTop: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
    });

    header.appendChild(infoDisplay);
    header.appendChild(btnContainer);
    header.appendChild(counterDisplay);

    header.redraw = (data = {}) => {
      infoDisplay.textContent = data.info || '';
      counterDisplay.textContent = data.counter || '';
    };

    return header;
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
      marginBottom: params.marginBottom || '8px',
      background: params.background || '#fafafa',
      fontFamily: params.fontFamily || 'monospace',
      fontSize: params.fontSize || '12px',
    });

    const nameLevel = document.createElement('div');
    nameLevel.style.marginBottom = '8px';

    const upgradeBtn = Ux.button({ text: 'Upgrade', onclick: params.onUpgrade, disabled: !params.onUpgrade, parent: div });
    const speedupBtn = Ux.button({ text: 'Speedup', onclick: params.onSpeedup, disabled: !params.onSpeedup, parent: div });
    const collectBtn = Ux.button({ text: 'Collect', onclick: params.onCollect, disabled: !params.onCollect, parent: div });

    div.appendChild(nameLevel);
    div.appendChild(upgradeBtn);
    div.appendChild(speedupBtn);
    div.appendChild(collectBtn);
    div.redraw = (data = {}) => {
      nameLevel.textContent = `${data.name} [${data.level}] ${JSON.stringify(data.info)}`;
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
      marginBottom: '8px',
      background: '#f5f5f5',
    });

    const collapsedDiv = document.createElement('div');
    Object.assign(collapsedDiv.style, {
      display: 'flex',
      justifyContent: 'center',
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
}