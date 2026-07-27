// Ux is a set of div-formatting and UI helper functions.
export default class Ux {
  static id = 0;
  static nextHue = 0;

  constructor(parent = document.body) {
    this.parent = parent;
  }

  div(params = {}) {
    let parent = params.parent || this.parent;
    let elementType = params.type || 'div';
    let div = document.createElement(elementType);
    parent.append(div);
    if (params.onclick) {
      div.addEventListener('click', params.onclick);
    }
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
      const resetBtn = document.createElement('button');
      resetBtn.textContent = params.resetLabel || 'Reset';
      resetBtn.style.marginRight = '8px';
      resetBtn.onclick = params.onReset;
      btnContainer.appendChild(resetBtn);
    }

    if (params.onSave) {
      const saveBtn = document.createElement('button');
      saveBtn.textContent = params.saveLabel || 'Save';
      saveBtn.onclick = params.onSave;
      btnContainer.appendChild(saveBtn);
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
}