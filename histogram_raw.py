import sys
from PIL import Image

img = Image.open('test_img_raw.png').convert('RGBA')
bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
out = Image.alpha_composite(bg, img).convert('L')
pixels = out.load()
width, height = out.size

histogram = [0] * 256
for y in range(height):
    for x in range(width):
        histogram[pixels[x, y]] += 1

print("Histogram for RAW:")
for i in range(256):
    if histogram[i] > 0:
        print(f"Val {i}: {histogram[i]} pixels")
