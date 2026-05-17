const { figure, pose, POSES, EXPRESSIONS, StickFigure, Pose: PoseClass } = require('./src/figure')
const { bubble, panel, strip, Panel, ComicStrip, SpeechBubble } = require('./src/comic')
const svg = require('./src/svg')

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
}