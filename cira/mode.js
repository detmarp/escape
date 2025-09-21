export default class Mode {
  constructor(program) {
    this.program = program;
  }

  checkUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return mode ? mode : null;
  }

  set(mode) {
    const params = new URLSearchParams(window.location.search);
    if (mode === 'menu') {
      params.delete('mode');
      const newParams = params.toString();
      const newUrl = newParams ? '?' + newParams : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else {
      params.set('mode', mode);
      window.history.replaceState({}, '', '?' + params.toString());
    }
  }
}
