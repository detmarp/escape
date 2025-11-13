export default class TinyParser {
  constructor() {
  }

  groups(command) {
    let tokens = this.tokenize(command);
    let groups = [];
    let currentGroup = [];
    for (let token of tokens) {
      if (token === ',') {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
          currentGroup = [];
        }
      } else {
        currentGroup.push(token);
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  }

  tokenize(command) {
    const tokens = [];
    let str = command;
    let token;
    while (([token, str] = this._nextToken(str))[0] !== null) {
      tokens.push(token);
    }
    return tokens;
  }

  _nextToken(str) {
    // Trim leading whitespace
    str = str.trim();
    if (!str) {
      return [null, ''];
    }

    let c = str[0];
    // Handle comma as a token
    if (c === ',') {
      let remainder = str.slice(1).trim();
      return [',', remainder];
    }
    // Handle balanced [] group
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
    // Handle balanced {} group
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
    // Otherwise, split at first whitespace or comma
    let i = 0;
    while (i < str.length && str[i] !== ' ' && str[i] !== '\t' && str[i] !== ',' && str[i] !== '[' && str[i] !== '{') {
      i++;
    }
    let token = str.slice(0, i);
    let remainder = str.slice(i).trim();
    if (token.length > 0) {
      return [token, remainder];
    }
    // If we hit a comma, return it as a token
    if (str[i] === ',') {
      remainder = str.slice(i + 1).trim();
      return [',', remainder];
    }
    // If we hit a bracket or brace, handle in next call
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
