/**
 * bgzy.js vX.X.X
 *
 * Copyright(c) Nino Camdzic 2016
 * Released under MIT license.
 */
(function(name, window, document) {
	"use strict";

	var ns = window[name] = {},
		inst,

	App = function(images, conf) {
		var self = this,
			loadedImages = 0,
			ready = false,
			elements = [],
			tickerElement,
			activeElementIndex = 0,
			nextElementIndex = -1,
			backgroundIndex = 0,
			fx,
			timer,
			busy = false,
			cancel = false,
			backgroundElementTransitionEndCount = 0;

		// Default conf.
		this.conf = {
			zIndex: -9999,
			wrapperClass: "bgzy",
			backgroundClass: "bg",
			showTicker: false,
			tickerClass: "ticker",
			timeout: 3000,
			fx: "fadeOut",
			fxDuration: 1000
		};

		// Copy the specified configuration.
		for(var p in conf) {
			if(conf.hasOwnProperty(p)) {
				this.conf[p] = conf[p];
			}
		}

		function _startTicker() {
			tickerElement.style.opacity = "1.0";
			tickerElement.style.transitionDuration = self.conf.timeout + "ms";
			tickerElement.className = self.conf.tickerClass + " transition trigger";
		}

		function _stopTicker() {
			tickerElement.style.transitionDuration = "";
			tickerElement.className = self.conf.tickerClass;
			tickerElement.style.opacity = "0.0";
		}

		/**
		 * DOM initialization.
		 */
		function _initDom() {
			var wrap = document.createElement("div"),
				zIndex = self.conf.zIndex;

			wrap.className = self.conf.wrapperClass;
			wrap.addEventListener("transitionend", _transitionEnd, false);

			// Create the needed background image holding elements.
			for(var i = 0; i < 2; i++) {
				var element = document.createElement("div");
				element.className = self.conf.backgroundClass;
				element.style.zIndex = zIndex--;

				wrap.appendChild(element);
				elements.push(element);
			}

			// Create the progressbar.
			tickerElement = document.createElement("div");
			tickerElement.className = self.conf.tickerClass;

			if(!self.conf.showTicker) {
				tickerElement.style.display = "none";
			}

			wrap.appendChild(tickerElement);
			document.body.appendChild(wrap);
		}

		/**
		 * Preloads the specified images.
		 *
		 * @param images Array of image paths.
		 * @param cb Callback method which is called for every loaded image.
		 *		  Within the callback method this will reference the context
		 *		  which is set by the load event. This is usualy the element for
		 *		  which the event fired.
		 */
		function _loadImages(images, cb) {
			// Preload images before playing.
			for(var i = 0; i < images.length; i++) {
				var img = document.createElement("img"),
					url = images[i];

				img.addEventListener("load", cb);

				// If we are dealing with an array we retrieve the image url from
				// the first element of the array.
				if(url instanceof Array) {
					url = images[i][0];
				}

				img.src = url;
			}
		}

		/**
		 * Main initialization.
		 */
		function _init() {
			if(images instanceof Array && images.length > 0) {
				_initDom();
				_loadImages(images, function() {
					loadedImages++;

					// Set the first background image on the active element.
					if(loadedImages === 1) {
						elements[activeElementIndex].style.backgroundImage = "url('" + this.src + "')";
					}

					// Once every image is loaded start playing.
					if(images.length === loadedImages) {
						ready = true;
						self.play();
					}
				});
			} else {
				throw new Error("No images specified.");
			}
		}

		/**
		 * Show the next or previous background image.
		 *
		 * @param dir Direction. If not specified default is 1.
		 */
		function _play(dir) {
			busy = true;
			dir = dir ? dir : 1;
			nextElementIndex = activeElementIndex === elements.length - 1 ? 0 : activeElementIndex + 1;
			var currentBackgroundIndex = backgroundIndex;

			if(backgroundIndex === images.length - 1 && dir === 1) {
				backgroundIndex = 0;
			} else if(backgroundIndex === 0 && dir === -1) {
				backgroundIndex = images.length - 1;
			} else {
				backgroundIndex += dir;
			}

			var activeElement = elements[activeElementIndex],
				nextElement = elements[nextElementIndex],
				image = images[backgroundIndex],
				imageFx = self.conf.fx;

			// If we are dealing with an array we retrieve the image url from the
			// first array element and the used animation from the second.
			if(image instanceof Array) {
				image = images[backgroundIndex][0];
				imageFx = images[currentBackgroundIndex][1];
			}

			nextElement.style.backgroundImage = "url(" + image + ")";
			fx = self.fx[imageFx](activeElement, nextElement, self.conf);
			backgroundElementTransitionEndCount = 0;
			fx.run();
		}

		function _stop() {
			if(self.conf.showTicker) {
				_stopTicker();
			} else {
				window.clearTimeout(timer);
			}

			cancel = true;
		}

		function _transitionEnd(e) {
			var clazz = e.target.className;

			if(clazz === self.conf.backgroundClass) {
				// Make sure _postFx is only executed ONCE. We don't want it to executed
				// when for multiple properties transitions end.
				if(backgroundElementTransitionEndCount === 0) {
					_postFx();
				}

				backgroundElementTransitionEndCount++;
			} else if(self.conf.showTicker && clazz.indexOf(self.conf.tickerClass) > -1) {
				_stopTicker();
				_play();
			}
		}

		/**
		 * Reset elements. This method is executed after each background
		 * transition.
		 */
		function _postFx() {
			fx.cleanUp();

			elements[activeElementIndex].style.transition = "";
			elements[activeElementIndex].style.zIndex =  self.conf.zIndex - 1;
			elements[nextElementIndex].style.zIndex = self.conf.zIndex;
			activeElementIndex = nextElementIndex;
			busy = false;

			if(timer) {
				window.clearTimeout(timer);
			}

			// Prevent further playing if cancel is set to true.
			if(!cancel) {
				self.play();
			} else {
				cancel = false;
			}
		}

		/**
		 * Starts the slideshow.
		 */
		this.play = function() {
			if(ready && !busy) {
				if(self.conf.showTicker) {
					_startTicker();
				} else {
					timer = window.setTimeout(_play, self.conf.timeout);
				}
			}
		};

		/**
		 * Stop/pause the slideshow.
		 */
		this.stop = function() {
			if(ready) {
				_stop();
			}
		};

		/**
		 * Go to the next background image. This disables autoplay.
		 */
		this.next = function() {
			if(ready && !busy) {
				_stop();
				_play();
			}
		};

		/**
		 * Go to the previous background image. This disables autoplay.
		 */
		this.prev = function() {
			if(ready && !busy) {
				_stop();
				_play(-1);
			}
		};

		_init();
	};

	// Transitions.
	App.prototype.fx = ns.fx = {
		fadeOut: function(activeElement, nextElement, conf) {
			return {
				// Reset the background element to it's default state.
				// We do this by removing all changed properties.
				cleanUp: function() {
					activeElement.style.opacity = "";
				},

				run: function() {
					//Set the transition.
					activeElement.style.transition = "opacity " + conf.fxDuration + "ms";

					//Activate the transition.
					activeElement.style.opacity = "0.0";
				}
			};
		},
		slideUp: function(activeElement, nextElement, conf) {
			return {
				cleanUp: function() {
					activeElement.style.height = "";
				},

				run: function() {
					activeElement.style.transition = "height " + conf.fxDuration + "ms";
					activeElement.style.height = "0";
				}
			};
		},
		slideLeft: function(activeElement, nextElement, conf) {
			return {
				cleanUp: function() {
					activeElement.style.width = "";
				},

				run: function() {
					activeElement.style.transition = "width " + conf.fxDuration + "ms";
					activeElement.style.width = "0";
				}
			};
		},
		zoomFadeOut: function(activeElement, nextElement, conf) {
			return {
				cleanUp: function() {
					activeElement.style.transform = "";
					activeElement.style.opacity = "";
				},

				run: function() {
					activeElement.style.transition = "all " + conf.fxDuration + "ms, opacity " + conf.fxDuration + "ms";
					activeElement.style.transform = "scale(1.1)";
					activeElement.style.opacity = "0.0";
				}
			};
		}
	};

	/**
	 * Initializes the slideshow and starts playing.
	 *
	 * @param images Array of paths to images.
	 * @param conf Configuration object.
	 */
	ns.inst = function(images, conf) {
		if(!inst) {
			inst = new App(images, conf);
		}

		return inst;
	};
})("bgzy", window, document);
