const fs = require('fs')
const path = require('path')

const svgSource = fs.readFileSync(path.join(__dirname, '../src/svg.js'), 'utf-8')
const figureSource = fs.readFileSync(path.join(__dirname, '../src/figure.js'), 'utf-8')
const comicSource = fs.readFileSync(path.join(__dirname, '../src/comic.js'), 'utf-8')
const animSource = fs.readFileSync(path.join(__dirname, '../src/animation.js'), 'utf-8')

function stripCommonJS(code) {
  // Remove require() calls
  code = code.replace(/^.* = require\([^)]+\)\n?/gm, '')
  // Remove module.exports block (multi-line, until closing } on its own line or end of string)
  code = code.replace(/^module\.exports = \{[\s\S]*?\n\}[^]*$/m, '')
  return code.trim()
}

// Process animation module: remove _idCounter and ANIMATION_PRESETS (added by bundle)
let animJs = stripCommonJS(animSource)
animJs = animJs.replace(/^let _idCounter = 0\n/m, '')
animJs = animJs.replace(/^const ANIMATION_PRESETS = Object\.keys\(PRESETS\)\n?/m, '')

// Process figure module
let figureJs = stripCommonJS(figureSource)
figureJs = figureJs.replace(/^let _figIdCounter = 0\n/m, '')
figureJs = figureJs.replace(/^const ANIM_ID_PREFIX = 'sffig'\n/m, '')

// Remove POSES block from figure source (bundle adds it separately)
const posesStartIdx = figureJs.indexOf('const POSES = {')
if (posesStartIdx !== -1) {
  let depth = 0
  let i = posesStartIdx + 'const POSES = '.length
  for (; i < figureJs.length; i++) {
    if (figureJs[i] === '{') depth++
    else if (figureJs[i] === '}') { depth--; if (depth === 0) break }
  }
  const newlineIdx = figureJs.indexOf('\n', i)
  const endIdx = newlineIdx !== -1 ? newlineIdx + 1 : figureJs.length
  figureJs = figureJs.substring(0, posesStartIdx) + figureJs.substring(endIdx)
}

// Process comic module
let comicJs = stripCommonJS(comicSource)
comicJs = comicJs.replace(/^let _bubbleIdCounter = 0\n/m, '')
comicJs = comicJs.replace(/^const BUBBLE_ID_PREFIX = 'sfbbl'\n/m, '')

const svgJs = stripCommonJS(svgSource)

const parts = [
  '(function(root) {',
  '  \'use strict\';',
  '',
svgJs,

  '  const svg = { SvgCanvas: SvgCanvas, line: line, circle: circle, filledCircle: filledCircle, ellipse: ellipse, rect: rect, polygon: polygon, polyline: polyline, path: path, text: text, group: group, translate: translate, scale: scale, rotate: rotate, clipPath: clipPath };',

  '  // ── Shared Counters ──',
  '  let _idCounter = 0;',
  '  let _figIdCounter = 0;',
  '  let _bubbleIdCounter = 0;',
  '  const ANIM_ID_PREFIX = \'sffig\';',
  '  const BUBBLE_ID_PREFIX = \'sfbbl\';',
  '',
  '  // ── Animation System ──',
  animJs,
  '',
  '  // ── Stick Figures ──',
  '  const mkAnimation = animationFactory;',
  figureJs,
  '',
  '  // ── Comics ──',
  comicJs,
  '',
  '  // ── Preset Poses ──',
  '  const POSES = {',
  '    standing:  new Pose({ leftArm: { shoulder: 15, elbow: 0 }, rightArm: { shoulder: -15, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),',
  '    walking:  new Pose({ leftArm: { shoulder: 30, elbow: -20 }, rightArm: { shoulder: -30, elbow: -20 }, leftLeg: { hip: 25, knee: 0 }, rightLeg: { hip: -25, knee: 10 } }),',
  '    running:   new Pose({ leftArm: { shoulder: 50, elbow: -30 }, rightArm: { shoulder: -50, elbow: -30 }, leftLeg: { hip: 40, knee: 20 }, rightLeg: { hip: -40, knee: 25 } }),',
  '    waving:    new Pose({ leftArm: { shoulder: -150, elbow: -30 }, rightArm: { shoulder: -10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),',
  '    pointing:  new Pose({ leftArm: { shoulder: -80, elbow: 0 }, rightArm: { shoulder: 10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),',
  '    shrugging: new Pose({ leftArm: { shoulder: 70, elbow: -80 }, rightArm: { shoulder: -70, elbow: 80 }, bodyLean: 0 }),',
  '    sitting:   new Pose({ leftLeg: { hip: 70, knee: -70 }, rightLeg: { hip: -70, knee: 70 }, leftArm: { shoulder: 10, elbow: 0 }, rightArm: { shoulder: -10, elbow: 0 } }),',
  '    kicking:   new Pose({ leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -80, knee: 10 }, leftArm: { shoulder: 30, elbow: 0 }, rightArm: { shoulder: -50, elbow: 0 } }),',
  '    defeated:  new Pose({ leftArm: { shoulder: 40, elbow: -40 }, rightArm: { shoulder: -40, elbow: 40 }, leftLeg: { hip: 15, knee: 15 }, rightLeg: { hip: -15, knee: 10 }, bodyLean: 10, headTilt: 20 }),',
  '    armsUp:    new Pose({ leftArm: { shoulder: 150, elbow: 0 }, rightArm: { shoulder: -150, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 }, headTilt: -5 }),',
  '    thinking2: new Pose({ leftArm: { shoulder: 70, elbow: -90 }, rightArm: { shoulder: -10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 }, headTilt: -10 }),',
  '    thumbsUp:  new Pose({ leftArm: { shoulder: 10, elbow: 0 }, rightArm: { shoulder: -160, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),',
  '  };',
  '',
  '  const ANIMATION_PRESETS = Object.keys(PRESETS);',
  '',
  '  function animationFactory(type, opts) {',
  '    opts = opts || {};',
  '    if (typeof type === \'object\' && type !== null) {',
  '      opts = type;',
  '      type = type.type || \'bounce\';',
  '    }',
  '    return new Animation(type, opts);',
  '  }',
  '',
  '  // ── Export ──',
  '  root.StickyFig = {',
  '    figure: figure, pose: pose, POSES: POSES, EXPRESSIONS: EXPRESSIONS,',
  '    StickFigure: StickFigure, Pose: Pose,',
  '    bubble: bubble, panel: panel, strip: strip,',
  '    SpeechBubble: SpeechBubble, Panel: Panel, ComicStrip: ComicStrip,',
  '    SvgCanvas: SvgCanvas,',
  '    Animation: Animation, animation: animationFactory,',
  '    ANIMATION_PRESETS: ANIMATION_PRESETS,',
  '    collectAnimationStyles: collectAnimationStyles,',
  '  };',
  '',
  '})(typeof window !== \'undefined\' ? window : this);',
]

const bundle = parts.join('\n')
fs.writeFileSync(path.join(__dirname, '../dist/stickyfig.js'), bundle)
console.log('Bundle written to dist/stickyfig.js')
console.log('Size:', Math.round(bundle.length / 1024), 'KB')