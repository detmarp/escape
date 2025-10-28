import UiParts from './uiparts.js';
import Icons from './icons.js';

export default class UxTwo {
  constructor() {
  }

  addToggle(parent, labelText, initialState, onChange) {
    const container = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = initialState;
    checkbox.id = `checkbox-${labelText.replace(/\s+/g, '-').toLowerCase()}`;
    checkbox.addEventListener('change', (event) => {
      onChange(event.target.checked);
    });

    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = checkbox.id;
    // clicking the label should toggle the checkbox and trigger the onChange
    label.addEventListener('click', (ev) => {
      // Prevent double-handling if the browser already toggles the checkbox via htmlFor
      // We'll toggle the checked state explicitly and fire the change event so callers
      // always see the change.
      ev.preventDefault();
      checkbox.checked = !checkbox.checked;
      // dispatch a native change event so the existing listener runs
      const changeEvent = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(changeEvent);
    });

    container.appendChild(checkbox);
    container.appendChild(label);
    parent.appendChild(container);
  }

  addText(parent, text) {
    const p = document.createElement('p');
    p.textContent = text;
    parent.appendChild(p);
  }

  addButton(parent, label, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', onClick.bind(this));
    parent.appendChild(button);
    return button;
  }

  addMeeplePicker(parent, meeples, value, onSelected, label, onClick) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.dataset.value = value ||  meeples[0];
    parent.appendChild(container);

    const updateSelection = () => {
      const tiles = container.querySelectorAll('.meeple-tile');
      tiles.forEach((t) => {
      if (t.dataset.value === container.dataset.value) {
        t.style.border = '2px solid #000';
        t.style.fontWeight = '700';
      } else {
        t.style.border = '1px solid #aaa';
        t.style.fontWeight = '400';
      }
      });
    };

    let uiParts = new UiParts();
    let icons = new Icons();
    meeples.forEach((val) => {
      const tile = document.createElement('div');
      tile.className = 'meeple-tile';
      tile.dataset.value = String(val);
      tile.style.padding = '4px 8px';
      tile.style.borderRadius = '4px';
      tile.style.cursor = 'pointer';
      tile.style.userSelect = 'none';
      tile.style.display = 'inline-block';

      let meeple = uiParts.getMeeple(val);
      let icon = icons.makeMeeple(meeple);
      icon.style.width = '1.2em';
      icon.style.height = '1.2em';
      icon.style.fontSize = '1.2em';
      icon.style.display = 'inline-block';
      tile.appendChild(icon);

      // initial border based on current container value
      if (tile.dataset.value === container.dataset.value) {
        tile.style.border = '2px solid #000';
        tile.style.fontWeight = '700';
      } else {
        tile.style.border = '1px solid #aaa';
      }

      tile.addEventListener('click', () => {
      container.dataset.value = tile.dataset.value;
      updateSelection();
      if (typeof onSelected === 'function') {
        onSelected(tile.dataset.value);
      }
      });

      container.appendChild(tile);
    });

    // optional action button placed after the meeple tiles
    if (label) {
      const actionBtn = document.createElement('button');
      actionBtn.textContent = label;
      if (typeof onClick === 'function') {
        actionBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          onClick(container.dataset.value);
        });
      }
      else {
        actionBtn.disabled = true;
      }
      container.appendChild(actionBtn);
    }

    return container;
  }
}
