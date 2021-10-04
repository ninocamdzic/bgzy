/*
 	bgzy.js v0.1.3
	
	The MIT License (MIT)

	Copyright (c) 2015-2021 Nino Camdzic

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
 */
(function(window, document) {
	"use strict";

	var NOT_INITIALIZED_ERR = "Bgzy.js must be initialized before calling any API methods.";

	var ns = window.bgzy = {};
	var images = null,
		loadedImages = 0,
		ready = false,
		elements = [],
		tickerElement,
		activeElementIndex = 0,
		nextElementIndex = -1,
		backgroundImageIndex = 0,
		fx,
		timer,
		busy = false,
		cancel = false,
		backgroundElementTransitionEndCount = 0;

	// Default conf.
	ns.conf = {
		zIndex: -9999,
		wrapperClass: "bgzy",
		backgroundClass: "bg",
		showTicker: false,
		tickerClass: "ticker",
		autoplay: true,
		timeout: 3000,
		fx: "fadeOut",
		fxDuration: 1000
	};

	function getImageUrl(image) {
		if(image instanceof Array) {
			return image[0];
		}

		return image;
	}

	function getImageFx(image) {
		if(image instanceof Array) {
			return image[1];
		}

		return ns.conf.fx;
	}

	function startTicker() {
		tickerElement.style.opacity = "1.0";
		tickerElement.style.transitionDuration = ns.conf.timeout + "ms";
		tickerElement.className = ns.conf.tickerClass + " transition trigger";
	}

	function stopTicker() {
		tickerElement.style.transitionDuration = "";
		tickerElement.className = ns.conf.tickerClass;
		tickerElement.style.opacity = "0.0";
	}

	/**
	 * Copy the specified configuration.
	 * 
	 * @param conf User specified configuration.
	 */
	function initConf(conf) {
		for(var p in conf) {
			if(conf.hasOwnProperty(p)) {
				ns.conf[p] = conf[p];
			}
		}
	}

	/**
	 * Initializes the DOM.
	 */
	function initElements() {
		var wrap = document.createElement("div"),
			zIndex = ns.conf.zIndex;

		wrap.className = ns.conf.wrapperClass;
		wrap.addEventListener("transitionend", transitionEnd, false);

		// Create the background image container elements.
		for(var i = 0; i < 2; i++) {
			var element = document.createElement("div");
			element.className = ns.conf.backgroundClass;
			element.style.zIndex = zIndex--;

			wrap.appendChild(element);
			elements.push(element);
		}

		// Create the ticker element.
		if(ns.conf.showTicker) {
			tickerElement = document.createElement("div");
			tickerElement.className = ns.conf.tickerClass;
			wrap.appendChild(tickerElement);
		}

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
	function loadImages(images, cb) {
		for(var i = 0; i < images.length; i++) {
			var img = document.createElement("img"),
				url = getImageUrl(images[i]);

			img.addEventListener("load", cb);
			img.src = url;
		}
	}

	/**
	 * Main initialization.
	 */
	function init(conf) {
		if(images instanceof Array && images.length > 0) {
			initConf(conf);
			initElements();
			loadImages(images, function() {
				loadedImages++;

				// Set the first background image on the active element.
				if(loadedImages === 1) {
					elements[activeElementIndex].style.backgroundImage = "url('" + this.src + "')";

					// Determine the background index of the loaded image.
					for(var i = 0; i < images.length; i++) {
						var imageUrl = getImageUrl(images[i]);

						if(this.src.indexOf(imageUrl) > -1) {
							backgroundImageIndex = i;
							break;
						}
					}
				}

				// Once every image is loaded, start playing.
				if(images.length === loadedImages) {
					ready = true;

					if(ns.conf.autoplay === true) {
						// Do not use DOMContentReady here. Sometimes it doesn't work in Firefox.
						window.addEventListener("load", function(e) {
							ns.play();
						});
					}
				}
			});
		} else {
			throw new Error("No images specified.");
		}
	}

	/**
	 * Show the next or previous background image.
	 *
	 * @param dir Direction. If not specified defaults to 1.
	 */
	function play(dir) {
		busy = true;
		dir = dir ? dir : 1;
		nextElementIndex = activeElementIndex === elements.length - 1 ? 0 : activeElementIndex + 1;
		var currentbackgroundImageIndex = backgroundImageIndex;

		if(backgroundImageIndex === images.length - 1 && dir === 1) {
			backgroundImageIndex = 0;
		} else if(backgroundImageIndex === 0 && dir === -1) {
			backgroundImageIndex = images.length - 1;
		} else {
			backgroundImageIndex += dir;
		}

		var activeElement = elements[activeElementIndex],
			nextElement = elements[nextElementIndex],
			imageUrl = getImageUrl(images[backgroundImageIndex]),
			imageFx = getImageFx(images[currentbackgroundImageIndex]);

		nextElement.style.backgroundImage = "url(" + imageUrl + ")";
		fx = ns.fx[imageFx](activeElement, nextElement, ns.conf);
		backgroundElementTransitionEndCount = 0;
		fx.run();
	}

	function stop() {
		if(ns.conf.showTicker) {
			stopTicker();
		} else {
			window.clearTimeout(timer);
		}

		cancel = true;
	}

	/**
	 * Transitionend handler.
	 * 
	 * @param e Event 
	 */
	function transitionEnd(e) {
		var clazz = e.target.className;

		// Background transition.
		if(clazz === ns.conf.backgroundClass) {
			// Make sure postFx is only executed ONCE. We don't want it to execute
			// when for multiple properties transitions end.
			if(backgroundElementTransitionEndCount === 0) {
				postFx();
			}

			backgroundElementTransitionEndCount++;

		// Ticker transition.
		} else if(ns.conf.showTicker && clazz.indexOf(ns.conf.tickerClass) > -1) {
			stopTicker();
			play();
		}
	}

	/**
	 * Reset element properties. This method is executed after each background transition.
	 */
	function postFx() {
		fx.cleanUp();

		elements[activeElementIndex].style.transition = "";
		elements[activeElementIndex].style.zIndex =  ns.conf.zIndex - 1;
		elements[nextElementIndex].style.zIndex = ns.conf.zIndex;
		activeElementIndex = nextElementIndex;
		busy = false;

		if(timer) {
			window.clearTimeout(timer);
		}

		// Prevent further playing if cancel is set to true.
		if(!cancel) {
			ns.play();
		} else {
			cancel = false;
		}
	}

	/**
	 * Starts the slideshow.
	 * 
	 * @throws Error if bgzy.js is not initialized.
	 */
	 ns.play = function() {
		if(ready) {
			if(!busy) {
				if(ns.conf.showTicker) {
					startTicker();
				} else {
					timer = window.setTimeout(play, ns.conf.timeout);
				}
			}
		} else {
			throw new Error(NOT_INITIALIZED_ERR);
		}
	};

	/**
	 * Stop/pause the slideshow.
	 * 
	 * @throws Error if bgzy.js is not initialized.
	 */
	ns.stop = function() {
		if(ready) {
			stop();
		} else {
			throw new Error(NOT_INITIALIZED_ERR);
		}
	};

	/**
	 * Go to the next background image. This disables autoplay.
	 * 
	 * @throws Error if bgzy.js is not initialized.
	 */
	ns.next = function() {
		if(ready) {
			if(!busy) {
				stop();
				play();
			}
		} else {
			throw new Error(NOT_INITIALIZED_ERR);
		}
	};

	/**
	 * Go to the previous background image. This disables autoplay.
	 * 
	 * @throws Error if bgzy.js is not initialized.
	 */
	ns.prev = function() {
		if(ready) {
			if(!busy) {
				stop();
				play(-1);
			} 
		} else {
			throw new Error(NOT_INITIALIZED_ERR);
		}
	};

	/**
	 * Initializes the slideshow and starts playing.
	 *
	 * @param imgs Array containing paths to images. There are two variations which can be used here:
	 * 			   - Variation 1: ["path1", "path2", "path3"]
	 * 			   - Variation 2: [["path1", "transition1"],
	 * 							   ["path2", "transition2"],
	 * 							   ["path3", "transition3"]]
	 * 			   The second variation allows you to specify the transition which is to be used for the
	 * 			   specified image.
	 * 
	 * @param conf Configuration object.
	 */
	ns.init = function(imgs, conf) {
		images = imgs;

		init(conf);
	};

	// Transitions.
	ns.fx = {
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
})(window, document);
