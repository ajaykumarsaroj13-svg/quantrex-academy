import sys
from PIL import Image

img = Image.open('test_img_raw.png').convert('RGBA')
bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
out = Image.alpha_composite(bg, img).convert('L')
pixels = out.load()
width, height = out.size

min_x, min_y, max_x, max_y = width, height, 0, 0
count = 0
for y in range(height):
    for x in range(width):
        val = pixels[x, y]
        if 110 <= val <= 140:
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)
            count += 1

print(f"Raw Watermark bounding box: ({min_x}, {min_y}) to ({max_x}, {max_y})")
print(f"Total watermark pixels: {count}")
print(f"Image size: {width}x{height}")
