export default class Persist {
  constructor(key = 'space-data') {
    this.key = key;
    this.data = {};
  }

  load() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        this.data = JSON.parse(stored);
        return true;
      }
    } catch (error) {
      console.warn('Failed to load data:', error);
    }
    return false;
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.warn('Failed to save data:', error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.removeItem(this.key);
      this.data = {};
      return true;
    } catch (error) {
      console.warn('Failed to clear data:', error);
      return false;
    }
  }
}
