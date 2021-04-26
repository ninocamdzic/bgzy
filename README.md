# bgzy.js
Elegant background slideshow.
Check out a working example at: https://ninocamdzic.github.io/bgzy

## 1. Features
- Uses CSS3 transitions.
- Set for each background a different transition.
- No third party libraries required.
- API for controlling the slideshow.

## 2. Browser support
All modern browsers and IE11+ are supported.

## 3. Setup
1. Include bgzy.css.
2. Include bgzy.js.
3. Initiatie bgzy.

### Simple initiation
```javascript
bgzy.inst([
	"img/bg1.jpg",
	"img/bg2.jpg",
	"img/bg3.jpg",
]);
```
### Different transitions
```javascript
bgzy.inst([
	["img/bg1.jpg", "fadeOut"],
	["img/bg2.jpg", "zoomFadeOut"],
	["img/bg3.jpg", "slideLeft"]
]);
```
## 4. Options
|Option|Default|Description|
|---|---|---|
|autoplay|true|Whether to start the slideshow when the page loads.
|timeout|3000|The time(miliseconds) to wait before switching to a new background.|
|fx|fadeOut|Transition to use when switching backgrounds. Possible values are: **fadeOut, slideUp, slideLeft and fadeZoom**.|
|fxDuration|500|Duration(miliseconds) of a transition.|
|showTicker|false|Displays the ticker at the top of the page. Either **true** or **false**.|
|backgroundClass|bg|CSS class name of the background elements. Do not change if you don't know what you are doing.|
|wrapperClass|bgzy|CSS class name of the wrapping element which contains the backgrounds. Do not change if you don't know what you are doing.|
|zIndex|-9999|Makes sure the background elements are rendered behind all elements on a page. Only edit if backgrounds appear above other elements within your page.|

### Changing options ###
```javascript
bgzy.init([
	"img/bg1.jpg",
	"img/bg2.jpg",
	"img/bg3.jpg",
],{
	timeout: 5000,
	showTicker: true
});
```
## 5. API
|Method|Returns|Description|
|---|---|---|
|play|-|Starts the slideshow. This enables autoplay.|
|stop|-|Stops the slideshow.|
|next|-|Go to the next background image. This disables autoplay.|
|prev|-|Go to the previous background image. This disables autoplay.|

### Accessing the methods. ###
```javascript
// Make sure you already have initialized bgzy.js before calling
// any API methods.
bgzy.next();
```
### Todo
- Implement callbacks for stop, next and prev.
