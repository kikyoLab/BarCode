'use strict'
var ruler = function (options) {
  this.api = this.builder()
  this.api.constructRulers.call(this, options)
}

ruler.prototype.builder = function () {
  var VERTICAL = 1,
    HORIZONTAL = 2,
    CUR_DELTA_X = 0,
    CUR_DELTA_Y = 0,
    CUR_SCALE = 1

  var options,
    rulerz = {},
    guides = [],
    theRulerDOM = document.createElement('div'),
    corners = [],
    defaultOptions = {
      rulerHeight: 15,
      fontFamily: 'arial',
      fontSize: '8px',
      strokeStyle: 'gray',
      sides: ['top', 'left'],
      cornerSides: ['TL'],
      lineWidth: 1,
      enableMouseTracking: true,
      enableToolTip: true
    }

  var rotateRuler = function (curRuler, angle) {
    var rotation = 'rotate(' + angle + 'deg)'
    var origin =
      ruler.prototype.utils.pixelize(
        Math.abs(parseInt(curRuler.canvas.style.left))
      ) + ' 100%'
    curRuler.canvas.style.webkitTransform = rotation
    curRuler.canvas.style.MozTransform = rotation
    curRuler.canvas.style.OTransform = rotation
    curRuler.canvas.style.msTransform = rotation
    curRuler.canvas.style.transform = rotation
    curRuler.canvas.style.webkitTransformOrigin = origin
    curRuler.canvas.style.MozTransformOrigin = origin
    curRuler.canvas.style.OTransformOrigin = origin
    curRuler.canvas.style.msTransformOrigin = origin
    curRuler.canvas.style.transformOrigin = origin
  }

  var positionRuler = function (curRuler, alignment) {
    curRuler.canvas.style.left = ruler.prototype.utils.pixelize(
      -(curRuler.canvas.width / 2 - curRuler.canvas.height)
    )
    switch (alignment) {
      case 'top':
        curRuler.orgPos = parseInt(curRuler.canvas.style.left)
        break
      case 'left':
        curRuler.canvas.style.top = ruler.prototype.utils.pixelize(
          -curRuler.canvas.height - 1
        )
        curRuler.orgPos = parseInt(curRuler.canvas.style.top)
        rotateRuler(curRuler, 90)
        break
    }
  }

  var attachListeners = function (container, curRul) {
    var mousedown = function (e) {
      constructGuide(curRul.dimension, e.clientX, e.clientY, e)
    }

    curRul.canvas.addEventListener('mousedown', mousedown)
    curRul.clearListeners = function () {
      curRul.canvas.removeEventListener('mousedown', mousedown)
    }
  }

  var constructGuide = function (dimension, x, y, e, isSet) {
    var guideIndex
    var moveCB = function (line, x, y) {
      var coor = line.dimension === VERTICAL ? x : y
      if (!line.assigned()) {
        if (coor > options.rulerHeight) {
          line.assigned(true)
        }
        return
      }

      if (coor < options.rulerHeight) {
        guides.some(function (guideLine, index) {
          if (guideLine.line === line) {
            guideIndex = index
            return true
          }
        })
        line.destroy()
        guides.splice(guideIndex, 1)
      }
    }
  }

  var constructRuler = function (container, alignment) {
    var canvas,
      dimension =
        alignment === 'left' || alignment === 'right' ? VERTICAL : HORIZONTAL,
      rulerStyle =
        dimension === VERTICAL ? 'rul_ruler_Vertical' : 'rul_ruler_Horizontal',
      element = document.createElement('canvas')

    ruler.prototype.utils.addClasss(element, [
      'rul_ruler',
      rulerStyle,
      'rul_align_' + alignment
    ])
    canvas = container.appendChild(element)
    rulerz[alignment] = ruler.prototype.rulerConstructor(
      canvas,
      options,
      dimension
    )
    rulerz[alignment].drawRuler(container.offsetWidth, options.rulerHeight)
    positionRuler(rulerz[alignment], alignment)
    attachListeners(container, rulerz[alignment])
  }

  var constructCorner = (function () {
    function cornerDraw (container, side) {
      var corner = document.createElement('div'),
        cornerStyle = 'rul_corner' + side.toUpperCase()

      corner.title = 'Clear Guide lines'
      ruler.prototype.utils.addClasss(corner, ['rul_corner', cornerStyle])
      corner.style.width = ruler.prototype.utils.pixelize(
        options.rulerHeight + 1
      )
      corner.style.height = ruler.prototype.utils.pixelize(options.rulerHeight)
      return container.appendChild(corner)
    }

    function mousedown (e) {
      e.stopPropagation()
      clearGuides()
    }

    return function (container, cornerSides) {
      cornerSides.forEach(function (side) {
        var corner = cornerDraw(container, side)
        corner.addEventListener('mousedown', mousedown)
        corner.destroy = function () {
          corner.removeEventListener('mousedown', mousedown)
          corner.parentNode.removeChild(corner)
        }

        corners.push(corner)
      })
    }
  })()

  var mouseup = function (e) {
    guides.forEach(function (guide) {
      guide.line.stopDrag()
    })
  }

  var constructRulers = function (curOptions) {
    theRulerDOM = ruler.prototype.utils.addClasss(theRulerDOM, 'rul_wrapper')
    options = ruler.prototype.utils.extend(defaultOptions, curOptions)
    theRulerDOM = options.container.appendChild(theRulerDOM)
    options.sides.forEach(function (side) {
      constructRuler(theRulerDOM, side)
    })
    constructCorner(theRulerDOM, options.cornerSides)
    options.container.addEventListener('mouseup', mouseup)
  }

  var forEachRuler = function (cb) {
    var index = 0
    for (var rul in rulerz) {
      if (rulerz.hasOwnProperty(rul)) {
        cb(rulerz[rul], index++)
      }
    }
  }

  var setPos = function (values) {
    var orgX = 0,
      orgY,
      deltaX = 0,
      deltaY = 0
    forEachRuler(function (curRul) {
      if (curRul.dimension === VERTICAL) {
        orgY = curRul.canvas.style.top
        curRul.canvas.style.top = ruler.prototype.utils.pixelize(
          curRul.orgPos + parseInt(values.y)
        )
        deltaY = parseInt(orgY) - parseInt(curRul.canvas.style.top)
      } else {
        orgX = curRul.canvas.style.left
        curRul.canvas.style.left = ruler.prototype.utils.pixelize(
          curRul.orgPos + parseInt(values.x)
        )
        deltaX = parseInt(orgX) - parseInt(curRul.canvas.style.left)
      }
    })
    guides.forEach(function (guide) {
      if (guide.dimension === HORIZONTAL) {
        guide.line.guideLine.style.top = ruler.prototype.utils.pixelize(
          parseInt(guide.line.guideLine.style.top) - deltaY
        )
        guide.line.curPosDelta(parseInt(values.y))
      } else {
        guide.line.guideLine.style.left = ruler.prototype.utils.pixelize(
          parseInt(guide.line.guideLine.style.left) - deltaX
        )
        guide.line.curPosDelta(parseInt(values.x))
      }
    })
    CUR_DELTA_X = parseInt(values.x)
    CUR_DELTA_Y = parseInt(values.y)
  }

  var setScale = function (newScale) {
    var curPos, orgDelta, curScaleFac
    forEachRuler(function (rul) {
      rul.context.clearRect(0, 0, rul.canvas.width, rul.canvas.height)
      rul.context.beginPath()
      rul.setScale(newScale)
      rul.context.stroke()
      CUR_SCALE = newScale
    })

    guides.forEach(function (guide) {
      if (guide.dimension === HORIZONTAL) {
        curPos = parseInt(guide.line.guideLine.style.top)
        orgDelta = options.rulerHeight + 1
        curScaleFac = parseFloat(newScale) / guide.line.curScale()
        guide.line.guideLine.style.top = ruler.prototype.utils.pixelize(
          (curPos - orgDelta - CUR_DELTA_Y) / curScaleFac +
            orgDelta +
            CUR_DELTA_Y
        )
        guide.line.curScale(newScale)
      } else {
        curPos = parseInt(guide.line.guideLine.style.left)
        orgDelta = options.rulerHeight + 1
        curScaleFac = parseFloat(newScale) / guide.line.curScale()
        guide.line.guideLine.style.left = ruler.prototype.utils.pixelize(
          (curPos - orgDelta - CUR_DELTA_X) / curScaleFac +
            orgDelta +
            CUR_DELTA_X
        )
        guide.line.curScale(newScale)
      }
    })
  }

  var clearGuides = function () {
    guides.forEach(function (guide) {
      guide.line.destroy()
    })
    guides = []
  }

  var toggleGuideVisibility = function (val) {
    var func = val ? 'show' : 'hide'
    guides.forEach(function (guide) {
      guide.line[func]()
    })
  }

  var toggleRulerVisibility = function (val) {
    var state = val ? 'block' : 'none'
    theRulerDOM.style.display = state
    var trackers = options.container.querySelectorAll('.rul_tracker')
    if (trackers.length > 0) {
      trackers[0].style.display = state
      trackers[1].style.display = state
    }
  }

  var getGuides = function () {
    return guides.map(function (guide) {
      return {
        posX: Math.round(
          (parseInt(guide.line.guideLine.style.left) -
            CUR_DELTA_X -
            options.rulerHeight) *
            CUR_SCALE
        ),
        posY: Math.round(
          (parseInt(guide.line.guideLine.style.top) -
            CUR_DELTA_Y -
            options.rulerHeight) *
            CUR_SCALE
        ),
        dimension: guide.dimension
      }
    })
  }

  var setGuides = function (_guides) {
    if (!_guides) {
      return
    }
    _guides.forEach(function (guide) {
      constructGuide(guide.dimension, guide.posX, guide.posY, null, true)
    })
  }

  var destroy = function () {
    clearGuides()
    forEachRuler(function (ruler) {
      ruler.destroy()
    })
    corners.forEach(function (corner) {
      corner.destroy()
    })
    options.container.removeEventListener('mouseup', mouseup)
    theRulerDOM.parentNode.removeChild(theRulerDOM)
  }

  return {
    VERTICAL: VERTICAL,
    HORIZONTAL: HORIZONTAL,
    setPos: setPos,
    setScale: setScale,
    clearGuides: clearGuides,
    getGuides: getGuides,
    setGuides: setGuides,
    constructRulers: constructRulers,
    toggleRulerVisibility: toggleRulerVisibility,
    toggleGuideVisibility: toggleGuideVisibility,
    destroy: destroy
  }
}

ruler.prototype.rulerConstructor = function (_canvas, options, rulDimension) {
  var canvas = _canvas,
    context = canvas.getContext('2d'),
    rulThickness = 0,
    rulLength = 0,
    rulScale = 1,
    dimension = rulDimension || 2,
    orgPos = 0,
    tracker = document.createElement('div')

  var getLength = function () {
    return rulLength
  }

  var getThickness = function () {
    return rulThickness
  }

  var getScale = function () {
    return rulScale
  }

  var setScale = function (newScale) {
    rulScale = parseFloat(newScale)
    drawPoints()
    return rulScale
  }

  var drawRuler = function (_rulerLength, _rulerThickness, _rulerScale) {
    rulLength = canvas.width = _rulerLength * 4
    rulThickness = canvas.height = _rulerThickness
    rulScale = _rulerScale || rulScale
    context.strokeStyle = options.strokeStyle
    context.font = options.fontSize + ' ' + options.fontFamily
    context.lineWidth = options.lineWidth
    context.beginPath()
    drawPoints()
    context.stroke()
  }

  var drawPoints = function () {
    var pointLength = 0,
      label = '',
      delta = 0,
      draw = false,
      lineLengthMax = 0,
      lineLengthMed = rulThickness / 2,
      lineLengthMin = rulThickness / 2

    for (var pos = 0; pos <= rulLength; pos += 1) {
      delta = rulLength / 2 - pos
      draw = false
      label = ''

      if (delta % 50 === 0) {
        pointLength = lineLengthMax
        label = Math.round(Math.abs(delta) * rulScale)
        draw = true
      } else if (delta % 25 === 0) {
        pointLength = lineLengthMed
        draw = true
      } else if (delta % 5 === 0) {
        pointLength = lineLengthMin
        draw = true
      }
      if (draw) {
        context.moveTo(pos + 0.5, rulThickness + 0.5)
        context.lineTo(pos + 0.5, pointLength + 0.5)
        context.fillText(label, pos + 1.5, rulThickness / 2 + 1)
      }
    }
  }

  var mousemove = function (e) {
    var posX = e.clientX
    var posY = e.clientY
    if (dimension === 2) {
      tracker.style.left = ruler.prototype.utils.pixelize(
        posX - parseInt(options.container.getBoundingClientRect().left)
      )
    } else {
      tracker.style.top = ruler.prototype.utils.pixelize(
        posY - parseInt(options.container.getBoundingClientRect().top)
      )
    }
  }

  var destroy = function () {
    options.container.removeEventListener('mousemove', mousemove)
    tracker.parentNode.removeChild(tracker)
    this.clearListeners && this.clearListeners()
  }

  var initTracker = function () {
    tracker = options.container.appendChild(tracker)
    ruler.prototype.utils.addClasss(tracker, 'rul_tracker')
    var height = ruler.prototype.utils.pixelize(options.rulerHeight)
    if (dimension === 2) {
      tracker.style.height = height
    } else {
      tracker.style.width = height
    }

    options.container.addEventListener('mousemove', mousemove)
  }

  if (options.enableMouseTracking) {
    initTracker()
  }

  return {
    getLength: getLength,
    getThickness: getThickness,
    getScale: getScale,
    setScale: setScale,
    dimension: dimension,
    orgPos: orgPos,
    canvas: canvas,
    context: context,
    drawRuler: drawRuler,
    drawPoints: drawPoints,
    destroy: destroy
  }
}

/**
 * Created by maor.frankel on 5/25/15.
 */
ruler.prototype.utils = {
  extend: function extend () {
    for (var i = 1; i < arguments.length; i++)
      for (var key in arguments[i])
        if (arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key]
    return arguments[0]
  },
  pixelize: function (val) {
    return val + 'px'
  },
  prependChild: function (container, element) {
    return container.insertBefore(element, container.firstChild)
  },
  addClasss: function (element, classNames) {
    if (!(classNames instanceof Array)) {
      classNames = [classNames]
    }

    classNames.forEach(function (name) {
      element.className += ' ' + name
    })

    return element
  },
  removeClasss: function (element, classNames) {
    var curCalsss = element.className
    if (!(classNames instanceof Array)) {
      classNames = [classNames]
    }

    classNames.forEach(function (name) {
      curCalsss = curCalsss.replace(name, '')
    })
    element.className = curCalsss
    return element
  }
}
