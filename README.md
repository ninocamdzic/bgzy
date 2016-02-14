# bgzy.js

Elegant background slideshow.

## Features

- Uses CSS3 transitions.
- Set for each background a different transition.
- No third party libraries required.
- API for controlling the slideshow.

## Browser support

All modern browsers and IE10+ are supported.

## Setup

1. Include bgzy.css
2. Include bgzy.js
3. Initiatie bgzy.

### Simple initiation
```javascript
<script>
	document.addEventListener("DOMContentLoaded", function(event) {
		bgzy.inst([
			"img/bg1.jpg",
			"img/bg2.jpg",
			"img/bg3.jpg",
		]);
	};
</script>
```

### Different transitions
```javascript
<script>
	document.addEventListener("DOMContentLoaded", function(event) {
		bgzy.inst([
			["img/bg1.jpg", "fadeOut"],
			["img/bg2.jpg", "zoomFadeOut"],
			["img/bg3.jpg", "slideLeft"]
		]);
	};
</script>
```
## Options
|Option|Default|Description|
|---|---|---|
|timeout|3000|The time(miliseconds) to wait before switching to a new background.|
|fx|fadeOut|Transition to use when switching backgrounds. Possible values are: **fadeOut, slideUp, slideLeft and fadeZoom**.|
|fxDuration|500|Duration(miliseconds) of a transition.|
|showTicker|false|Displays the ticker at the top of the page by default. Either **true** or **false**.|
|backgroundClass|bg|CSS class name of the background elements. Do not change if you don't know what you are doing.|
|wrapperClass|bgzy|CSS class name of the wrapping element which contains the backgrounds. Do not change if you don't know what you are doing.|
|zIndex|-9999|Makes sure the background elements are rendered behind all elements on a page. Only edit if backgrounds appear above other elements within your page.|
