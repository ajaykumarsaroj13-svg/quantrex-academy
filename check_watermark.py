import urllib.request
from PIL import Image
import io

url = 'https://app-content.cdn.examgoal.net/fly/@width/image/jaoe38c1mm2elfwx/ecdedce6-805f-4a8f-9506-eb4f3438a774/cf53b410-127c-11f1-9713-0b51d8aa583a/file-jaoe38c1mm2elfwy.png?format=png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    img_data = response.read()

img = Image.open(io.BytesIO(img_data)).convert('RGB')
pixels = img.load()
width, height = img.size

# Find the darkest non-black pixels (which are usually watermarks)
# Black text is usually < 50. White is > 240. Watermark is usually 150-220.
watermark_pixels = []
for y in range(height):
    for x in range(width):
        r, g, b = pixels[x, y]
        avg = (r + g + b) / 3
        if 80 < avg < 230:
            watermark_pixels.append(avg)

if watermark_pixels:
    print(f"Average watermark lightness: {sum(watermark_pixels)/len(watermark_pixels)}")
    print(f"Darkest watermark pixel: {min(watermark_pixels)}")
else:
    print("No watermark pixels found in the mid-range.")
