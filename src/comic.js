const svg = require('./svg')

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
      els.push(...bubble.render())
    }

    if (this.caption) {
      els.push(...this._renderCaption())
    }

    return els
  }

  render() {
    const canvas = new svg.SvgCanvas(this.width, this.height)
    canvas.addDef(svg.clipPath('clip-panel', this.width, this.height))
    canvas.add(svg.group(this.renderElements(), { clipPath: 'clip-panel' }))

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
      for (let i = 0; i < this.panels.length; i++) {
        const p = this.panels[i]
        const clipId = `clip-panel-${i}`
        canvas.addDef(svg.clipPath(clipId, panelWidth, panelHeight))
        const elements = p.renderElements()
        canvas.add(svg.group(elements, { transform: svg.translate(currentX, titleHeight), clipPath: clipId }))
        canvas.add(svg.rect(currentX, titleHeight, panelWidth, panelHeight, {
          fill: 'none', stroke: this.borderColor, width: this.borderWidth
        }))
        currentX += panelWidth + this.gap
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
      for (let i = 0; i < this.panels.length; i++) {
        const p = this.panels[i]
        const clipId = `clip-panel-${i}`
        canvas.addDef(svg.clipPath(clipId, panelWidth, p.height))
        const elements = p.renderElements()
        canvas.add(svg.group(elements, { transform: svg.translate(0, currentY), clipPath: clipId }))
        canvas.add(svg.rect(0, currentY, panelWidth, p.height, {
          fill: 'none', stroke: this.borderColor, width: this.borderWidth
        }))
        currentY += p.height + this.gap
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

module.exports = {
  SpeechBubble,
  Panel,
  ComicStrip,
  bubble,
  panel,
  strip,
}