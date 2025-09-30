1) Single class export:
```
// math.js
export default class Math {
  static add(a, b) { return a + b; }
}
```
2) Multiple things export:
```// utils.js
export class Vector { /* ... */ }
export class Matrix { /* ... */ }
export const PI = 3.14159;
```
3) Import single class:
```// main.js
import Math from './math.js';  // no braces for default
Math.add(1, 2);
```
4) Import multiple things:
```// main.js
import { Vector, Matrix, PI } from './utils.js';  // braces for named exports
Vector.add([1,2], [3,4]);
```
5) Module keyword: No, you don't need it. That's old CommonJS syntax (module.exports). Just use export/import.
```import * as Utils from './utils.js';  // everything as Utils object
Utils.Vector.add([1,2], [3,4]);
```
Bonus - import everything:
```import * as Utils from './utils.js';  // everything as Utils object
Utils.Vector.add([1,2], [3,4]);
```

### What does `import * as ...` mean?

`import * as Utils from './utils.js';`

This syntax imports **all named exports** from a module as properties of an object (`Utils` in this example).
You can then access everything via `Utils.Vector`, `Utils.Matrix`, `Utils.PI`, etc.

- It does **not** import the default export (unless you do `Utils.default`).
- Useful for grouping related functions/classes from a module.

**Example:**
```js
import * as Utils from './utils.js';
console.log(Utils.Vector);
console.log(Utils.PI);
```

default means "the main thing this file exports"
// math.js
export default class Math { /* ... */ }  // This is THE main export
Import with ANY name you want:
import Math from './math.js';      // can call it Math
import Calculator from './math.js'; // or Calculator
import Foo from './math.js';       // or Foo - same thing!
vs named exports (no default):
// vector.js
export class Vector { /* ... */ }  // named export, must use exact name
Must import with exact name:
import { Vector } from './vector.js';  // MUST be "Vector", can't rename easily
One file can have both:
// combo.js
export default class Main { /* ... */ }  // the main thing
export class Helper { /* ... */ }        // extra named export

import Main, { Helper } from './combo.js';  // default first, then named in braces

default = "import me with whatever name you want"