;(function (e, t) {
  if (typeof define === 'function' && define.amd) {
    define([], t)
  } else if (typeof exports === 'object') {
    module.exports = t()
  } else {
    e.Dragify = t()
  }
})(this, function () {
  var e = function () {
    this.events = {}
  }
  e.prototype = {
    construct: e,
    on: function (e, t) {
      this._getEventInfo(e).push(t)
      return this
    },
    trigger: function (e) {
      var t = this._getEventInfo(e)
      var n = Array.prototype.slice.call(arguments, 1)
      t.forEach(function (e) {
        e.apply(e, n)
      })
      return this
    },
    _getEventInfo: function (e) {
      if (!this.events[e]) this.events[e] = []
      return this.events[e]
    },
    remove: function (e, t) {
      var n = this._getEventInfo(e)
      if (!t) {
        this.events[e] = []
      } else {
        n.splice(n.indexOf(t), 1)
      }
      return this
    }
  }
  function t (t) {
    this.$elem = t
    this.watcher = new e()
    this.init()
  }
  t.prototype = {
    constructor: t,
    init: function () {
      var e = this
      e.$elem.addEventListener(n[0], function (t) {
        var o = e._getEventInfo(t)
        var i = e.$elem.offsetParent
        var r = o.clientX - e.$elem.offsetLeft
        var s = o.clientY - e.$elem.offsetTop
        var c = i.offsetLeft || 0
        var a = i.offsetTop || 0
        var u = document.documentElement.clientWidth
        var f = document.documentElement.clientHeight
        var l = e.$elem.offsetWidth
        var m = e.$elem.offsetHeight
        var v = getComputedStyle(e.$elem)
        var h =
          v['transition'] || v['-webkit-transition'] || v['-moz-transition']
        var d = getComputedStyle(e.$elem).zIndex
        e.watcher.trigger('start', e.$elem)
        document.addEventListener(n[1], p)
        function p (t) {
          var n = e._getEventInfo(t)
          var o = n.clientX - r
          var i = n.clientY - s
          if (o + c < 0) o = o - (o + c)
          if (i + a < 0) i = i - (i + a)
          if (o + c + l > u) o = u - (c + l)
          if (i + a + m > f) i = f - (a + m)
          e.$elem.style.position = 'absolute'
          e.$elem.style['transition'] = e.$elem.style[
            '-webkit-transition'
          ] = e.$elem.style['-moz-transition'] = 'unset'
          e.$elem.style.left = o + 'px'
          e.$elem.style.top = i + 'px'
          e.$elem.style.zIndex = 19911125
          e.watcher.trigger('move', e.$elem)
        }
        document.addEventListener(n[2], g)
        function g (t) {
          document.removeEventListener(n[1], p)
          document.removeEventListener(n[2], g)
          e.$elem.style['transition'] = e.$elem.style[
            '-webkit-transition'
          ] = e.$elem.style['-moz-transition'] = h
          e.$elem.style.zIndex = d
          e.watcher.trigger('end', e.$elem)
        }
      })
    },
    on: function () {
      this.watcher.on.apply(this.watcher, arguments)
      return this.watcher
    },
    _getEventInfo: function (e) {
      return t.isTouch() ? e.targetTouches[0] : e
    }
  }
  t.isTouch = function (e) {
    return (
      'ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch) ||
      navigator.maxTouchPoints > 0 ||
      window.navigator.msMaxTouchPoints > 0
    )
  }
  var n = t.isTouch()
    ? ['touchstart', 'touchmove', 'touchend']
    : ['mousedown', 'mousemove', 'mouseup']
  return t
})
