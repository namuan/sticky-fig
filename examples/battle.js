const { figure, pose, POSES } = require('../src/figure')
const { bubble, panel, strip } = require('../src/comic')

const hero = figure('Hero', {
  expression: 'angry',
  pose: POSES.kicking,
  x: 100,
  y: 145,
  stroke: '#1a237e',
  hair: 'mohawk',
  scale: 1.15,
})

const villain = figure('Villain', {
  expression: 'scared',
  pose: pose({ leftArm: { shoulder: 50, elbow: -30 }, rightArm: { shoulder: -50, elbow: 30 }, leftLeg: { hip: 30, knee: 20 }, rightLeg: { hip: -40, knee: 15 }, bodyLean: -5, headTilt: 15 }),
  x: 280,
  y: 150,
  stroke: '#b71c1c',
  hat: 'cowboy',
})

const onlooker = figure('Onlooker', {
  expression: 'surprised',
  pose: POSES.standing,
  x: 200,
  y: 155,
  stroke: '#333',
  scale: 0.8,
})

const narrator = figure('Narrator', {
  expression: 'thinking',
  pose: POSES.thinking2,
  x: 180,
  y: 150,
  stroke: '#555',
  hair: 'spiky',
})

const defeated = figure('Villain2', {
  expression: 'dead',
  pose: POSES.defeated,
  x: 280,
  y: 170,
  stroke: '#b71c1c',
  hat: 'cowboy',
  scale: 0.9,
})

const comic = strip({
  title: 'EPIC BATTLE',
  layout: 'column',
  width: 400,
})

comic
  .addPanel(panel({
    background: '#e3f2fd',
    height: 280,
    figures: [narrator],
    bubbles: [
      bubble('Hmm... where did he go?', { x: 260, y: 40, tailX: 180, tailY: 80, style: 'thought' }),
    ],
    caption: 'Earlier...',
  }))
  .addPanel(panel({
    background: '#fff3e0',
    height: 300,
    figures: [hero, villain],
    bubbles: [
      bubble('Take this!', { x: 100, y: 35, tailX: 100, tailY: 75, style: 'shout' }),
    ],
    effects: [
      { type: 'speed-lines', x: 80, y: 120, startAngle: 200, spread: 60, count: 10, length: 80 },
    ],
  }))
  .addPanel(panel({
    background: '#fce4ec',
    height: 300,
    figures: [onlooker, defeated],
    bubbles: [
      bubble('Oh no!', { x: 200, y: 35, tailX: 200, tailY: 100 }),
    ],
  }))

const fs = require('fs')
const output = comic.render()
fs.writeFileSync('examples/battle.svg', output)
console.log('Battle comic saved to examples/battle.svg')