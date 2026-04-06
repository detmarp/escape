# Code Generation Instructions

## Code Style Preferences

- **No comments in code**: Never add comments to code unless explicitly requested by the user
- **Clean minimal code**: Focus on writing self-explanatory, clean code without commentary
- **Let code speak**: Variable names, function names, and structure should be clear enough without comments

## When Comments Are Acceptable

- Only when the user explicitly asks for comments or documentation
- For complex algorithms where the logic is truly non-obvious
- For API documentation when specifically requested

## Examples

❌ **Don't do this:**
```javascript
// Create canvas element
this.canvas = document.createElement('canvas');
// Set context
this.ctx = this.canvas.getContext('2d');
```

✅ **Do this instead:**
```javascript
this.canvas = document.createElement('canvas');
this.ctx = this.canvas.getContext('2d');
```