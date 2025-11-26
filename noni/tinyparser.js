export default class TinyParser {
  constructor() {
  }

  tokenize(command) {
    // return array of objects - with string, optional number, optional object
    const tokens = [];
    let str = command;
    let word;
    while (([word, str] = this._nextToken(str))[0] !== null) {
      let token = { string: word };
      if (!isNaN(word) && word.trim() !== '') {
        token.number = Number(word);
      }
      if (word.startsWith('{') || word.startsWith('[')) {
        try {
          token.object = JSON.parse(word);
        } catch (e) {
        }
      }
      tokens.push(token);
    }
    return tokens;
  }

  _nextToken(str) {
    str = str.trim();
    if (!str) {
      return [null, ''];
    }
    let c = str[0];
    if (c === '[') {
      let depth = 1;
      let i = 1;
      while (i < str.length && depth > 0) {
        if (str[i] === '[') depth++;
        if (str[i] === ']') depth--;
        i++;
      }
      let token = str.slice(0, i);
      let remainder = str.slice(i).trim();
      return [token, remainder];
    }
    if (c === '{') {
      let depth = 1;
      let i = 1;
      while (i < str.length && depth > 0) {
        if (str[i] === '{') depth++;
        if (str[i] === '}') depth--;
        i++;
      }
      let token = str.slice(0, i);
      let remainder = str.slice(i).trim();
      return [token, remainder];
    }
    let i = 0;
    while (i < str.length && str[i] !== ' ' && str[i] !== '\t' && str[i] !== '[' && str[i] !== '{') {
      i++;
    }
    let token = str.slice(0, i);
    let remainder = str.slice(i).trim();
    if (token.length > 0) {
      return [token, remainder];
    }
    return [null, remainder];
  }

  _test() {
    console.log('ttt TinyParser test');
    this._logTest('resource  wood  5');
    this._logTest('     ');
    this._logTest(' , , ,    ');
    this._logTest(' , ,one,    ');
    this._logTest('foo, bar [baz, qux] {key: value}');
    this._logTest('  [ 1, 2, 3 , { a: b, c: d } ] ,  foo ');
    this._logTest('{ key1: value1, key2: [ x, y, z ], key3: { a: b } }');
  }

  _logTest(input) {
    let groups = this.groups(input);
    console.log(`Input: "${input}"`);
    groups.forEach((group, i) => {
      console.log(`${i}: ${JSON.stringify(group)}`);
    });
    console.log('');
  }
}
