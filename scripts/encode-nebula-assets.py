"""Run after build-nebula-assets.cjs; Pillow is an authoring dependency only."""
from pathlib import Path
import tempfile
from PIL import Image
out = Path(__file__).resolve().parents[1] / 'dist' / 'assets'
for name in ('canopy', 'horizon'):
    source = Path(tempfile.gettempdir()) / f'nebula-{name}-v1.png'
    target = out / f'nebula-{name}-v1.webp'
    with Image.open(source) as image:
        image.save(target, format='WEBP', quality=93, method=6)
    print(f'{target.name}: {target.stat().st_size} bytes')
