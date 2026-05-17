(function(root) {
  'use strict';

  // ── SVG Primitives ──
  class SvgCanvas {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.elements = [];
      this.defs = [];
    }
    addDef(def) { this.defs.push(def); }
    add(el) { this.elements.push(el); }
    render() {
      const defsXml = this.defs.length > 0
        ? '\n  <defs>\n    ' + this.defs.join('\n    ') + '\n  </defs>'
        : '';
      return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + this.width + '" height="' + this.height + '" viewBox="0 0 ' + this.width + ' ' + this.height + '">\n' +
        defsXml + '\n' +
        '  <rect width="100%" height="100%" fill="white"/>\n' +
        '  ' + this.elements.join('\n  ') + '\n' +
        '</svg>';
    }
  }

  function svgLine(x1, y1, x2, y2, opts) {
    opts = opts || {};
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    var dasharray = opts.dash ? ' stroke-dasharray="' + opts.dash + '"' : '';
    var cap = opts.cap ? ' stroke-linecap="' + opts.cap + '"' : '';
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + width + '"' + dasharray + cap + '/>';
  }

  function svgCircle(cx, cy, r, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  }

  function svgFilledCircle(cx, cy, r, fill, opts) {
    opts = opts || {};
    var stroke = opts.stroke || fill;
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (opts.width || 1) + '"/>';
  }

  function svgEllipse(cx, cy, rx, ry, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  }

  function svgRect(x, y, w, h, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    var rx = opts.rx || 0;
    var ry = opts.ry || rx;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '" rx="' + rx + '" ry="' + ry + '"/>';
  }

  function svgPolygon(points, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    var pts = points.map(function(p) { return p.join(','); }).join(' ');
    return '<polygon points="' + pts + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  }

  function svgPolyline(points, opts) {
    opts = opts || {};
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    var fill = opts.fill || 'none';
    var cap = opts.cap ? ' stroke-linecap="' + opts.cap + '"' : '';
    var join = opts.join ? ' stroke-linejoin="' + opts.join + '"' : '';
    var pts = points.map(function(p) { return p.join(','); }).join(' ');
    return '<polyline points="' + pts + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"' + cap + join + '/>';
  }

  function svgPath(d, opts) {
    opts = opts || {};
    var fill = opts.fill || 'none';
    var stroke = opts.stroke || 'black';
    var width = opts.width || 2;
    return '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + width + '"/>';
  }

  function svgText(x, y, content, opts) {
    opts = opts || {};
    var size = opts.size || 14;
    var family = opts.family || 'Comic Sans MS, cursive';
    var fill = opts.fill || 'black';
    var anchor = opts.anchor || 'middle';
    var weight = opts.bold ? ' font-weight="bold"' : '';
    var style = opts.italic ? ' font-style="italic"' : '';
    var transform = opts.rotate ? ' transform="rotate(' + opts.rotate + ', ' + x + ', ' + y + ')"' : '';
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-family="' + family + '" fill="' + fill + '" text-anchor="' + anchor + '"' + weight + style + transform + '>' + content + '</text>';
  }

  function svgGroup(elements, opts) {
    opts = opts || {};
    var transform = opts.transform || '';
    var tfAttr = transform ? ' transform="' + transform + '"' : '';
    var clipAttr = opts.clipPath ? ' clip-path="url(#' + opts.clipPath + ')"' : '';
    var inner = elements.join('\n    ');
    return '<g' + tfAttr + clipAttr + '>\n    ' + inner + '\n  </g>';
  }

  function svgClipPath(id, width, height, opts) {
    opts = opts || {};
    var x = opts.x || 0;
    var y = opts.y || 0;
    return '<clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '"/></clipPath>';
  }

  function svgTranslate(tx, ty) { return 'translate(' + tx + ', ' + ty + ')'; }
  function svgScale(sx, sy) { return 'scale(' + sx + ', ' + (sy || sx) + ')'; }
  function svgRotate(angle, cx, cy) {
    if (cx !== undefined && cy !== undefined) return 'rotate(' + angle + ', ' + cx + ', ' + cy + ')';
    return 'rotate(' + angle + ')';
  }

  // ── Expressions ──
  var EXPRESSIONS = {
    neutral:   { eyes: 'normal', mouth: 'line' },
    happy:     { eyes: 'normal', mouth: 'smile' },
    sad:       { eyes: 'sad', mouth: 'frown' },
    angry:     { eyes: 'angry', mouth: 'frown', brows: 'angry' },
    surprised: { eyes: 'wide', mouth: 'o' },
    scared:    { eyes: 'wide', mouth: 'wavy', brows: 'worried' },
    laughing:  { eyes: 'closed', mouth: 'big-smile' },
    wink:      { eyes: 'wink', mouth: 'smile' },
    confused:  { eyes: 'normal', mouth: 'wavy', brows: 'confused' },
    thinking:  { eyes: 'look-up', mouth: 'line', brows: 'one-up' },
    dead:      { eyes: 'x-eyes', mouth: 'wavy' },
    dizzy:     { eyes: 'spiral', mouth: 'wavy' },
  };

  function rad(deg) { return deg * Math.PI / 180; }

  // ── Pose ──
  function Pose(opts) {
    opts = opts || {};
    this.headTilt = opts.headTilt || 0;
    this.leftArm = opts.leftArm || { shoulder: 0, elbow: 0 };
    this.rightArm = opts.rightArm || { shoulder: 0, elbow: 0 };
    this.leftLeg = opts.leftLeg || { hip: 5, knee: 0 };
    this.rightLeg = opts.rightLeg || { hip: -5, knee: 0 };
    this.bodyLean = opts.bodyLean || 0;
  }

  // ── StickFigure ──
  function StickFigure(name, opts) {
    opts = opts || {};
    this.name = name;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.scale = opts.scale || 1;
    this.stroke = opts.stroke || 'black';
    this.strokeWidth = opts.strokeWidth || 2.5;
    this.headRadius = (opts.headRadius || 18) * this.scale;
    this.bodyLength = (opts.bodyLength || 55) * this.scale;
    this.armLength = (opts.armLength || 35) * this.scale;
    this.legLength = (opts.legLength || 45) * this.scale;
    this.armLineWidth = (opts.armLineWidth || 2) * this.scale;
    this.expression = opts.expression || 'neutral';
    this.pose = opts.pose instanceof Pose ? opts.pose : new Pose(opts.pose || {});
    this.hair = opts.hair || null;
    this.hat = opts.hat || null;
    this.accessories = opts.accessories || [];
  }

  StickFigure.prototype.neckX = function() {
    return 0 + this.pose.bodyLean * this.scale * 0.3;
  };
  StickFigure.prototype.neckY = function() {
    return -this.legLength - this.bodyLength;
  };
  StickFigure.prototype.headX = function() {
    return this.neckX() + Math.sin(rad(this.pose.headTilt)) * this.headRadius * 0.8;
  };
  StickFigure.prototype.headY = function() {
    return this.neckY() - this.headRadius * 1.1;
  };
  StickFigure.prototype.hipY = function() {
    return -this.legLength;
  };
  StickFigure.prototype.shoulderY = function() {
    return this.neckY() + this.bodyLength * 0.15;
  };

  StickFigure.prototype.render = function() {
    var els = [];
    var tx = this.x;
    var ty = this.y + this.legLength + this.bodyLength;
    var headX = this.headX(), headY = this.headY();
    var neckX = this.neckX(), neckY = this.neckY();
    var hipY = this.hipY(), shoulderY = this.shoulderY();
    var shoulderOffsetX = this.headRadius * 0.6;
    var hipOffsetX = this.headRadius * 0.25;

    els = els.concat(this._renderLegs(neckX, hipY, hipOffsetX));
    els = els.concat(this._renderBody(neckX, neckY, hipY));
    els = els.concat(this._renderArms(neckX, shoulderY, shoulderOffsetX));
    els = els.concat(this._renderHead(headX, headY));
    if (this.hair) els = els.concat(this._renderHair(headX, headY));
    if (this.hat) els = els.concat(this._renderHat(headX, headY));

    return svgGroup(els, { transform: svgTranslate(tx, ty) });
  };

  StickFigure.prototype._renderHead = function(hx, hy) {
    var els = [];
    els.push(svgCircle(hx, hy, this.headRadius, { stroke: this.stroke, width: this.strokeWidth, fill: 'white' }));
    els = els.concat(this._renderExpression(hx, hy));
    return els;
  };

  StickFigure.prototype._renderExpression = function(hx, hy) {
    var els = [];
    var expr = EXPRESSIONS[this.expression] || EXPRESSIONS.neutral;
    var r = this.headRadius, s = this.scale;
    var eyeY = hy - r * 0.1, eyeSpacing = r * 0.35, mouthY = hy + r * 0.35;
    var opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' };

    if (expr.brows === 'angry') {
      els.push(svgLine(hx - eyeSpacing - r * 0.2, eyeY - r * 0.35, hx - eyeSpacing + r * 0.1, eyeY - r * 0.25, opts));
      els.push(svgLine(hx + eyeSpacing + r * 0.2, eyeY - r * 0.35, hx + eyeSpacing - r * 0.1, eyeY - r * 0.25, opts));
    } else if (expr.brows === 'worried') {
      els.push(svgLine(hx - eyeSpacing - r * 0.15, eyeY - r * 0.3, hx - eyeSpacing + r * 0.15, eyeY - r * 0.38, opts));
      els.push(svgLine(hx + eyeSpacing - r * 0.15, eyeY - r * 0.38, hx + eyeSpacing + r * 0.15, eyeY - r * 0.3, opts));
    } else if (expr.brows === 'confused') {
      els.push(svgLine(hx - eyeSpacing - r * 0.15, eyeY - r * 0.32, hx - eyeSpacing + r * 0.15, eyeY - r * 0.32, opts));
      els.push(svgLine(hx + eyeSpacing - r * 0.15, eyeY - r * 0.38, hx + eyeSpacing + r * 0.15, eyeY - r * 0.28, opts));
    } else if (expr.brows === 'one-up') {
      els.push(svgLine(hx - eyeSpacing - r * 0.15, eyeY - r * 0.38, hx - eyeSpacing + r * 0.15, eyeY - r * 0.3, opts));
    }

    switch (expr.eyes) {
      case 'normal':
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke));
        els.push(svgFilledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke));
        break;
      case 'wide':
        els.push(svgCircle(hx - eyeSpacing, eyeY, r * 0.13, { fill: 'white', stroke: this.stroke, width: 1.5 * s }));
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY, r * 0.07, this.stroke));
        els.push(svgCircle(hx + eyeSpacing, eyeY, r * 0.13, { fill: 'white', stroke: this.stroke, width: 1.5 * s }));
        els.push(svgFilledCircle(hx + eyeSpacing, eyeY, r * 0.07, this.stroke));
        break;
      case 'sad':
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke));
        els.push(svgFilledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke));
        els.push(svgLine(hx - eyeSpacing - r * 0.15, eyeY - r * 0.18, hx - eyeSpacing + r * 0.08, eyeY - r * 0.1, { stroke: this.stroke, width: 1.5 * s }));
        els.push(svgLine(hx + eyeSpacing + r * 0.15, eyeY - r * 0.18, hx + eyeSpacing - r * 0.08, eyeY - r * 0.1, { stroke: this.stroke, width: 1.5 * s }));
        break;
      case 'angry':
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke));
        els.push(svgFilledCircle(hx + eyeSpacing, eyeY, r * 0.08, this.stroke));
        break;
      case 'closed':
        els.push(svgLine(hx - eyeSpacing - r * 0.1, eyeY, hx - eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }));
        els.push(svgLine(hx + eyeSpacing - r * 0.1, eyeY, hx + eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }));
        break;
      case 'wink':
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY, r * 0.08, this.stroke));
        els.push(svgLine(hx + eyeSpacing - r * 0.1, eyeY, hx + eyeSpacing + r * 0.1, eyeY, { stroke: this.stroke, width: 1.5 * s }));
        break;
      case 'look-up':
        els.push(svgFilledCircle(hx - eyeSpacing, eyeY - r * 0.05, r * 0.08, this.stroke));
        els.push(svgFilledCircle(hx + eyeSpacing, eyeY - r * 0.05, r * 0.08, this.stroke));
        break;
      case 'x-eyes':
        var es = r * 0.1;
        els.push(svgLine(hx - eyeSpacing - es, eyeY - es, hx - eyeSpacing + es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }));
        els.push(svgLine(hx - eyeSpacing + es, eyeY - es, hx - eyeSpacing - es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }));
        els.push(svgLine(hx + eyeSpacing - es, eyeY - es, hx + eyeSpacing + es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }));
        els.push(svgLine(hx + eyeSpacing + es, eyeY - es, hx + eyeSpacing - es, eyeY + es, { stroke: this.stroke, width: 1.5 * s }));
        break;
      case 'spiral':
        els.push(svgPath('M ' + (hx - eyeSpacing) + ' ' + eyeY + ' a ' + (r * 0.05) + ' ' + (r * 0.05) + ' 0 0 1 ' + (r * 0.1) + ' 0 a ' + (r * 0.1) + ' ' + (r * 0.1) + ' 0 0 1 -' + (r * 0.2) + ' 0', { stroke: this.stroke, width: 1.2 * s, fill: 'none' }));
        els.push(svgPath('M ' + (hx + eyeSpacing) + ' ' + eyeY + ' a ' + (r * 0.05) + ' ' + (r * 0.05) + ' 0 0 1 ' + (r * 0.1) + ' 0 a ' + (r * 0.1) + ' ' + (r * 0.1) + ' 0 0 1 -' + (r * 0.2) + ' 0', { stroke: this.stroke, width: 1.2 * s, fill: 'none' }));
        break;
    }

    var mouthW = r * 0.35;
    switch (expr.mouth) {
      case 'line':
        els.push(svgLine(hx - mouthW, mouthY, hx + mouthW, mouthY, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), cap: 'round' }));
        break;
      case 'smile':
        els.push(svgPath('M ' + (hx - mouthW) + ' ' + (mouthY - r * 0.05) + ' Q ' + hx + ' ' + (mouthY + r * 0.25) + ' ' + (hx + mouthW) + ' ' + (mouthY - r * 0.05), { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }));
        break;
      case 'frown':
        els.push(svgPath('M ' + (hx - mouthW) + ' ' + (mouthY + r * 0.1) + ' Q ' + hx + ' ' + (mouthY - r * 0.2) + ' ' + (hx + mouthW) + ' ' + (mouthY + r * 0.1), { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }));
        break;
      case 'o':
        els.push(svgEllipse(hx, mouthY + r * 0.05, r * 0.12, r * 0.15, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'white' }));
        break;
      case 'big-smile':
        els.push(svgPath('M ' + (hx - mouthW * 1.2) + ' ' + (mouthY - r * 0.1) + ' Q ' + hx + ' ' + (mouthY + r * 0.45) + ' ' + (hx + mouthW * 1.2) + ' ' + (mouthY - r * 0.1), { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }));
        break;
      case 'wavy':
        els.push(svgPath('M ' + (hx - mouthW) + ' ' + mouthY + ' Q ' + (hx - mouthW * 0.5) + ' ' + (mouthY + r * 0.12) + ' ' + hx + ' ' + mouthY + ' Q ' + (hx + mouthW * 0.5) + ' ' + (mouthY - r * 0.12) + ' ' + (hx + mouthW) + ' ' + mouthY, { stroke: this.stroke, width: Math.max(1.5, 1.5 * s), fill: 'none' }));
        break;
    }
    return els;
  };

  StickFigure.prototype._renderBody = function(neckX, neckY, hipY) {
    return [svgLine(neckX, neckY, neckX, hipY, { stroke: this.stroke, width: this.strokeWidth, cap: 'round' })];
  };

  StickFigure.prototype._renderArms = function(neckX, shoulderY, shoulderOffset) {
    var els = [], armLen = this.armLength, halfArm = armLen * 0.5;
    var sides = ['left', 'right'];
    for (var i = 0; i < 2; i++) {
      var side = sides[i];
      var arm = side === 'left' ? this.pose.leftArm : this.pose.rightArm;
      var dir = side === 'left' ? -1 : 1;
      var shoulderAngle = rad(arm.shoulder);
      var shoulderX = neckX + shoulderOffset * dir;
      var elbowAngle = shoulderAngle + rad(arm.elbow);
      var elbowX = shoulderX + Math.sin(shoulderAngle) * halfArm * dir;
      var elbowY = shoulderY + Math.cos(shoulderAngle) * halfArm;
      var handX = elbowX + Math.sin(elbowAngle) * halfArm * dir;
      var handY = elbowY + Math.cos(elbowAngle) * halfArm;
      els.push(svgLine(shoulderX, shoulderY, elbowX, elbowY, { stroke: this.stroke, width: this.armLineWidth, cap: 'round' }));
      els.push(svgLine(elbowX, elbowY, handX, handY, { stroke: this.stroke, width: this.armLineWidth, cap: 'round' }));
    }
    return els;
  };

  StickFigure.prototype._renderLegs = function(neckX, hipY, hipOffset) {
    var els = [], legLen = this.legLength, halfLeg = legLen * 0.5;
    var sides = ['left', 'right'];
    for (var i = 0; i < 2; i++) {
      var side = sides[i];
      var leg = side === 'left' ? this.pose.leftLeg : this.pose.rightLeg;
      var dir = side === 'left' ? -1 : 1;
      var hipAngle = rad(leg.hip);
      var hipX = neckX + hipOffset * dir;
      var kneeX = hipX + Math.sin(hipAngle) * halfLeg * dir;
      var kneeY = hipY + Math.cos(hipAngle) * halfLeg;
      var kneeAngle = hipAngle + rad(leg.knee);
      var footX = kneeX + Math.sin(kneeAngle) * halfLeg * dir;
      var footY = kneeY + Math.cos(kneeAngle) * halfLeg;
      els.push(svgLine(hipX, hipY, kneeX, kneeY, { stroke: this.stroke, width: this.strokeWidth, cap: 'round' }));
      els.push(svgLine(kneeX, kneeY, footX, footY, { stroke: this.stroke, width: this.strokeWidth, cap: 'round' }));
    }
    return els;
  };

  StickFigure.prototype._renderHair = function(hx, hy) {
    var els = [], r = this.headRadius;
    var opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: 'none' };
    switch (this.hair) {
      case 'spiky':
        for (var i = -2; i <= 2; i++) {
          var angle = -90 + i * 25;
          var startX = hx + Math.cos(rad(angle)) * r, startY = hy + Math.sin(rad(angle)) * r;
          var endX = hx + Math.cos(rad(angle)) * (r + r * 0.4), endY = hy + Math.sin(rad(angle)) * (r + r * 0.4);
          els.push(svgLine(startX, startY, endX, endY, opts));
        }
        break;
      case 'long':
        els.push(svgPath('M ' + (hx - r) + ' ' + hy + ' C ' + (hx - r - r * 0.3) + ' ' + (hy + r * 0.8) + ' ' + (hx - r * 0.5) + ' ' + (hy + r * 1.5) + ' ' + (hx - r * 0.3) + ' ' + (hy + r * 1.8), opts));
        els.push(svgPath('M ' + (hx + r) + ' ' + hy + ' C ' + (hx + r + r * 0.3) + ' ' + (hy + r * 0.8) + ' ' + (hx + r * 0.5) + ' ' + (hy + r * 1.5) + ' ' + (hx + r * 0.3) + ' ' + (hy + r * 1.8), opts));
        break;
      case 'curly':
        for (var j = -3; j <= 3; j++) {
          var a = -90 + j * 20;
          var cx1 = hx + Math.cos(rad(a)) * (r + r * 0.2), cy1 = hy + Math.sin(rad(a)) * (r + r * 0.2);
          els.push(svgCircle(cx1, cy1, r * 0.12, { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: this.stroke }));
        }
        break;
      case 'mohawk':
        els.push(svgPath('M ' + (hx - r * 0.15) + ' ' + (hy - r) + ' L ' + hx + ' ' + (hy - r * 1.7) + ' L ' + (hx + r * 0.15) + ' ' + (hy - r), { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: this.stroke }));
        break;
    }
    return els;
  };

  StickFigure.prototype._renderHat = function(hx, hy) {
    var els = [], r = this.headRadius;
    var opts = { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: 'none' };
    switch (this.hat) {
      case 'tophat':
        els.push(svgRect(hx - r * 0.5, hy - r * 2, r, r * 0.9, { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: this.stroke }));
        els.push(svgLine(hx - r * 0.8, hy - r * 1.1, hx + r * 0.8, hy - r * 1.1, { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale) }));
        break;
      case 'cap':
        els.push(svgPath('M ' + (hx - r * 0.8) + ' ' + (hy - r * 0.5) + ' A ' + (r * 0.8) + ' ' + (r * 0.5) + ' 0 0 1 ' + (hx + r * 0.8) + ' ' + (hy - r * 0.5), { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: this.stroke }));
        els.push(svgLine(hx, hy - r * 0.5, hx + r * 0.9, hy - r * 0.2, { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale) }));
        break;
      case 'cowboy':
        els.push(svgPath('M ' + (hx - r * 1.4) + ' ' + (hy - r * 0.6) + ' L ' + (hx - r * 0.5) + ' ' + (hy - r * 0.8) + ' L ' + (hx - r * 0.5) + ' ' + (hy - r * 1.6) + ' L ' + (hx + r * 0.5) + ' ' + (hy - r * 1.6) + ' L ' + (hx + r * 0.5) + ' ' + (hy - r * 0.8) + ' L ' + (hx + r * 1.4) + ' ' + (hy - r * 0.6), { stroke: this.stroke, width: Math.max(1.5, 1.5 * this.scale), fill: this.stroke }));
        break;
    }
    return els;
  };

  // ── SpeechBubble ──
  function SpeechBubble(text, opts) {
    opts = opts || {};
    this.text = text;
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.tailX = opts.tailX || this.x;
    this.tailY = opts.tailY || this.y + 40;
    this.style = opts.style || 'speech';
    this.fill = opts.fill || 'white';
    this.stroke = opts.stroke || 'black';
    this.fontSize = opts.fontSize || 13;
    this.fontFamily = opts.fontFamily || 'Comic Sans MS, cursive';
    this.padding = opts.padding || 12;
    this.maxWidth = opts.maxWidth || 150;
    this.bold = opts.bold || false;
  }

  SpeechBubble.prototype.render = function() {
    var lines = this._wrapText(this.text, this.maxWidth);
    var lineHeight = this.fontSize * 1.3;
    var textBlockHeight = lines.length * lineHeight;
    var charWidth = this.fontSize * 0.55;
    var longestLine = Math.max.apply(null, lines.map(function(l) { return l.length; }));
    var textWidth = Math.min(longestLine * charWidth, this.maxWidth);
    var w = textWidth + this.padding * 2;
    var h = textBlockHeight + this.padding * 2;
    var bx = this.x - w / 2, by = this.y - h / 2;
    var r = 10;
    var els = [];

    if (this.style === 'thought') {
      els.push(svgRect(bx, by, w, h, { fill: this.fill, stroke: this.stroke, width: 2, rx: r, ry: r }));
      els.push(svgCircle((this.x + this.tailX) / 2, (by + h + this.tailY) / 2, 4, { fill: this.stroke }));
      els.push(svgCircle(this.tailX, this.tailY, 3, { fill: this.stroke }));
    } else if (this.style === 'shout') {
      var points = [], spikes = 12;
      var outerR = Math.max(w, h) / 2 + 8, innerR = Math.max(w, h) / 2;
      for (var i = 0; i < spikes * 2; i++) {
        var angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
        var radius = i % 2 === 0 ? outerR : innerR;
        points.push([this.x + Math.cos(angle) * radius, this.y + Math.sin(angle) * radius]);
      }
      els.push(svgPolygon(points, { fill: this.fill, stroke: this.stroke, width: 2.5 }));
      var midX = (this.x + this.tailX) / 2, midY = (by + h + this.tailY) / 2;
      els.push(svgPolygon([[this.x - 8, by + h], [midX, midY], [this.x + 8, by + h]], { fill: this.fill, stroke: this.stroke, width: 2 }));
    } else {
      els.push(svgRect(bx, by, w, h, { fill: this.fill, stroke: this.stroke, width: 2, rx: r, ry: r }));
      var g1x = this.x - 8, g1y = by + h, g2x = this.x + 8, g2y = by + h;
      els.push(svgPolygon([[g1x, g1y], [this.tailX, this.tailY], [g2x, g2y]], { fill: this.fill, stroke: this.stroke, width: 2 }));
      els.push(svgLine(g1x, g1y, g2x, g2y, { stroke: this.fill, width: 3 }));
    }

    var textStartY = this.y - textBlockHeight / 2 + this.fontSize;
    for (var j = 0; j < lines.length; j++) {
      els.push(svgText(this.x, textStartY + j * lineHeight, lines[j], {
        size: this.fontSize, family: this.fontFamily,
        fill: this.stroke === 'white' ? 'white' : 'black', bold: this.bold
      }));
    }
    return els;
  };

  SpeechBubble.prototype._wrapText = function(text, maxWidth) {
    var words = text.split(' '), lines = [], current = '';
    for (var k = 0; k < words.length; k++) {
      var test = current ? current + ' ' + words[k] : words[k];
      if (test.length * this.fontSize * 0.55 > maxWidth && current) {
        lines.push(current);
        current = words[k];
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  };

  // ── Panel ──
  function Panel(opts) {
    opts = opts || {};
    this.width = opts.width || 400;
    this.height = opts.height || 300;
    this.background = opts.background || 'white';
    this.border = opts.border !== undefined ? opts.border : true;
    this.borderWidth = opts.borderWidth || 3;
    this.borderColor = opts.borderColor || 'black';
    this.figures = opts.figures || [];
    this.bubbles = opts.bubbles || [];
    this.caption = opts.caption || null;
    this.captionPosition = opts.captionPosition || 'top';
    this.effects = opts.effects || [];
  }

  Panel.prototype.renderElements = function() {
    var els = [];
    if (this.background && this.background !== 'white') {
      els.push(svgRect(0, 0, this.width, this.height, { fill: this.background, stroke: 'none' }));
    }
    for (var i = 0; i < this.effects.length; i++) els = els.concat(this._renderEffect(this.effects[i]));
    for (var j = 0; j < this.figures.length; j++) els.push(this.figures[j].render());
    for (var k = 0; k < this.bubbles.length; k++) els = els.concat(this.bubbles[k].render());
    if (this.caption) els = els.concat(this._renderCaption());
    return els;
  };

  Panel.prototype.render = function() {
    var canvas = new SvgCanvas(this.width, this.height);
    canvas.addDef(svgClipPath('clip-panel', this.width, this.height));
    canvas.add(svgGroup(this.renderElements(), { clipPath: 'clip-panel' }));
    if (this.border) canvas.add(svgRect(0, 0, this.width, this.height, { fill: 'none', stroke: this.borderColor, width: this.borderWidth }));
    return canvas.render();
  };

  Panel.prototype._renderCaption = function() {
    var els = [], fontSize = 14;
    var y = this.captionPosition === 'top' ? fontSize + 8 : this.height - 8;
    els.push(svgRect(5, y - fontSize - 2, this.width - 10, fontSize + 10, { fill: 'rgba(255,255,255,0.85)', stroke: 'none', rx: 3, ry: 3 }));
    els.push(svgText(this.width / 2, y, this.caption, { size: fontSize, family: 'Comic Sans MS, cursive', fill: 'black', anchor: 'middle' }));
    return els;
  };

  Panel.prototype._renderEffect = function(fx) {
    var els = [];
    switch (fx.type) {
      case 'speed-lines':
        for (var i = 0; i < (fx.count || 8); i++) {
          var x1 = fx.x || 0, y1 = fx.y || 0;
          var angle = (fx.startAngle || 0) + i * ((fx.spread || 90) / (fx.count || 8));
          var len = fx.length || 100;
          els.push(svgLine(x1, y1, x1 + Math.cos(angle * Math.PI / 180) * len, y1 + Math.sin(angle * Math.PI / 180) * len, { stroke: fx.stroke || '#ccc', width: fx.width || 1 }));
        }
        break;
      case 'sweat':
        var sx = fx.x || 0, sy = fx.y || 0;
        for (var j = 0; j < 3; j++) els.push(svgCircle(sx + j * 8, sy + j * 5, 2 + j, { fill: '#88ccff', stroke: 'none' }));
        break;
      case 'anger':
        for (var m = 0; m < 3; m++) {
          var cx = (fx.x || 0) + m * 12 - 12;
          els.push(svgLine(cx, (fx.y || 0) - 20, cx - 5, (fx.y || 0) - 8, { stroke: fx.stroke || 'red', width: 2 }));
          els.push(svgLine(cx - 5, (fx.y || 0) - 20, cx, (fx.y || 0) - 8, { stroke: fx.stroke || 'red', width: 2 }));
        }
        break;
    }
    return els;
  };

  // ── ComicStrip ──
  function ComicStrip(opts) {
    opts = opts || {};
    this.title = opts.title || '';
    this.width = opts.width || 800;
    this.layout = opts.layout || 'row';
    this.gap = opts.gap || 5;
    this.panels = opts.panels || [];
    this.borderColor = opts.borderColor || 'black';
    this.borderWidth = opts.borderWidth || 3;
    this.titleFont = opts.titleFont || 'Comic Sans MS, cursive';
    this.titleSize = opts.titleSize || 28;
  }

  ComicStrip.prototype.addPanel = function(panel) {
    this.panels.push(panel);
    return this;
  };

  ComicStrip.prototype.render = function() {
    var totalGap = this.gap * Math.max(0, this.panels.length - 1);
    var titleHeight = this.title ? this.titleSize + 20 : 0;

    if (this.layout === 'row') {
      var panelWidth = (this.width - totalGap) / this.panels.length;
      var panelHeight = 0;
      for (var i = 0; i < this.panels.length; i++) {
        this.panels[i].width = this.panels[i].width || Math.floor(panelWidth);
        panelHeight = Math.max(panelHeight, this.panels[i].height || 300);
      }
      for (var j = 0; j < this.panels.length; j++) this.panels[j].height = panelHeight;

      var canvasHeight = panelHeight + titleHeight;
      var canvas = new SvgCanvas(this.width, canvasHeight);
      if (this.title) canvas.add(svgText(this.width / 2, titleHeight - 10, this.title, { size: this.titleSize, family: this.titleFont, bold: true }));

      var currentX = 0;
      for (var k = 0; k < this.panels.length; k++) {
        var p = this.panels[k];
        var clipId = 'clip-panel-' + k;
        canvas.addDef(svgClipPath(clipId, panelWidth, panelHeight));
        canvas.add(svgGroup(p.renderElements(), { transform: svgTranslate(currentX, titleHeight), clipPath: clipId }));
        canvas.add(svgRect(currentX, titleHeight, panelWidth, panelHeight, { fill: 'none', stroke: this.borderColor, width: this.borderWidth }));
        currentX += panelWidth + this.gap;
      }
      canvas.add(svgRect(0, titleHeight, this.width, panelHeight, { fill: 'none', stroke: this.borderColor, width: this.borderWidth + 1 }));
      return canvas.render();
    } else {
      var totalHeight = titleHeight;
      var panelWidth2 = this.width;
      for (var m = 0; m < this.panels.length; m++) {
        this.panels[m].width = this.panels[m].width || panelWidth2;
        this.panels[m].height = this.panels[m].height || 250;
        totalHeight += this.panels[m].height + this.gap;
      }
      totalHeight -= this.gap;
      var canvas2 = new SvgCanvas(this.width, totalHeight);
      if (this.title) canvas2.add(svgText(this.width / 2, titleHeight - 10, this.title, { size: this.titleSize, family: this.titleFont, bold: true }));
      var currentY = titleHeight;
      for (var n = 0; n < this.panels.length; n++) {
        var p2 = this.panels[n];
        var clipId2 = 'clip-panel-' + n;
        canvas2.addDef(svgClipPath(clipId2, panelWidth2, p2.height));
        canvas2.add(svgGroup(p2.renderElements(), { transform: svgTranslate(0, currentY), clipPath: clipId2 }));
        canvas2.add(svgRect(0, currentY, panelWidth2, p2.height, { fill: 'none', stroke: this.borderColor, width: this.borderWidth }));
        currentY += p2.height + this.gap;
      }
      canvas2.add(svgRect(0, titleHeight, this.width, totalHeight - titleHeight, { fill: 'none', stroke: this.borderColor, width: this.borderWidth + 1 }));
      return canvas2.render();
    }
  };

  // ── Preset Poses ──
  var POSES = {
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

  // ── Factory functions ──
  function figure(name, opts) { return new StickFigure(name, opts); }
  function pose(opts) { return new Pose(opts); }
  function bubble(text, opts) { return new SpeechBubble(text, opts); }
  function panel(opts) { return new Panel(opts); }
  function strip(opts) { return new ComicStrip(opts); }

  // ── Export ──
  root.StickyFig = {
    figure: figure, pose: pose, POSES: POSES, EXPRESSIONS: EXPRESSIONS,
    StickFigure: StickFigure, Pose: Pose,
    bubble: bubble, panel: panel, strip: strip,
    SpeechBubble: SpeechBubble, Panel: Panel, ComicStrip: ComicStrip,
    SvgCanvas: SvgCanvas
  };

})(typeof window !== 'undefined' ? window : this);