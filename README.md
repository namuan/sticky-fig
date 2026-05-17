# sticky-fig

A JavaScript DSL for generating stick figure comic strips as SVG.

## Install

```bash
npm install
```

## Quick Start

```js
const { figure, POSES, EXPRESSIONS, bubble, panel, strip } = require('./index')

const alice = figure('Alice', {
  expression: 'happy',
  pose: POSES.waving,
  x: 80,
  y: 150,
  stroke: '#333',
  hair: 'long',
  scale: 1.1,
})

const bob = figure('Bob', {
  expression: 'surprised',
  pose: POSES.standing,
  x: 250,
  y: 150,
  stroke: '#333',
  hat: 'tophat',
})

const comic = strip({
  title: 'My Comic',
  layout: 'row',
  width: 800,
})

comic
  .addPanel(panel({
    background: '#fff8e1',
    figures: [alice, bob],
    bubbles: [
      bubble('Hey Bob!', { x: 130, y: 30, tailX: 85, tailY: 70 }),
      bubble('Oh, hi Alice!', { x: 280, y: 30, tailX: 250, tailY: 70 }),
    ],
    caption: 'Meanwhile...',
  }))
  .addPanel(panel({
    background: '#ffebee',
    figures: [
      figure('Carol', { expression: 'angry', pose: POSES.pointing, x: 80, y: 140, hair: 'spiky' }),
      figure('Dave', { expression: 'laughing', pose: POSES.armsUp, x: 250, y: 140, hair: 'curly' }),
    ],
    bubbles: [
      bubble('That was TERRIBLE!', { x: 140, y: 30, tailX: 80, tailY: 70, style: 'shout' }),
    ],
  }))

const fs = require('fs')
fs.writeFileSync('comic.svg', comic.render())
```

## CLI

```bash
node bin/stickyfig.js examples/basic.js
```

## Demo

Open `demo.html` in a browser for an interactive gallery of expressions, poses, hair styles, hats, bubble types, and comic strip examples.

## API

### `figure(name, opts)`

Create a stick figure character.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `x`, `y` | number | `0` | Position in panel |
| `expression` | string | `'neutral'` | Facial expression |
| `pose` | Pose \| object | standing | Body pose |
| `stroke` | string | `'black'` | Stroke color |
| `scale` | number | `1` | Size multiplier |
| `hair` | string | `null` | `'spiky'` \| `'long'` \| `'curly'` \| `'mohawk'` |
| `hat` | string | `null` | `'tophat'` \| `'cap'` \| `'cowboy'` |

### Expressions

`neutral`, `happy`, `sad`, `angry`, `surprised`, `scared`, `laughing`, `wink`, `confused`, `thinking`, `dead`, `dizzy`

### Poses

`standing`, `walking`, `running`, `waving`, `pointing`, `shrugging`, `sitting`, `kicking`, `defeated`, `armsUp`, `thinking2`, `thumbsUp`

Or create custom poses:

```js
const { pose } = require('./index')

const lunge = pose({
  leftArm: { shoulder: 40, elbow: -30 },
  rightArm: { shoulder: -80, elbow: 10 },
  leftLeg: { hip: 20, knee: 10 },
  rightLeg: { hip: -30, knee: 5 },
  bodyLean: 5,
  headTilt: -10,
})
```

### `bubble(text, opts)`

Create a speech bubble.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `x`, `y` | number | `0` | Center position |
| `tailX`, `tailY` | number | center / center+40 | Tail tip position (points to speaker) |
| `style` | string | `'speech'` | `'speech'` \| `'thought'` \| `'shout'` |
| `fontSize` | number | `13` | Text size |
| `maxWidth` | number | `150` | Max text width before wrapping |
| `bold` | boolean | `false` | Bold text |

### `panel(opts)`

Create a comic panel.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width`, `height` | number | `400`, `300` | Panel dimensions |
| `background` | string | `'white'` | Background color |
| `figures` | array | `[]` | Stick figures in panel |
| `bubbles` | array | `[]` | Speech bubbles |
| `caption` | string | `null` | Caption text |
| `effects` | array | `[]` | Visual effects (see below) |

### Effects

```js
{ type: 'speed-lines', x: 100, y: 120, startAngle: 200, spread: 60, count: 10, length: 80 }
{ type: 'anger', x: 80, y: 130 }
{ type: 'sweat', x: 100, y: 120 }
```

### `strip(opts)`

Create a comic strip (container for panels).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `''` | Strip title |
| `width` | number | `800` | Total width |
| `layout` | string | `'row'` | `'row'` \| `'column'` |
| `gap` | number | `5` | Gap between panels |
| `borderColor` | string | `'black'` | Border color |
| `borderWidth` | number | `3` | Panel border width |

```js
const comic = strip({ title: 'My Comic', layout: 'row', width: 800 })
comic.addPanel(panel1).addPanel(panel2)
const svg = comic.render() // returns SVG string
```

## Browser Usage

Include the browser bundle and use the global `StickyFig`:

```html
<script src="dist/stickyfig.js"></script>
<script>
  const { figure, POSES, bubble, panel, strip } = StickyFig;
  // same API as Node.js
</script>
```

## License

MIT
