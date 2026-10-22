"""Optimize the six official Seismique Mini Golf + Arcade page photographs."""
from pathlib import Path
from urllib.request import urlopen, Request
from io import BytesIO
from PIL import Image, ImageOps

assets = {
    'golf-world': '51d719_2bc21ddebee14f94a57bb5c3a5128248~mv2.jpg',
    'golf-course': '51d719_23c64ced40de4cfba883767a95b546f4~mv2.jpg',
    'golf-players': '51d719_fe8914fd82d84bc39802a447a6c3b758~mv2.jpeg',
    'golf-alien': '51d719_f284a88bc14148eba59afe4cf1da9ba2~mv2.jpg',
    'arcade-play': '51d719_5afddf23a7b84578a1b55acfdfcd2843~mv2.jpg',
    'arcade-friends': '51d719_29f979174c664c0fbe0dd35a3ef3d834~mv2.jpg',
}
folder = Path('dist/assets/mini-golf')
folder.mkdir(parents=True, exist_ok=True)
for name, asset in assets.items():
    url = 'https://static.wixstatic.com/media/' + asset
    with urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=45) as response:
        image = ImageOps.exif_transpose(Image.open(BytesIO(response.read()))).convert('RGB')
    original = image.size
    for size in (720, 1600):
        optimized = image.copy()
        optimized.thumbnail((size, size))
        dest = folder / f'{name}-{size}.webp'
        optimized.save(dest, 'WEBP', quality=84, method=6)
        print(dest, original, '->', optimized.size, dest.stat().st_size)
