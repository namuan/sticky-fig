const { figure, pose, POSES, EXPRESSIONS, StickFigure, Pose: PoseClass } = require('./src/figure')
const { bubble, panel, strip, Panel, ComicStrip, SpeechBubble } = require('./src/comic')
const svg = require('./src/svg')
const { Animation, animation, ANIMATION_PRESETS, collectAnimationStyles } = require('./src/animation')

module.exports = {
  figure,
  pose,
  POSES,
  EXPRESSIONS,
  StickFigure,
  Pose: PoseClass,
  bubble,
  panel,
  strip,
  Panel,
  ComicStrip,
  SpeechBubble,
  svg,
  Animation,
  animation,
  ANIMATION_PRESETS,
  collectAnimationStyles,
}