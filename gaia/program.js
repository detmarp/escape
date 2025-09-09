import Tabs from './tabs.js';
import MainScreen from './mainscreen.js';

export default class Program {
  constructor(parent) {
    this.parent = parent;
  }

  run() {
    this._setup();
  }

  _setup() {
    this.parent.innerHTML = '';
    var tabs = new Tabs(this.parent);

    var tab1 = tabs.addTab('Tab 1');
    var mainScreen = new MainScreen(tab1);
    mainScreen.create();

    var tab2 = tabs.addTab('Tab 2');
    tab2.innerHTML = 'tab 2';

    var tab3 = tabs.addTab('Tab 3');
    tab3.innerHTML = 'tab 3';
  }
}