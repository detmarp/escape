export default class Tabs {
  constructor(parent) {
    this.parent = parent;
    this.tabs = [];
    this.activeTab = null;

    // Create tab bar (row of buttons)
    this.tabBar = document.createElement('div');
    this.tabBar.className = 'tab-bar';
    parent.appendChild(this.tabBar);

    // Create content area (below tab buttons)
    this.contentArea = document.createElement('div');
    parent.appendChild(this.contentArea);
  }

  addTab(name) {
    // Create tab button
    const tabBtn = document.createElement('button');
    tabBtn.textContent = name;

    // Create content div for this tab
    const contentDiv = document.createElement('div');
    contentDiv.style.display = 'none';

    tabBtn.onclick = () => {
      // Hide all tab contents and remove active class
      this.tabs.forEach(t => {
        t.content.style.display = 'none';
        t.button.classList.remove('active');
      });
      contentDiv.style.display = '';
      tabBtn.classList.add('active');
      this.activeTab = tabBtn;
    };

    this.tabBar.appendChild(tabBtn);
    this.contentArea.appendChild(contentDiv);
    this.tabs.push({ button: tabBtn, content: contentDiv });

    // Activate first tab by default
    if (this.tabs.length === 1) {
      tabBtn.onclick();
    }

    return contentDiv;
  }
}