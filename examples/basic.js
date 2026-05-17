const { figure, pose, POSES } = require('../src/figure')
const { bubble, panel, strip } = require('../src/comic')

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

const carol = figure('Carol', {
  expression: 'angry',
  pose: POSES.pointing,
  x: 80,
  y: 140,
  stroke: '#333',
  hair: 'spiky',
})

const dave = figure('Dave', {
  expression: 'laughing',
  pose: POSES.armsUp,
  x: 250,
  y: 140,
  stroke: '#333',
  hair: 'curly',
})

const comic = strip({
  title: 'Stick Figure Adventures',
  layout: 'row',
  width: 800,
})

comic
  .addPanel(panel({
    background: '#fff8e1',
    figures: [alice, bob],
    bubbles: [
      bubble('Hey Bob!', { x: 140, y: 30, tailX: 80, tailY: 70 }),
      bubble('Oh, hi Alice!', { x: 280, y: 30, tailX: 250, tailY: 70 }),
    ],
    caption: 'Meanwhile...',
  }))
  .addPanel(panel({
    background: '#ffebee',
    figures: [carol, dave],
    bubbles: [
      bubble('That was TERRIBLE!', { x: 140, y: 30, tailX: 80, tailY: 70, style: 'shout' }),
      bubble('Ha ha ha!', { x: 280, y: 30, tailX: 250, tailY: 70 }),
    ],
    effects: [
      { type: 'anger', x: 80, y: 130 },
    ],
  }))

const fs = require('fs')
fs.writeFileSync('example-comic.svg', comic.render())
console.log('Saved example-comic.svg')