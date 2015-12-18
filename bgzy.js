/**
 * bgzy v1.0.0a
 * Simple background changer.
 *
 * Copyright(c) Nino Camdzic 2015
 */
(function(name, $, window) {
	"use strict";

	var ns = window[name] = window[name] || {},
		inst,
		fx = {
			fadeOut: function(activeElement, nextElement, fn) {
				var self = this;

				nextElement.css("opacity", 1.0);
				activeElement.animate({opacity: 0.0}, {
					duration: self.options.fxDuration,
					always: fn
				});
			},
			slideUp: function(activeElement, nextElement, fn) {
				var self = this;

				nextElement.css("opacity", 1.0);
				nextElement.css("height", "100%");
				activeElement.animate({height: 0}, {
					duration: self.options.fxDuration,
					always: fn
				});
			},
			slideLeft: function(activeElement, nextElement, fn) {
				var self = this;

				nextElement.css("opacity", 1.0);
				nextElement.css("width", "100%");
				activeElement.animate({width: 0}, {
					duration: self.options.fxDuration,
					always: fn
				});
			}
		};

	// Expose the fx object so it can be extended.
	ns.fx = fx;

	var App = function(options) {
		var self = this,
			ready = false,
			elements = [],
			timer,
			activeElementIndex = 0,
			backgroundIndex = 0,
			busy = false;

		// Default options.
		this.options = $.extend({
			zIndex: -9999,
			wrapperClass: "bgzy",
			backgroundClass: "bge",
			timeout: 3000,
			fx: "fadeOut",
			fxDuration: 500
		}, options);

		this.play = function() {
			if(ready && !busy) {
				busy = true;

				if(timer) {
					window.clearTimeout(timer);
					timer = null;
				}

				var nextElementIndex = activeElementIndex === elements.length - 1 ? 0 : activeElementIndex + 1,
					activeElement = elements[activeElementIndex],
					nextElement = elements[nextElementIndex];
			
				nextElement.css("background-image", "url(" + this.options.images[backgroundIndex] + ")");

				// The fx functions are executed in the context of the App object.
				// This enables us to retrieve options with the fx functionslike so: 
				// this.options.option.
				var fxfn = fx[this.options.fx].bind(this);

				fxfn(activeElement, nextElement, function() {
					activeElement.css("z-index", self.options.zIndex - 1);
					nextElement.css("z-index", self.options.zIndex);
					
					activeElementIndex = nextElementIndex;
					backgroundIndex = (backgroundIndex === self.options.images.length - 1) ? 0 : backgroundIndex + 1;
					busy = false;

					timer = window.setTimeout(function() {
						self.play();
					}, self.options.timeout);
				});
			}
		};

		this.init = function() {
			if($.type(this.options.images) === "array" && this.options.images.length > 0) {
				var wrap = $("<div>"),
					zIndex = this.options.zIndex;

				wrap.attr("class", this.options.wrapperClass);

				// Create the needed background holding elements.
				for(var i = 0; i < 2; i++) {
					var element = $("<div>");						
				
					element.addClass(this.options.backgroundClass);
					element.css("z-index", zIndex--);
					
					// Only the first element should be visible.
					if(i > 0) {
						element.css("opacity", 0.0);
					}
					
					wrap.append(element);
					elements.push(element);
				}

				$("body").append(wrap);

				ready = true;

				this.play();
			}
		};
	};

	ns.inst = function(options) {
		if(!inst) {
			inst = new App(options);
			inst.init();
		}
	};
}("bgzy", jQuery, window));
