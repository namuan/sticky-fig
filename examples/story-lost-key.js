const { figure, pose, POSES } = require('../src/figure')
const { bubble, panel, strip } = require('../src/comic')

const patDownPose = pose({
  leftArm: { shoulder: 40, elbow: -90 },
  rightArm: { shoulder: -40, elbow: -90 },
  leftLeg: { hip: 5, knee: 0 },
  rightLeg: { hip: -5, knee: 0 },
  bodyLean: -5,
})

const searchPose = pose({
  leftArm: { shoulder: 30, elbow: -60 },
  rightArm: { shoulder: -20, elbow: -60 },
  leftLeg: { hip: 5, knee: 0 },
  rightLeg: { hip: -5, knee: 0 },
  headTilt: -15,
})

const comic = strip({
  title: 'The Lost Key',
  layout: 'column',
  width: 520,
})

// Top row: Scene 1 (left) + Scene 2 (right)
comic.addPanel(panel({
  border: false, width: 520,
  background: '#fafafa', height: 290,
  figures: [
    figure('Hero', {
      expression: 'happy', pose: POSES.waving,
      x: 130, y: 165, stroke: '#333', hair: 'spiky', scale: 1.05,
    }),
    figure('Hero', {
      expression: 'surprised', pose: patDownPose,
      x: 390, y: 170, stroke: '#333', hair: 'spiky', scale: 1.05,
    }),
  ],
  bubbles: [
    bubble('Beautiful day for a walk!', {
      x: 130, y: 50, tailX: 130, tailY: 95,
      maxWidth: 180, fontSize: 13,
    }),
    bubble("Wait... where're my keys?!", {
      x: 390, y: 40, tailX: 390, tailY: 95, style: 'shout',
      maxWidth: 230, fontSize: 14,
    }),
  ],
  effects: [
    { type: 'sweat', x: 370, y: 118 },
  ],
}))

// Bottom row: Scene 3 (left) + Scene 4 (right)
comic.addPanel(panel({
  border: false, width: 520,
  background: '#fafafa', height: 290,
  figures: [
    figure('Hero', {
      expression: 'confused', pose: searchPose,
      x: 130, y: 170, stroke: '#333', hair: 'spiky', scale: 1.05,
    }),
    figure('Hero', {
      expression: 'laughing', pose: POSES.armsUp,
      x: 390, y: 160, stroke: '#333', hair: 'spiky', scale: 1.05,
    }),
  ],
  bubbles: [
    bubble('Under the couch? On the table? Ugh...', {
      x: 130, y: 40, tailX: 130, tailY: 95, style: 'thought',
      maxWidth: 210, fontSize: 12,
    }),
    bubble('In my pocket the whole time!', {
      x: 390, y: 45, tailX: 390, tailY: 92,
      maxWidth: 210, fontSize: 13,
    }),
  ],
  effects: [
    { type: 'anger', x: 105, y: 125 },
  ],
}))

const fs = require('fs')
const output = comic.render()
fs.writeFileSync('examples/story-lost-key.svg', output)
console.log('Story comic saved to examples/story-lost-key.svg')
