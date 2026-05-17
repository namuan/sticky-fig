(function(root) {
  'use strict';

class SvgCanvas {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.elements = []
    this.defs = []
    this.styles = []
  }

  addDef(def) {
    this.defs.push(def)
  }

  add(el) {
    this.elements.push(el)
  }

  addStyle(css) {
    this.styles.push(css)
  }

  render() {
    const defsXml = this.defs.length > 0
      ? `\n  <defs>\n    ${this.defs.join('\n    ')}\n  </defs>`
      : ''
    const styleXml = this.styles.length > 0
      ? `\n  <style>\n    ${this.styles.join('\n    ')}\n  </style>`
      : ''

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
${defsXml}${styleXml}
  <rect width="100%" height="100%" fill="white"/>
  ${this.elements.join('\n  ')}
</svg>`
  }
}

function line(x1, y1, x2, y2, opts = {}) {
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  const dasharray = opts.dash ? ` stroke-dasharray="${opts.dash}"` : ''
  const cap = opts.cap ? ` stroke-linecap="${opts.cap}"` : ''
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${dasharray}${cap}/>`
}

function circle(cx, cy, r, opts = {}) {
  const fill = opts.fill || 'none'
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function filledCircle(cx, cy, r, fill, opts = {}) {
  const stroke = opts.stroke || fill
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${opts.width || 1}"/>`
}

function ellipse(cx, cy, rx, ry, opts = {}) {
  const fill = opts.fill || 'none'
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function rect(x, y, w, h, opts = {}) {
  const fill = opts.fill || 'none'
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  const rx = opts.rx || 0
  const ry = opts.ry || rx
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" rx="${rx}" ry="${ry}"/>`
}

function polygon(points, opts = {}) {
  const fill = opts.fill || 'none'
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  const pts = points.map(p => p.join(',')).join(' ')
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function polyline(points, opts = {}) {
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  const fill = opts.fill || 'none'
  const cap = opts.cap ? ` stroke-linecap="${opts.cap}"` : ''
  const join = opts.join ? ` stroke-linejoin="${opts.join}"` : ''
  const pts = points.map(p => p.join(',')).join(' ')
  return `<polyline points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${cap}${join}/>`
}

function path(d, opts = {}) {
  const fill = opts.fill || 'none'
  const stroke = opts.stroke || 'black'
  const width = opts.width || 2
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`
}

function text(x, y, content, opts = {}) {
  const size = opts.size || 14
  const family = opts.family || 'Comic Sans MS, cursive'
  const fill = opts.fill || 'black'
  const anchor = opts.anchor || 'middle'
  const weight = opts.bold ? ' font-weight="bold"' : ''
  const style = opts.italic ? ' font-style="italic"' : ''
  const transform = opts.rotate ? ` transform="rotate(${opts.rotate}, ${x}, ${y})"` : ''
  return `<text x="${x}" y="${y}" font-size="${size}" font-family="${family}" fill="${fill}" text-anchor="${anchor}"${weight}${style}${transform}>${content}</text>`
}

function group(elements, opts = {}) {
  const transform = opts.transform || ''
  const tfAttr = transform ? ` transform="${transform}"` : ''
  const clipAttr = opts.clipPath ? ` clip-path="url(#${opts.clipPath})"` : ''
  const classAttr = opts.className ? ` class="${opts.className}"` : ''
  const styleAttr = opts.style ? ` style="${opts.style}"` : ''
  const idAttr = opts.id ? ` id="${opts.id}"` : ''
  const inner = elements.join('\n    ')
  return `<g${tfAttr}${clipAttr}${classAttr}${styleAttr}${idAttr}>\n    ${inner}\n  </g>`
}

function clipPath(id, width, height, opts = {}) {
  const x = opts.x || 0
  const y = opts.y || 0
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath>`
}

function translate(tx, ty) {
  return `translate(${tx}, ${ty})`
}

function scale(sx, sy) {
  return `scale(${sx}, ${sy || sx})`
}

function rotate(angle, cx, cy) {
  if (cx !== undefined && cy !== undefined) {
    return `rotate(${angle}, ${cx}, ${cy})`
  }
  return `rotate(${angle})`
}
  const svg = { SvgCanvas: SvgCanvas, line: line, circle: circle, filledCircle: filledCircle, ellipse: ellipse, rect: rect, polygon: polygon, polyline: polyline, path: path, text: text, group: group, translate: translate, scale: scale, rotate: rotate, clipPath: clipPath };
  // ── Shared Counters ──
  let _idCounter = 0;
  let _figIdCounter = 0;
  let _bubbleIdCounter = 0;
  const ANIM_ID_PREFIX = 'sffig';
  const BUBBLE_ID_PREFIX = 'sfbbl';

  // ── Animation System ──

const PRESETS = {
  bounce: {
    keyframes: `@keyframes sf-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}`,
    defaultDuration: 1.5,
  },
  wave: {
    keyframes: `@keyframes sf-wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(8deg); }
  75% { transform: rotate(-8deg); }
}`,
    defaultDuration: 1,
  },
  shake: {
    keyframes: `@keyframes sf-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`,
    defaultDuration: 0.5,
  },
  'fade-in': {
    keyframes: `@keyframes sf-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}`,
    defaultDuration: 0.8,
    fill: 'forwards',
  },
  pop: {
    keyframes: `@keyframes sf-pop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}`,
    defaultDuration: 0.6,
    fill: 'forwards',
  },
  float: {
    keyframes: `@keyframes sf-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}`,
    defaultDuration: 3,
  },
  pulse: {
    keyframes: `@keyframes sf-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}`,
    defaultDuration: 2,
  },
  jitter: {
    keyframes: `@keyframes sf-jitter {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, -2px); }
}`,
    defaultDuration: 0.3,
  },
  'slide-left': {
    keyframes: `@keyframes sf-slide-left {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}`,
    defaultDuration: 0.7,
    fill: 'forwards',
  },
  'slide-right': {
    keyframes: `@keyframes sf-slide-right {
  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}`,
    defaultDuration: 0.7,
    fill: 'forwards',
  },
  'slide-up': {
    keyframes: `@keyframes sf-slide-up {
  0% { transform: translateY(30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}`,
    defaultDuration: 0.7,
    fill: 'forwards',
  },
  'slide-down': {
    keyframes: `@keyframes sf-slide-down {
  0% { transform: translateY(-30px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}`,
    defaultDuration: 0.7,
    fill: 'forwards',
  },
  spin: {
    keyframes: `@keyframes sf-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
    defaultDuration: 2,
  },
  'pop-in': {
    keyframes: `@keyframes sf-pop-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}`,
    defaultDuration: 0.5,
    fill: 'forwards',
  },
}

class Animation {
  constructor(type, opts = {}) {
    this.id = _idCounter++
    this.type = typeof type === 'string' ? type : null
    this.duration = opts.duration !== undefined ? opts.duration : null
    this.delay = opts.delay || 0
    this.repeat = opts.repeat !== undefined ? opts.repeat : true
    this.direction = opts.direction || null
    this.easing = opts.easing || 'ease-in-out'
    this.customKeyframes = opts.keyframes || null
    this.fill = opts.fill || null
  }

  getDuration() {
    if (this.duration !== null) return this.duration
    const preset = PRESETS[this.type]
    return preset ? preset.defaultDuration : 1
  }

  getFill() {
    if (this.fill) return this.fill
    const preset = PRESETS[this.type]
    return preset ? (preset.fill || 'none') : 'none'
  }

  getRepeatCount() {
    if (this.repeat === true || this.repeat === 'indefinite' || this.repeat === Infinity) return 'indefinite'
    if (typeof this.repeat === 'number') return this.repeat
    return 1
  }

  getDirection() {
    if (this.direction) return this.direction
    if (this.repeat === true || this.repeat === 'indefinite') return 'alternate'
    return 'normal'
  }

  getAnimationName() {
    if (this.customKeyframes) return `sf-custom-${this.id}`
    return `sf-${this.type}`
  }

  getInlineStyle() {
    const name = this.getAnimationName()
    const duration = this.getDuration()
    const delay = this.delay
    const repeat = this.getRepeatCount()
    const direction = this.getDirection()
    const easing = this.easing
    const fill = this.getFill()
    const repeatStr = repeat === 'indefinite' ? 'infinite' : repeat
    let style = `animation-name:${name};animation-duration:${duration}s;animation-timing-function:${easing};animation-delay:${delay}s;animation-iteration-count:${repeatStr};animation-direction:${direction}`
    if (fill && fill !== 'none') {
      style += `;animation-fill-mode:${fill}`
    }
    return style
  }

  getKeyframesCSS() {
    if (this.customKeyframes) {
      return `@keyframes sf-custom-${this.id} { ${this.customKeyframes} }`
    }
    const preset = PRESETS[this.type]
    if (!preset) return ''
    return preset.keyframes
  }

  isPreset() {
    return !this.customKeyframes && PRESETS[this.type]
  }
}

function animation(type, opts) {
  if (typeof type === 'string') {
    return new Animation(type, opts || {})
  }
  if (typeof type === 'object' && type !== null) {
    return new Animation(type.type || 'custom', type)
  }
  return new Animation('bounce', {})
}

function collectAnimationStyles(animations) {
  const keyframeDefs = new Map()
  const styles = []

  for (const anim of animations) {
    if (!anim) continue
    const name = anim.getAnimationName()
    if (!keyframeDefs.has(name)) {
      const css = anim.getKeyframesCSS()
      if (css) keyframeDefs.set(name, css)
    }
  }

  if (keyframeDefs.size > 0) {
    styles.push(Array.from(keyframeDefs.values()).join('\n\n'))
  }

  return styles.join('\n\n')
}



  // ── Stick Figures ──
  const mkAnimation = animationFactory;
const EXPRESSIONS = {
  neutral: { eyes: 'normal', mouth: 'line' },
  happy: { eyes: 'normal', mouth: 'smile' },
  sad: { eyes: 'sad', mouth: 'frown' },
  angry: { eyes: 'angry', mouth: 'frown', brows: 'angry' },
  surprised: { eyes: 'wide', mouth: 'o' },
  scared: { eyes: 'wide', mouth: 'wavy', brows: 'worried' },
  laughing: { eyes: 'closed', mouth: 'big-smile' },
  wink: { eyes: 'wink', mouth: 'smile' },
  confused: { eyes: 'normal', mouth: 'wavy', brows: 'confused' },
  thinking: { eyes: 'look-up', mouth: 'line', brows: 'one-up' },
  dead: { eyes: 'x-eyes', mouth: 'wavy' },
  dizzy: { eyes: 'spiral', mouth: 'wavy' },
}



function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function rad(deg) {
  return deg * Math.PI / 180
}

class Pose {
  constructor(opts = {}) {
    this.headTilt = opts.headTilt || 0
    this.leftArm = opts.leftArm || { shoulder: 0, elbow: 0 }
    this.rightArm = opts.rightArm || { shoulder: 0, elbow: 0 }
    this.leftLeg = opts.leftLeg || { hip: 5, knee: 0 }
    this.rightLeg = opts.rightLeg || { hip: -5, knee: 0 }
    this.bodyLean = opts.bodyLean || 0
  }
}

class StickFigure {
  constructor(name, opts = {}) {
    this.name = name
    this.x = opts.x || 0
    this.y = opts.y || 0
    this.scale = opts.scale || 1
    this.stroke = opts.stroke || 'black'
    this.strokeWidth = opts.strokeWidth || 2.5
    this.headRadius = (opts.headRadius || 18) * this.scale
    this.bodyLength = (opts.bodyLength || 55) * this.scale
    this.armLength = (opts.armLength || 35) * this.scale
    this.legLength = (opts.legLength || 45) * this.scale
    this.armLineWidth = (opts.armLineWidth || 2) * this.scale
    this.expression = opts.expression || 'neutral'
    this.pose = opts.pose instanceof Pose ? opts.pose : new Pose(opts.pose || {})
    this.hair = opts.hair || null
    this.hat = opts.hat || null
    this.accessories = opts.accessories || []
    this.animation = opts.animation || null
    if (this.animation && !(this.animation instanceof Animation)) {
      this.animation = mkAnimation(this.animation)
    }
    this._animId = ANIM_ID_PREFIX + (_figIdCounter++)
  }

  neckX() {
    return 0 + this.pose.bodyLean * this.scale * 0.3
  }
  neckY() {
    return -this.legLength - this.bodyLength
  }

  headX() {
    return this.neckX() + Math.sin(rad(this.pose.headTilt)) * this.headRadius * 0.8
  }
  headY() {
    return this.neckY() - this.headRadius * 1.1
  }

  hipY() {
    return -this.legLength
  }
  shoulderY() {
    return this.neckY() + this.bodyLength * 0.15
  }

  render() {
    const els = []

    const tx = this.x
    const ty = this.y + this.legLength + this.bodyLength

    const headX = this.headX()
    const headY = this.headY()
    const neckX = this.neckX()
    const neckY = this.neckY()
    const hipY = this.hipY()
    const shoulderY = this.shoulderY()

    const shoulderOffsetX = this.headRadius * 0.6
    const hipOffsetX = this.headRadius * 0.25

    els.push(...this._renderLegs(neckX, hipY, hipOffsetX))
    els.push(...this._renderBody(neckX, neckY, hipY))
    els.push(...this._renderArms(neckX, shoulderY, shoulderOffsetX))
    els.push(...this._renderHead(headX, headY))

    if (this.hair) els.push(...this._renderHair(headX, headY))
    if (this.hat) els.push(...this._renderHat(headX, headY))

    const groupOpts = { transform: svg.translate(tx, ty) }

    if (this.animation) {
      return svg.group(
        [svg.group(els, {})],
        {
          ...groupOpts,
          id: this._animId,
          className: this._animId,
          style: this.animation.getInlineStyle(),
        }
      )
    }

    return svg.group(els, groupOpts)
  }

  _renderHead(hx, hy) {
    const els = []
    els.push(svg.circle(hx, hy, this.headRadius, {
      stroke: this.stroke,
      width: this.strokeWidth,
      fill: 'white'
    }))
    els.push(...this._renderExpression(hx, hy))
    return els
  }

  _renderExpression(hx, hy) {
    const els = []
    const expr = EXPRESSIONS[this.expression] || EXPRESSIONS.neutral
    const r = this.headRadius
    const s = this.scale
    const eyeY = hy - r * 0.1
    const eyeSpacing = r * 0.35
    const mouthY = hy + r * 0.35

    const opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }

    if (expr.brows === 'angry') {
      els.push(svg.line(hx - eyeSpacing - r * 0.2, eyeY - r * 0.35, hx - eyeSpacing + r * 0.1, eyeY - r * 0.25, opts))
      els.push(svg.line(hx + eyeSpacing + r * 0.2, eyeY - r * 0.35, hx + eyeSpacing - r * 0.1, eyeY - r * 0.25, opts))
    } else if (expr.brows === 'worried') {
      els.push(svg.line(hx - eyeSpacing - r * 0.15, eyeY - r * 0.3, hx - eyeSpacing + r * 0.15, eyeY - r * 0.38, opts))
      els.push(svg.line(hx + eyeSpacing - r * 0.15, eyeY - r * 0.38, hx + eyeSpacing + r * 0.15, eyeY - r * 0.3, opts))
    } else if (expr.brows === 'confused') {
      els.push(svg.line(hx - eyeSpacing - r * 0.15, eyeY - r * 0.32, hx - eyeSpacing + r * 0.15, eyeY - r * 0.32, opts))
      els.push(svg.line(hx + eyeSpacing - r * 0.15, eyeY - r * 0.38, hx + eyeSpacing + r * 0.15, eyeY - r * 0.28, opts))
    } else if (expr.brows === 'one-up') {
      els.push(svg.line(hx - eyeSpacing - r * 0.15, eyeY - r * 0.38, hx - eyeSpacing + r * 0.15, eyeY - r * 0.3, opts))
    }

    switch (expr.eyes) {
      case 'normal':
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke))
        els.push(svg.filledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke))
        break
      case 'wide':
        els.push(svg.circle(hx - eyeSpacing, eyeY, r * 0.13, { fill: 'white', stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY, r * 0.07, this.stroke))
        els.push(svg.circle(hx + eyeSpacing, eyeY, r * 0.13, { fill: 'white', stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.filledCircle(hx + eyeSpacing, eyeY, r * 0.07, this.stroke))
        break
      case 'sad':
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke))
        els.push(svg.filledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke))
        els.push(svg.line(hx - eyeSpacing - r * 0.15, eyeY - r * 0.18, hx - eyeSpacing + r * 0.08, eyeY - r * 0.1, { stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.line(hx + eyeSpacing + r * 0.15, eyeY - r * 0.18, hx + eyeSpacing - r * 0.08, eyeY - r * 0.1, { stroke: this.stroke, width: 1.5 * s }))
        break
      case 'angry':
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke))
        els.push(svg.filledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke))
        break
      case 'closed':
        els.push(svg.line(hx - eyeSpacing - r * 0.1, eyeY, hx - eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.line(hx + eyeSpacing - r * 0.1, eyeY, hx + eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }))
        break
      case 'wink':
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke))
        els.push(svg.line(hx + eyeSpacing - r * 0.1, eyeY, hx + eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }))
        break
      case 'look-up':
        els.push(svg.filledCircle(hx - eyeSpacing, eyeY - r * 0.05, r * 0.08, this.stroke))
        els.push(svg.filledCircle(hx + eyeSpacing, eyeY - r * 0.05, r * 0.08, this.stroke))
        break
      case 'x-eyes':
        const es = r * 0.1
        els.push(svg.line(hx - eyeSpacing - es, eyeY - es, hx - eyeSpacing + es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.line(hx - eyeSpacing + es, eyeY - es, hx - eyeSpacing - es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.line(hx + eyeSpacing - es, eyeY - es, hx + eyeSpacing + es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }))
        els.push(svg.line(hx + eyeSpacing + es, eyeY - es, hx + eyeSpacing - es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }))
        break
      case 'spiral':
        els.push(svg.path(`M ${hx - eyeSpacing} ${eyeY} a ${r * 0.05} ${r * 0.05} 0 0 1 ${r * 0.1} 0 a ${r * 0.1} ${r * 0.1} 0 0 1 -${r * 0.2} 0`, { stroke: this.stroke, width: 1.2 * s, fill: 'none' }))
        els.push(svg.path(`M ${hx + eyeSpacing} ${eyeY} a ${r * 0.05} ${r * 0.05} 0 0 1 ${r * 0.1} 0 a ${r * 0.1} ${r * 0.1} 0 0 1 -${r * 0.2} 0`, { stroke: this.stroke, width: 1.2 * s, fill: 'none' }))
        break
    }

    const mouthW = r * 0.35
    switch (expr.mouth) {
      case 'line':
        els.push(svg.line(hx - mouthW, mouthY, hx + mouthW, mouthY, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), cap: 'round' }))
        break
      case 'smile':
        els.push(svg.path(`M ${hx - mouthW} ${mouthY - r * 0.05} Q ${hx} ${mouthY + r * 0.25} ${hx + mouthW} ${mouthY - r * 0.05}`, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }))
        break
      case 'frown':
        els.push(svg.path(`M ${hx - mouthW} ${mouthY + r * 0.1} Q ${hx} ${mouthY - r * 0.2} ${hx + mouthW} ${mouthY + r * 0.1}`, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }))
        break
      case 'o':
        els.push(svg.ellipse(hx, mouthY + r * 0.05, r * 0.12, r * 0.15, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'white' }))
        break
      case 'big-smile':
        els.push(svg.path(`M ${hx - mouthW * 1.2} ${mouthY - r * 0.1} Q ${hx} ${mouthY + r * 0.45} ${hx + mouthW * 1.2} ${mouthY - r * 0.1}`, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }))
        break
      case 'wavy':
        els.push(svg.path(`M ${hx - mouthW} ${mouthY} Q ${hx - mouthW * 0.5} ${mouthY + r * 0.12} ${hx} ${mouthY} Q ${hx + mouthW * 0.5} ${mouthY - r * 0.12} ${hx + mouthW} ${mouthY}`, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }))
        break
    }

    return els
  }

  _renderBody(neckX, neckY, hipY) {
    return [
      svg.line(neckX, neckY, neckX, hipY, { stroke: this.stroke, width: this.strokeWidth, cap: 'round' })
    ]
  }

  _renderArms(neckX, shoulderY, shoulderOffset) {
    const els = []
    const armLen = this.armLength
    const halfArm = armLen * 0.5

    for (const side of ['left', 'right']) {
      const arm = side === 'left' ? this.pose.leftArm : this.pose.rightArm
      const dir = side === 'left' ? -1 : 1

      const shoulderAngle = rad(arm.shoulder)
      const shoulderX = neckX + shoulderOffset * dir
      const shoulderPt = [shoulderX, shoulderY]

      const elbowAngle = shoulderAngle + rad(arm.elbow)

      const elbowX = shoulderX + Math.sin(shoulderAngle) * halfArm * dir
      const elbowY = shoulderY + Math.cos(shoulderAngle) * halfArm

      const handX = elbowX + Math.sin(elbowAngle) * halfArm * dir
      const handY = elbowY + Math.cos(elbowAngle) * halfArm

      els.push(svg.line(shoulderX, shoulderY, elbowX, elbowY, {
        stroke: this.stroke, width: this.armLineWidth, cap: 'round'
      }))
      els.push(svg.line(elbowX, elbowY, handX, handY, {
        stroke: this.stroke, width: this.armLineWidth, cap: 'round'
      }))
    }

    return els
  }

  _renderLegs(neckX, hipY, hipOffset) {
    const els = []
    const legLen = this.legLength
    const halfLeg = legLen * 0.5

    for (const side of ['left', 'right']) {
      const leg = side === 'left' ? this.pose.leftLeg : this.pose.rightLeg
      const dir = side === 'left' ? -1 : 1

      const hipAngle = rad(leg.hip)
      const hipX = neckX + hipOffset * dir

      const kneeX = hipX + Math.sin(hipAngle) * halfLeg * dir
      const kneeY = hipY + Math.cos(hipAngle) * halfLeg

      const kneeAngle = hipAngle + rad(leg.knee)
      const footX = kneeX + Math.sin(kneeAngle) * halfLeg * dir
      const footY = kneeY + Math.cos(kneeAngle) * halfLeg

      els.push(svg.line(hipX, hipY, kneeX, kneeY, {
        stroke: this.stroke, width: this.strokeWidth, cap: 'round'
      }))
      els.push(svg.line(kneeX, kneeY, footX, footY, {
        stroke: this.stroke, width: this.strokeWidth, cap: 'round'
      }))
    }

    return els
  }

  _renderHair(hx, hy) {
    const els = []
    const r = this.headRadius
    const opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: 'none' }

    switch (this.hair) {
      case 'spiky':
        for (let i = -2; i <= 2; i++) {
          const angle = -90 + i * 25
          const startX = hx + Math.cos(rad(angle)) * r
          const startY = hy + Math.sin(rad(angle)) * r
          const endX = hx + Math.cos(rad(angle)) * (r + r * 0.4)
          const endY = hy + Math.sin(rad(angle)) * (r + r * 0.4)
          els.push(svg.line(startX, startY, endX, endY, opts))
        }
        break
      case 'long':
        els.push(svg.path(`M ${hx - r} ${hy} C ${hx - r - r * 0.3} ${hy + r * 0.8} ${hx - r * 0.5} ${hy + r * 1.5} ${hx - r * 0.3} ${hy + r * 1.8}`, opts))
        els.push(svg.path(`M ${hx + r} ${hy} C ${hx + r + r * 0.3} ${hy + r * 0.8} ${hx + r * 0.5} ${hy + r * 1.5} ${hx + r * 0.3} ${hy + r * 1.8}`, opts))
        break
      case 'curly':
        for (let i = -3; i <= 3; i++) {
          const angle = -90 + i * 20
          const cx1 = hx + Math.cos(rad(angle)) * (r + r * 0.2)
          const cy1 = hy + Math.sin(rad(angle)) * (r + r * 0.2)
          els.push(svg.circle(cx1, cy1, r * 0.12, { ...opts, fill: this.stroke }))
        }
        break
      case 'mohawk':
        els.push(svg.path(`M ${hx - r * 0.15} ${hy - r} L ${hx} ${hy - r * 1.7} L ${hx + r * 0.15} ${hy - r}`, { ...opts, fill: this.stroke }))
        break
    }

    return els
  }

  _renderHat(hx, hy) {
    const els = []
    const r = this.headRadius
    const opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: 'none' }

    switch (this.hat) {
      case 'tophat':
        els.push(svg.rect(hx - r * 0.5, hy - r * 2, r, r * 0.9, { ...opts, fill: this.stroke }))
        els.push(svg.line(hx - r * 0.8, hy - r * 1.1, hx + r * 0.8, hy - r * 1.1, { ...opts, stroke: this.stroke }))
        break
      case 'cap':
        els.push(svg.path(`M ${hx - r * 0.8} ${hy - r * 0.5} A ${r * 0.8} ${r * 0.5} 0 0 1 ${hx + r * 0.8} ${hy - r * 0.5}`, { ...opts, fill: this.stroke }))
        els.push(svg.line(hx, hy - r * 0.5, hx + r * 0.9, hy - r * 0.2, { ...opts, stroke: this.stroke }))
        break
      case 'cowboy':
        els.push(svg.path(`M ${hx - r * 1.4} ${hy - r * 0.6} L ${hx - r * 0.5} ${hy - r * 0.8} L ${hx - r * 0.5} ${hy - r * 1.6} L ${hx + r * 0.5} ${hy - r * 1.6} L ${hx + r * 0.5} ${hy - r * 0.8} L ${hx + r * 1.4} ${hy - r * 0.6}`, { ...opts, fill: this.stroke }))
        break
    }

    return els
  }
}

function figure(name, opts = {}) {
  return new StickFigure(name, opts)
}

function pose(opts = {}) {
  return new Pose(opts)
}



  // ── Comics ──

class SpeechBubble {
  constructor(text, opts = {}) {
    this.text = text
    this.x = opts.x || 0
    this.y = opts.y || 0
    this.tailX = opts.tailX || this.x
    this.tailY = opts.tailY || this.y + 40
    this.style = opts.style || 'speech'
    this.fill = opts.fill || 'white'
    this.stroke = opts.stroke || 'black'
    this.fontSize = opts.fontSize || 13
    this.fontFamily = opts.fontFamily || 'Comic Sans MS, cursive'
    this.padding = opts.padding || 12
    this.maxWidth = opts.maxWidth || 150
    this.bold = opts.bold || false
    this.animation = opts.animation || null
    if (this.animation && !(this.animation instanceof Animation)) {
      this.animation = mkAnimation(this.animation)
    }
    this._animId = BUBBLE_ID_PREFIX + (_bubbleIdCounter++)
  }

  render() {
    const lines = this._wrapText(this.text, this.maxWidth)
    const lineHeight = this.fontSize * 1.3
    const textBlockHeight = lines.length * lineHeight
    const charWidth = this.fontSize * 0.55
    const longestLine = Math.max(...lines.map(l => l.length))
    const textWidth = Math.min(longestLine * charWidth, this.maxWidth)
    const w = textWidth + this.padding * 2
    const h = textBlockHeight + this.padding * 2

    const bx = this.x - w / 2
    const by = this.y - h / 2
    const r = 10

    const els = []

    if (this.style === 'thought') {
      els.push(svg.rect(bx, by, w, h, { fill: this.fill, stroke: this.stroke, width: 2, rx: r, ry: r }))
      const midX = (this.x + this.tailX) / 2
      const midY = (by + h + this.tailY) / 2
      els.push(svg.circle(midX, midY, 4, { fill: this.stroke }))
      els.push(svg.circle(this.tailX, this.tailY, 3, { fill: this.stroke }))
    } else if (this.style === 'shout') {
      const points = []
      const spikes = 12
      const outerR = Math.max(w, h) / 2 + 8
      const innerR = Math.max(w, h) / 2
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2
        const radius = i % 2 === 0 ? outerR : innerR
        points.push([this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius])
      }
      els.push(svg.polygon(points, { fill: this.fill, stroke: this.stroke, width: 2.5 }))
      const midX = (this.x + this.tailX) / 2
      const midY = (by + h + this.tailY) / 2
      els.push(svg.polygon([
        [this.x - 8, by + h],
        [midX, midY],
        [this.x + 8, by + h],
      ], { fill: this.fill, stroke: this.stroke, width: 2 }))
    } else {
      els.push(svg.rect(bx, by, w, h, { fill: this.fill, stroke: this.stroke, width: 2, rx: r, ry: r }))
      const g1x = this.x - 8
      const g1y = by + h
      const g2x = this.x + 8
      const g2y = by + h
      const tailTipX = this.tailX
      const tailTipY = this.tailY
      if (tailTipX < this.x) {
        els.push(svg.polygon([
          [g1x, g1y],
          [tailTipX, tailTipY],
          [g2x, g2y],
        ], { fill: this.fill, stroke: this.stroke, width: 2 }))
        els.push(svg.line(g1x, g1y, g2x, g2y, { stroke: this.fill, width: 3 }))
      } else {
        els.push(svg.polygon([
          [g1x, g1y],
          [tailTipX, tailTipY],
          [g2x, g2y],
        ], { fill: this.fill, stroke: this.stroke, width: 2 }))
        els.push(svg.line(g1x, g1y, g2x, g2y, { stroke: this.fill, width: 3 }))
      }
    }

    const textStartY = this.y - textBlockHeight / 2 + this.fontSize
    for (let i = 0; i < lines.length; i++) {
      els.push(svg.text(this.x, textStartY + i * lineHeight, lines[i], {
        size: this.fontSize,
        family: this.fontFamily,
        fill: this.stroke === 'white' ? 'white' : 'black',
        bold: this.bold,
      }))
    }

    return els
  }

  _wrapText(text, maxWidth) {
    const words = text.split(' ')
    const lines = []
    let current = ''
    for (const word of words) {
      const test = current ? current + ' ' + word : word
      if (test.length * this.fontSize * 0.55 > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines.length ? lines : ['']
  }
}

class Panel {
  constructor(opts = {}) {
    this.width = opts.width || 400
    this.height = opts.height || 300
    this.background = opts.background || 'white'
    this.border = opts.border !== undefined ? opts.border : true
    this.borderWidth = opts.borderWidth || 3
    this.borderColor = opts.borderColor || 'black'
    this.figures = opts.figures || []
    this.bubbles = opts.bubbles || []
    this.caption = opts.caption || null
    this.captionPosition = opts.captionPosition || 'top'
    this.effects = opts.effects || []
  }

  renderElements() {
    const els = []

    if (this.background && this.background !== 'white') {
      els.push(svg.rect(0, 0, this.width, this.height, { fill: this.background, stroke: 'none' }))
    }

    for (const fx of this.effects) {
      els.push(...this._renderEffect(fx))
    }

    for (const fig of this.figures) {
      els.push(fig.render())
    }

    for (const bubble of this.bubbles) {
      if (bubble.animation) {
        els.push(svg.group(bubble.render(), {
          id: bubble._animId,
          className: bubble._animId,
          style: bubble.animation.getInlineStyle(),
        }))
      } else {
        els.push(...bubble.render())
      }
    }

    if (this.caption) {
      els.push(...this._renderCaption())
    }

    return els
  }

  collectAnimations() {
    const animations = []
    for (const fig of this.figures) {
      if (fig.animation) animations.push(fig.animation)
    }
    for (const bubble of this.bubbles) {
      if (bubble.animation) animations.push(bubble.animation)
    }
    return animations
  }

  render() {
    const canvas = new svg.SvgCanvas(this.width, this.height)
    canvas.addDef(svg.clipPath('clip-panel', this.width, this.height))
    canvas.add(svg.group(this.renderElements(), { clipPath: 'clip-panel' }))

    const anims = this.collectAnimations()
    if (anims.length > 0) {
      canvas.addStyle(collectAnimationStyles(anims))
    }

    if (this.border) {
      canvas.add(svg.rect(0, 0, this.width, this.height, {
        fill: 'none', stroke: this.borderColor, width: this.borderWidth
      }))
    }

    return canvas.render()
  }

  _renderCaption() {
    const els = []
    const fontSize = 14
    const text = this.caption
    const y = this.captionPosition === 'top' ? fontSize + 8 : this.height - 8

    els.push(svg.rect(5, y - fontSize - 2, this.width - 10, fontSize + 10, {
      fill: 'rgba(255,255,255,0.85)', stroke: 'none', rx: 3, ry: 3
    }))
    els.push(svg.text(this.width / 2, y, text, {
      size: fontSize,
      family: 'Comic Sans MS, cursive',
      fill: 'black',
      anchor: 'middle',
    }))
    return els
  }

  _renderEffect(fx) {
    const els = []
    switch (fx.type) {
      case 'speed-lines':
        for (let i = 0; i < (fx.count || 8); i++) {
          const x1 = fx.x || 0
          const y1 = fx.y || 0
          const angle = (fx.startAngle || 0) + i * ((fx.spread || 90) / (fx.count || 8))
          const len = fx.length || 100
          els.push(svg.line(
            x1, y1,
            x1 + Math.cos(angle * Math.PI / 180) * len,
            y1 + Math.sin(angle * Math.PI / 180) * len,
            { stroke: fx.stroke || '#ccc', width: fx.width || 1 }
          ))
        }
        break
      case 'sweat':
        const sx = fx.x || 0
        const sy = fx.y || 0
        for (let i = 0; i < 3; i++) {
          els.push(svg.circle(sx + i * 8, sy + i * 5, 2 + i, { fill: '#88ccff', stroke: 'none' }))
        }
        break
      case 'anger':
        for (let i = 0; i < 3; i++) {
          const cx = (fx.x || 0) + i * 12 - 12
          els.push(svg.line(cx, (fx.y || 0) - 20, cx - 5, (fx.y || 0) - 8, { stroke: fx.stroke || 'red', width: 2 }))
          els.push(svg.line(cx - 5, (fx.y || 0) - 20, cx, (fx.y || 0) - 8, { stroke: fx.stroke || 'red', width: 2 }))
        }
        break
    }
    return els
  }
}

class ComicStrip {
  constructor(opts = {}) {
    this.title = opts.title || ''
    this.width = opts.width || 800
    this.layout = opts.layout || 'row'
    this.gap = opts.gap || 5
    this.panels = opts.panels || []
    this.borderColor = opts.borderColor || 'black'
    this.borderWidth = opts.borderWidth || 3
    this.titleFont = opts.titleFont || 'Comic Sans MS, cursive'
    this.titleSize = opts.titleSize || 28
  }

  addPanel(panel) {
    this.panels.push(panel)
    return this
  }

  render() {
    const totalGap = this.gap * Math.max(0, this.panels.length - 1)
    const titleHeight = this.title ? this.titleSize + 20 : 0

    if (this.layout === 'row') {
      const panelWidth = (this.width - totalGap) / this.panels.length
      let panelHeight = 0
      for (const p of this.panels) {
        p.width = p.width || Math.floor(panelWidth)
        panelHeight = Math.max(panelHeight, p.height || 300)
      }
      for (const p of this.panels) {
        p.height = panelHeight
      }

      const canvasHeight = panelHeight + titleHeight
      const canvas = new svg.SvgCanvas(this.width, canvasHeight)

      if (this.title) {
        canvas.add(svg.text(this.width / 2, titleHeight - 10, this.title, {
          size: this.titleSize, family: this.titleFont, bold: true
        }))
      }

      let currentX = 0
      const allAnimations = []
      for (let i = 0; i < this.panels.length; i++) {
        const p = this.panels[i]
        const clipId = `clip-panel-${i}`
        canvas.addDef(svg.clipPath(clipId, panelWidth, panelHeight))
        const elements = p.renderElements()
        canvas.add(svg.group(elements, { transform: svg.translate(currentX, titleHeight), clipPath: clipId }))
        canvas.add(svg.rect(currentX, titleHeight, panelWidth, panelHeight, {
          fill: 'none', stroke: this.borderColor, width: this.borderWidth
        }))
        allAnimations.push(...p.collectAnimations())
        currentX += panelWidth + this.gap
      }

      if (allAnimations.length > 0) {
        canvas.addStyle(collectAnimationStyles(allAnimations))
      }

      canvas.add(svg.rect(0, titleHeight, this.width, panelHeight, {
        fill: 'none', stroke: this.borderColor, width: this.borderWidth + 1
      }))

      return canvas.render()
    } else {
      let totalHeight = titleHeight
      const panelWidth = this.width
      for (const p of this.panels) {
        p.width = p.width || panelWidth
        p.height = p.height || 250
        totalHeight += p.height + this.gap
      }
      totalHeight -= this.gap

      const canvas = new svg.SvgCanvas(this.width, totalHeight)

      if (this.title) {
        canvas.add(svg.text(this.width / 2, titleHeight - 10, this.title, {
          size: this.titleSize, family: this.titleFont, bold: true
        }))
      }

      let currentY = titleHeight
      const allAnimations = []
      for (let i = 0; i < this.panels.length; i++) {
        const p = this.panels[i]
        const clipId = `clip-panel-${i}`
        canvas.addDef(svg.clipPath(clipId, panelWidth, p.height))
        const elements = p.renderElements()
        canvas.add(svg.group(elements, { transform: svg.translate(0, currentY), clipPath: clipId }))
        canvas.add(svg.rect(0, currentY, panelWidth, p.height, {
          fill: 'none', stroke: this.borderColor, width: this.borderWidth
        }))
        allAnimations.push(...p.collectAnimations())
        currentY += p.height + this.gap
      }

      if (allAnimations.length > 0) {
        canvas.addStyle(collectAnimationStyles(allAnimations))
      }

      canvas.add(svg.rect(0, titleHeight, this.width, totalHeight - titleHeight, {
        fill: 'none', stroke: this.borderColor, width: this.borderWidth + 1
      }))

      return canvas.render()
    }
  }
}

function bubble(text, opts = {}) {
  return new SpeechBubble(text, opts)
}

function panel(opts = {}) {
  return new Panel(opts)
}

function strip(opts = {}) {
  return new ComicStrip(opts)
}

  // ── Preset Poses ──
  const POSES = {
    standing:  new Pose({ leftArm: { shoulder: 15, elbow: 0 }, rightArm: { shoulder: -15, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),
    walking:  new Pose({ leftArm: { shoulder: 30, elbow: -20 }, rightArm: { shoulder: -30, elbow: -20 }, leftLeg: { hip: 25, knee: 0 }, rightLeg: { hip: -25, knee: 10 } }),
    running:   new Pose({ leftArm: { shoulder: 50, elbow: -30 }, rightArm: { shoulder: -50, elbow: -30 }, leftLeg: { hip: 40, knee: 20 }, rightLeg: { hip: -40, knee: 25 } }),
    waving:    new Pose({ leftArm: { shoulder: -150, elbow: -30 }, rightArm: { shoulder: -10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),
    pointing:  new Pose({ leftArm: { shoulder: -80, elbow: 0 }, rightArm: { shoulder: 10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),
    shrugging: new Pose({ leftArm: { shoulder: 70, elbow: -80 }, rightArm: { shoulder: -70, elbow: 80 }, bodyLean: 0 }),
    sitting:   new Pose({ leftLeg: { hip: 70, knee: -70 }, rightLeg: { hip: -70, knee: 70 }, leftArm: { shoulder: 10, elbow: 0 }, rightArm: { shoulder: -10, elbow: 0 } }),
    kicking:   new Pose({ leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -80, knee: 10 }, leftArm: { shoulder: 30, elbow: 0 }, rightArm: { shoulder: -50, elbow: 0 } }),
    defeated:  new Pose({ leftArm: { shoulder: 40, elbow: -40 }, rightArm: { shoulder: -40, elbow: 40 }, leftLeg: { hip: 15, knee: 15 }, rightLeg: { hip: -15, knee: 10 }, bodyLean: 10, headTilt: 20 }),
    armsUp:    new Pose({ leftArm: { shoulder: 150, elbow: 0 }, rightArm: { shoulder: -150, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 }, headTilt: -5 }),
    thinking2: new Pose({ leftArm: { shoulder: 70, elbow: -90 }, rightArm: { shoulder: -10, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 }, headTilt: -10 }),
    thumbsUp:  new Pose({ leftArm: { shoulder: 10, elbow: 0 }, rightArm: { shoulder: -160, elbow: 0 }, leftLeg: { hip: 5, knee: 0 }, rightLeg: { hip: -5, knee: 0 } }),
  };

  const ANIMATION_PRESETS = Object.keys(PRESETS);

  function animationFactory(type, opts) {
    opts = opts || {};
    if (typeof type === 'object' && type !== null) {
      opts = type;
      type = type.type || 'bounce';
    }
    return new Animation(type, opts);
  }

  // ── Export ──
  root.StickyFig = {
    figure: figure, pose: pose, POSES: POSES, EXPRESSIONS: EXPRESSIONS,
    StickFigure: StickFigure, Pose: Pose,
    bubble: bubble, panel: panel, strip: strip,
    SpeechBubble: SpeechBubble, Panel: Panel, ComicStrip: ComicStrip,
    SvgCanvas: SvgCanvas,
    Animation: Animation, animation: animationFactory,
    ANIMATION_PRESETS: ANIMATION_PRESETS,
    collectAnimationStyles: collectAnimationStyles,
  };

})(typeof window !== 'undefined' ? window : this);