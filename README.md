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
3. Initiatie bgzy
```javascript
<script>
	bgzy.inst([
		["img/bg1.jpg", "fadeOut"],
		["img/bg2.jpg", "zoomFadeOut"],
		["img/bg3.jpg", "slideLeft"]
	],{
		timeout: 3000,
		showTicker: false
	});
</script>
