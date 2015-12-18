# bgzy

Simple background changer.

## Dependencies

- jQuery v1.11.2

## Setup

1. Include jQuery.
2. Include bgzy.js.
3. Initiatie bgzy:
```javascript
<script>			
	$(function() {
		bgzy.inst({
			images: [
				"your_image_dir/bg1.jpg",
				"your_image_dir/bg2.jpg",
				"your_image_dir/bg3.jpg",
				"your_image_dir/bg4.jpg"
			],
			fx: "fadeOut"
		});
	});
</script>
```
## Todo
- Image preloading.
