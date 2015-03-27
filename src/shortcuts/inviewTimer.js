(function () {
	'use strict'
	var Waypoint = window.Waypoint

	function InviewTimer(options) {
		this.options = Waypoint.Adapter.extend({}, InviewTimer.defaults, options)
		this.options.ratio = parseFloat(/(\d+)\%/.exec(this.options.offset)[1]) / 100
		this.waypoints = []
		this.timerVertical = null
		this.timerHorizontal = null
		this.timerVerticalDone = false
		this.timerHorizontalDone = false
		this.createWaypoints()
	}
	var noop = function () {}
	InviewTimer.prototype.createWaypoints = function () {
		var r = this.options.ratio
		var rI = 1 - r

		function addLog(command, direction, wp) {
			var d = new Date().toISOString().split('T')[1]
			d += ' ' + wp.options.debug
			d += ' ' + command
			d += ' ' + direction
			d += ' ' + wp.axis
			d += ' page=' + Waypoint.viewportHeight() + 'X' + Waypoint.viewportWidth()
			d += ' div=' + wp.adapter.outerHeight() + 'X' + wp.adapter.outerWidth()
			d += ' triggerPoint=' + wp.triggerPoint
			d += ' cur_offset=' + wp.options.offset.call(wp) + ' with ' + wp.options.o
			console.log(d)
		}

		function timeoutDone(c, o, wp, direction) {
			if (c.isHorizontal) {
				o.timerHorizontalDone = true
			} else {
				o.timerVerticalDone = true
			}
			addLog('done ', direction, wp)
			if (o.timerVerticalDone === true && o.timerHorizontalDone === true) {
				o.options.callback(o.options)
				if (o.options.destroyOnValid) {
					o.destroy()
				} else if (c.isHorizontal) {
					o.timerHorizontal = null
				} else {
					o.timerVertical = null
				}
			}
		}

		function entered(c, o, direction, wp) {
			var timer = c.isHorizontal ? o.timerHorizontal : o.timerVertical
			if (timer !== null) {
				return
			}
			addLog('enter', direction, wp)
			timer = window.setTimeout(function () {
				timeoutDone(c, o, wp, direction)
			}, o.options.timeout)
			if (c.isHorizontal) {
				o.timerHorizontal = timer
			} else {
				o.timerVertical = timer
			}
		}

		function exited(c, o, direction, wp) {
			var timer = c.isHorizontal ? o.timerHorizontal : o.timerVertical
			if (timer === null) {
				return
			}
			addLog('exit ', direction, wp)
			clearTimeout(timer)
			if (c.isHorizontal) {
				o.timerHorizontalDone = false
				o.timerHorizontal = null
			} else {
				o.timerVerticalDone = false
				o.timerVertical = null
			}
		}

		function topOffset() {
			//console.log(this)
			return Math.round(-this.adapter.outerHeight() * rI)
		}

		function bottomOffset() {
			return Math.round(Waypoint.viewportHeight() - this.adapter.outerHeight() * r)
		}

		function leftOffset() {
			return Math.round(-this.adapter.outerWidth() * rI)
		}

		function rightOffset() {
			return Math.round(Waypoint.viewportWidth() - this.adapter.outerWidth() * r)
		}
		var configs = {
			vertical: [{
				up: entered,
				down: exited,
				offset: topOffset,
				o: 'topOffset'
			}, {
				up: exited,
				down: entered,
				offset: bottomOffset,
				o: 'bottomOffset'
			}],
			horizontal: [{
				left: entered,
				right: exited,
				offset: leftOffset,
				o: 'leftOffset'
			}, {
				left: exited,
				right: entered,
				offset: rightOffset,
				o: 'rightOffset'
			}]
		}
		this.generateWaypoints(configs.vertical, false)
		this.generateWaypoints(configs.horizontal, true)
	}
	InviewTimer.prototype.generateWaypoints = function (configs, isHorizontal) {
		for (var i = 0; i < configs.length; i++) {
			this.createWaypoint(Waypoint.Adapter.extend({}, {
				isHorizontal: isHorizontal,
				debug: this.options.debug
			}, configs[i]))
		}
	}
	InviewTimer.prototype.createWaypoint = function (config) {
		this.waypoints.push(new Waypoint({
			element: this.options.element,
			handler: (function (config, o) {
				return function (direction) {
					config[direction](config, o, direction, this)
				}
			}(config, this)),
			offset: config.offset,
			horizontal: config.isHorizontal,
			debug: config.debug,
			o: config.o
		}))
	}
	InviewTimer.prototype.destroy = function () {
		for (var i = 0, end = this.waypoints.length; i < end; i++) {
			this.waypoints[i].destroy()
		}
		this.waypoints = []
	}
	InviewTimer.defaults = {
		timeout: 100,
		offset: '80%',
		callback: noop,
		destroyOnValid: true
	}
	Waypoint.InviewTimer = InviewTimer
}())